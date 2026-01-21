import { Request, Response } from 'express';
// import PdfPrinter from 'pdfmake';
const PdfPrinter = require('pdfmake/js/Printer').default;
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecSelFztFeld } from '../models/VDV/RecSelFztFeld';
import { Tagesart } from '../models/VDV/Tagesart';

// Use direct Sequelize logic or imported services?
// We will use Models directly.
import { LineController } from './LineController';
import { Op } from 'sequelize';
import { MengeFzgTyp } from '../models/VDV/MengeFzgTyp';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecOrt } from '../models/VDV/RecOrt';
import { BasisVersion } from '../models/VDV/BasisVersion';

const fonts = {
    Arial: {
        normal: '/System/Library/Fonts/Supplemental/Arial.ttf',
        bold: '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
        italics: '/System/Library/Fonts/Supplemental/Arial Italic.ttf',
        bolditalics: '/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf'
    }
};

export class KursblattController {
    private lineController = new LineController();

    // Helper to fetch stops
    private async getVariantStops(liNr: number, varId: string) {
        // Query LidVerlauf (sequence table)
        const verlauf = await LidVerlauf.findAll({
            where: {
                LI_NR: liNr,
                STR_LI_VAR: varId
            },
            include: [{
                model: RecOrt,
                as: 'ort', // Ensure this alias matches model definition
                required: false
            }],
            order: [['LI_LFD_NR', 'ASC']]
        });

        return verlauf.map((v: any) => ({
            ORT_NR: v.ORT_NR,
            ORT_REF_ORT: v.ort?.ORT_REF_ORT, // Access from joined RecOrt
            ORT_NAME: v.ort?.ORT_NAME || 'Unknown',
            ORT_REF_ORT_KUERZEL: v.ort?.ORT_REF_ORT_KUERZEL, // Or calculate
            ORT_REF_ORT_NAME: v.ort?.ORT_REF_ORT_NAME,
            LI_KNOTEN: v.LI_KNOTEN // Assuming this field exists in LidVerlauf or is determined elsewhere
        }));
    }

    async generatePdf(req: Request, res: Response) {
        try {
            const umUid = parseInt(req.params.id);
            if (!umUid) return res.status(400).send('Invalid UID');

            // 1. Load Data
            const umlauf = await RecUmlauf.findOne({ where: { UM_UID: umUid } });
            if (!umlauf) return res.status(404).send('Umlauf not found');

            const trips = await RecFrt.findAll({
                where: { UM_UID: umUid },
                order: [['FRT_START', 'ASC']]
            });

            if (!trips.length) return res.status(404).send('No trips found');

            const tagesart = await Tagesart.findOne({ where: { TAGESART_NR: umlauf.TAGESART_NR } });
            const dayText = tagesart?.TAGESART_TEXT || `Tagesart ${umlauf.TAGESART_NR}`;

            // Grouping Logic (Ported)
            const groups: RecFrt[][] = [];
            let currentGroup: RecFrt[] = [];

            for (const trip of trips) {
                if (currentGroup.length === 0) {
                    currentGroup.push(trip);
                } else {
                    const last = currentGroup[currentGroup.length - 1];
                    if (last.LI_NR !== trip.LI_NR || last.LI_KU_NR !== trip.LI_KU_NR) {
                        groups.push(currentGroup);
                        currentGroup = [trip];
                    } else {
                        currentGroup.push(trip);
                    }
                }
            }
            if (currentGroup.length > 0) groups.push(currentGroup);

            // Calculate Header Data
            // Ausfahrzeit: Minimum FRT_START
            const minStart = Math.min(...trips.map(t => t.FRT_START || 999999));
            const formatTime = (seconds: number) => {
                const h = Math.floor(seconds / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const hh = h < 10 ? `0${h}` : `${h}`;
                const mm = m < 10 ? `0${m}` : `${m}`;
                return `${hh}.${mm}`;
            };
            const ausfahrzeit = formatTime(minStart);

            // First Trip Line/Kurs (Assuming dominant for header, or just first)
            const firstTrip = trips[0];
            const headerLine = firstTrip.LI_NR;
            const headerKurs = firstTrip.LI_KU_NR;

            // Fetch BasisVersion
            const basisVersion = await BasisVersion.findOne({ where: { BASIS_VERSION: umlauf.BASIS_VERSION } });
            let basisVersionText = basisVersion?.BASIS_VERSION_TEXT || `Version ${umlauf.BASIS_VERSION}`;

            if (basisVersion?.GUELTIG_AB) {
                const d = new Date(basisVersion.GUELTIG_AB);
                const day = d.getDate().toString().padStart(2, '0');
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const year = d.getFullYear();
                basisVersionText += `, gültig ab ${day}.${month}.${year}`;
            }

            // PDF Content Builder
            const content: any[] = [];

            // Custom Header Layout - 4 columns, 2 rows
            content.push({
                columns: [
                    { width: '*', text: '' },
                    {
                        width: '80%',
                        table: {
                            widths: ['auto', '*', 'auto', 'auto'],
                            body: [
                                [
                                    { text: ausfahrzeit, style: 'headerTime', rowSpan: 2, alignment: 'center', margin: [0, 15, 0, 15] },
                                    { text: basisVersionText, fontSize: 12, margin: [0, 18, 0, 0] },
                                    { text: [{ text: 'Kurs:  ', fontSize: 12 }, { text: `${headerLine}/${headerKurs}`, style: 'headerLine' }] },
                                    { text: '' }
                                ],
                                [
                                    {},
                                    { text: 'Bhf: Betriebshof Sieker', fontSize: 12, margin: [0, 0, 0, 5] },
                                    { text: dayText, style: 'headerDayType' },
                                    { text: `${umlauf.UM_UID}`, fontSize: 30, bold: true }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0.5 : 0,
                            vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0,
                            paddingLeft: () => 10,
                            paddingRight: () => 10,
                            paddingTop: () => 10,
                            paddingBottom: () => 10
                        }
                    },
                    { width: '*', text: '' }
                ],
                margin: [0, 0, 0, 20]
            });

            // Process Groups
            for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                const group = groups[groupIndex];
                const first = group[0];
                const lineNr = first.LI_NR;
                const kursNr = first.LI_KU_NR;

                // --- SMART MERGE LOGIC START ---
                // Helper to fetch stops (reusing Logic from LineController if possible, or direct)
                // We need STOP objects with ORT_NR, ORT_REF_ORT, ORT_NAME, LI_KNOTEN

                const variantStopsMap = new Map<string, any[]>();
                const uniqueVars = [...new Set(group.map(t => t.STR_LI_VAR))];

                for (const v of uniqueVars) {
                    if (!v) continue;
                    const stops = await this.getVariantStops(lineNr!, v);
                    variantStopsMap.set(v, stops);
                }

                // ... (Smart Merge Logic omitted for brevity, logic remains same) ... 
                // Wait, replace_file_content replaces the whole block. I must ensure I don't lose the merge logic.
                // The prompt is "Replace header block... Add alignment to table". 
                // I need to target the Header insertion AND the Table insertion.
                // They are far apart. I should use MULTI_REPLACE or careful Single Replaces.
                // Let's do Single Replace for Header first, then Table.
                // Ah, Step 1: Header.


                // --- 2. Smart Merge Logic (Ported) ---
                // Find Skeleton (Longest Variant)
                let skeletonVar = uniqueVars[0];
                let maxSize = 0;
                for (const v of uniqueVars) {
                    if (v && variantStopsMap.get(v)!.length > maxSize) {
                        maxSize = variantStopsMap.get(v)!.length;
                        skeletonVar = v;
                    }
                }

                const skeletonStops = variantStopsMap.get(skeletonVar!) || [];

                // Clone for mutation safety
                let mergedStops = skeletonStops.map(s => ({ ...s }));

                // Mark first and last stops of skeleton as knoten (implicit endpoints)
                if (mergedStops.length > 0) {
                    mergedStops[0].LI_KNOTEN = true;
                    mergedStops[mergedStops.length - 1].LI_KNOTEN = true;
                }

                for (const v of uniqueVars) {
                    if (v === skeletonVar) continue;
                    const vStops = variantStopsMap.get(v!) || [];
                    if (!vStops.length) continue;

                    // Direction Detection
                    let forwardScore = 0;
                    let reverseScore = 0;

                    const getScore = (stops: any[]) => {
                        let score = 0;
                        let lastIdx = -1;
                        let matches = 0;
                        for (const s of stops) {
                            const idx = mergedStops.findIndex(ms => (ms.ORT_REF_ORT || ms.ORT_NR) === (s.ORT_REF_ORT || s.ORT_NR));
                            if (idx !== -1) {
                                if (lastIdx !== -1 && idx > lastIdx) score++;
                                if (lastIdx !== -1 && idx < lastIdx) score--;
                                lastIdx = idx;
                                matches++;
                            }
                        }
                        return matches > 0 ? score : 0;
                    };

                    forwardScore = getScore(vStops);
                    reverseScore = getScore([...vStops].reverse());

                    const stopsToMerge = (reverseScore > forwardScore) ? [...vStops].reverse() : vStops;

                    // Merge Loop
                    let lastMatchIndex = -1;

                    for (let i = 0; i < stopsToMerge.length; i++) {
                        const s = stopsToMerge[i];
                        const sRef = s.ORT_REF_ORT || s.ORT_NR;
                        const searchSpace = mergedStops.slice(lastMatchIndex + 1);
                        const relativeIndex = searchSpace.findIndex(ms => (ms.ORT_REF_ORT || ms.ORT_NR) === sRef);
                        const isImplicitKnoten = (i === 0 || i === stopsToMerge.length - 1);

                        if (relativeIndex !== -1) {
                            const matchIndex = (lastMatchIndex + 1) + relativeIndex;
                            // Union LI_KNOTEN
                            if (s.LI_KNOTEN === true || s.LI_KNOTEN === 1 || isImplicitKnoten) {
                                mergedStops[matchIndex].LI_KNOTEN = true;
                            }
                            lastMatchIndex = matchIndex;
                        } else {
                            // Insert
                            const newStop = { ...s };
                            if (isImplicitKnoten) newStop.LI_KNOTEN = true;
                            mergedStops.splice(lastMatchIndex + 1, 0, newStop);
                            lastMatchIndex++;
                        }
                    }
                }

                // Filter for Display (Headers) - Only Time Relevant
                console.log(`[DEBUG] Merged stops for Line ${lineNr}, Kurs ${kursNr}:`, mergedStops.map(s => ({
                    name: s.ORT_NAME,
                    ortNr: s.ORT_NR,
                    refOrt: s.ORT_REF_ORT,
                    knoten: s.LI_KNOTEN
                })));
                const displayStops = mergedStops.filter((s: any) => s.LI_KNOTEN === true || s.LI_KNOTEN === 1);
                console.log(`[DEBUG] Display stops (filtered):`, displayStops.map(s => `${s.ORT_NAME} (${s.ORT_REF_ORT_KUERZEL})`));

                // --- 3. Build Table Body ---
                // Header Row
                const tableBody: any[][] = [];
                const headerRow = [
                    { text: 'WZ', style: 'wzCell', bold: true },
                    { text: 'Route', style: 'tableCell', bold: true },
                    // ... map stops ...
                    ...displayStops.map((s: any) => ({
                        text: s.ORT_REF_ORT_KUERZEL || s.ORT_REF_ORT_NAME || s.ORT_NAME,
                        style: 'tableCell'
                        // bold: true // Removed per user request
                    })),
                    { text: 'Route', style: 'tableCell', bold: true },
                    { text: 'WZ', style: 'wzCell', bold: true }
                ];
                tableBody.push(headerRow);

                // --- 4. Process Trips (Times) ---
                // Need RecSelFztFeld for this group's Bereich
                const bereichNr = first.BEREICH_NR || 1;
                const fztList = await RecSelFztFeld.findAll({ raw: true });
                // Optimization: Fetching ALL might be heavy. Ideally filter by BEREICH_NRs in group.
                // For now, let's filter in memory or fetch specific.
                // Let's just fetch for the specific Bereich of the first trip to start.
                // If a trip has different bereich, we fetch again or pre-fetch unique bereichs.
                // let fztList = await RecSelFztFeld.findAll({ where: { BEREICH_NR: bereichNr }, raw: true });

                let lastTripEndSeconds = -1;

                for (const trip of group) {
                    // Check Bereich
                    // For simplicity, assuming same Bereich or global lookup. 
                    // Real implementation should handle mixed Areas.

                    // 1. Calculate Actual Times (Linear)
                    let tripStops = variantStopsMap.get(trip.STR_LI_VAR!) || [];
                    const startSeconds = trip.FRT_START || 0;

                    const tripTimeSequence: { ortNr: number, refId: number, time: number }[] = [];
                    let currentSeconds = startSeconds;

                    // Ensure stops exist
                    if (!tripStops) tripStops = [];

                    for (let i = 0; i < tripStops.length; i++) {
                        const stop = tripStops[i];
                        tripTimeSequence.push({
                            ortNr: stop.ORT_NR,
                            refId: stop.ORT_REF_ORT || stop.ORT_NR,
                            time: currentSeconds
                        });

                        if (i < tripStops.length - 1) {
                            const from = tripStops[i];
                            const to = tripStops[i + 1];
                            // FZT Lookup
                            let fzt = fztList.find(f => f.ORT_NR === from.ORT_NR && f.SEL_ZIEL === to.ORT_NR && f.BEREICH_NR === (trip.BEREICH_NR || 1));
                            if (!fzt) {
                                // Fallback Parent
                                const fromRef = from.ORT_REF_ORT || from.ORT_NR;
                                const toRef = to.ORT_REF_ORT || to.ORT_NR;
                                fzt = fztList.find(f => f.ORT_NR === fromRef && f.SEL_ZIEL === toRef && f.BEREICH_NR === (trip.BEREICH_NR || 1));
                            }
                            currentSeconds += (fzt?.SEL_FZT ?? 0);
                        }
                    }
                    const endSeconds = currentSeconds;

                    if (tripTimeSequence.length === 0) {
                        console.warn(`[Kursblatt] No stops found for Trip ${trip.FRT_FID}, Line ${trip.LI_NR}, Variant ${trip.STR_LI_VAR}. Skipping.`);
                        continue;
                    }

                    // 2. Snaking Map
                    // Determine Direction relative to Header (displayStops)
                    const getDipslayScore = (seq: any[]) => {
                        let score = 0;
                        let lastIdx = -1;
                        for (const item of seq) {
                            const idx = displayStops.findIndex(ds => (ds.ORT_REF_ORT || ds.ORT_NR) === item.refId);
                            if (idx !== -1) {
                                if (lastIdx !== -1 && idx > lastIdx) score++;
                                if (lastIdx !== -1 && idx < lastIdx) score--; // Reverse flow
                                lastIdx = idx;
                            }
                        }
                        return score;
                    };
                    const dirScore = getDipslayScore(tripTimeSequence);
                    const direction = dirScore >= 0 ? 1 : -1;

                    const rowData = new Array(displayStops.length).fill(null);
                    let colIdx = direction === 1 ? -1 : displayStops.length;
                    let hasUnderlinedStart = false; // Track if we've found the start

                    for (const tStop of tripTimeSequence) {
                        const ref = tStop.refId;
                        // Find all matches in displayCols
                        const matches = displayStops.map((s, i) => (s.ORT_REF_ORT || s.ORT_NR) === ref ? i : -1).filter(i => i !== -1);

                        if (!matches.length) continue;

                        let bestMatch = -1;
                        if (direction === 1) {
                            bestMatch = matches.find(m => m > colIdx) ?? -1;
                            if (bestMatch === -1) bestMatch = matches[0]; // Loop
                        } else {
                            bestMatch = matches.reverse().find(m => m < colIdx) ?? -1;
                            if (bestMatch === -1) bestMatch = matches[0];
                        }

                        if (bestMatch !== -1) {
                            const timeText = formatTime(tStop.time);
                            let decoration = undefined;
                            if (!hasUnderlinedStart) {
                                decoration = 'underline';
                                hasUnderlinedStart = true;
                            }
                            rowData[bestMatch] = { text: timeText, decoration: decoration };
                            colIdx = bestMatch;
                        }
                    }

                    // 3. WZ Logic
                    let wzA = '';
                    let wzE = '';
                    if (lastTripEndSeconds !== -1) {
                        const diff = Math.round((startSeconds - lastTripEndSeconds) / 60);
                        if (diff >= 0 && diff < 120) {
                            const waitStr = diff.toString();
                            // Logic: If trip creates a "U" shape (End -> Start), display on appropriate side.
                            // Simple heuristic: If first stop matches First Column -> Left (WZ_A).
                            // If first stop matches Last Column -> Right (WZ_E).
                            const firstColRef = displayStops.length ? (displayStops[0].ORT_REF_ORT || displayStops[0].ORT_NR) : -1;
                            const lastColRef = displayStops.length ? (displayStops[displayStops.length - 1].ORT_REF_ORT || displayStops[displayStops.length - 1].ORT_NR) : -1;

                            const tripStartRef = tripTimeSequence[0].refId;

                            if (tripStartRef === firstColRef) wzA = waitStr;
                            else if (tripStartRef === lastColRef) wzE = waitStr;
                            else wzA = waitStr; // Default
                        }
                    }
                    lastTripEndSeconds = endSeconds;

                    // Determine Route Text Placement
                    const routeText = trip.STR_LI_VAR || '';
                    const routeA = (direction === 1) ? routeText : '';
                    const routeE = (direction !== 1) ? routeText : '';

                    // Add Row to Table Body
                    const row: any[] = [
                        { text: wzA, style: 'wzCell' },
                        { text: routeA, style: 'tableCell', bold: true }, // Route A
                        ...rowData.map(d => ({
                            text: d ? d.text : '-',
                            style: 'tableCell',
                            decoration: d ? d.decoration : undefined
                        })),
                        { text: routeE, style: 'tableCell', bold: true }, // Route E
                        { text: wzE, style: 'wzCell' }
                    ];
                    tableBody.push(row);
                }

                content.push({
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: '80%',
                            table: {
                                headerRows: 1,
                                widths: ['*', '*', ...displayStops.map(() => '*'), '*', '*'],
                                body: tableBody
                            },
                            layout: {
                                fillColor: function (rowIndex: number, node: any, columnIndex: number) {
                                    // Header (0) -> White
                                    // Row 1 -> White
                                    // Row 2 -> Gray
                                    // Row 3 -> White
                                    if (rowIndex === 0) return null;
                                    if (rowIndex === 1) return null;
                                    return (rowIndex % 2 === 0) ? '#c9c9c9' : null;
                                }
                            }
                        },
                        { width: '*', text: '' }
                    ],
                    // alignment: 'center' // Handled by columns
                });

                content.push({ text: '\n' });

                // Check for next group (Change of Line/Course)
                if (groupIndex < groups.length - 1) {
                    const nextGroup = groups[groupIndex + 1];
                    if (nextGroup.length > 0) {
                        const nextTrip = nextGroup[0];
                        content.push({
                            text: `weiter als ${nextTrip.LI_NR}/${nextTrip.LI_KU_NR}`,
                            alignment: 'center',
                            fontSize: 12,
                            bold: true,
                            margin: [0, 0, 0, 10]
                        });
                    }
                }
            }

            // Generate PDF
            const printer = new PdfPrinter(fonts);
            const docDefinition: any = { // Cast to any to avoid strict lint on styles
                content: content,
                styles: {
                    headerTime: { fontSize: 35, bold: true },
                    headerLine: { fontSize: 30, bold: true },
                    headerDayType: { fontSize: 30, bold: true },
                    tableCell: { fontSize: 12, alignment: 'center' },
                    wzCell: { fontSize: 12, bold: true, alignment: 'center' }
                },
                defaultStyle: { font: 'Arial', fontSize: 10 },
                pageOrientation: 'portrait',
                pageSize: 'A3'
            };

            const pdfDoc = await printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=kursblatt_${umUid}.pdf`);
            pdfDoc.pipe(res);
            pdfDoc.end();

        } catch (e) {
            console.error(e);
            console.error(e);
            res.status(500).send('Error generating PDF');
        }
    }
}
