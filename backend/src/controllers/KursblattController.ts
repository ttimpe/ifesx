import { Request, Response } from 'express';
// import PdfPrinter from 'pdfmake';
const PdfPrinter = require('pdfmake/js/Printer').default;
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecLid } from '../models/VDV/RecLid';
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

// Use fonts bundled with pdfmake for cross-platform compatibility
const fonts = {
    Roboto: {
        normal: require.resolve('pdfmake/build/vfs_fonts').replace('vfs_fonts.js', '../fonts/Roboto/Roboto-Regular.ttf'),
        bold: require.resolve('pdfmake/build/vfs_fonts').replace('vfs_fonts.js', '../fonts/Roboto/Roboto-Medium.ttf'),
        italics: require.resolve('pdfmake/build/vfs_fonts').replace('vfs_fonts.js', '../fonts/Roboto/Roboto-Italic.ttf'),
        bolditalics: require.resolve('pdfmake/build/vfs_fonts').replace('vfs_fonts.js', '../fonts/Roboto/Roboto-MediumItalic.ttf')
    }
};

// Helper for Roman Numerals
function toRoman(num: number): string {
    if (num < 1) return "";
    const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (const i in lookup) {
        while (num >= lookup[i]) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
}

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

            // Calculate Ausfahrzeit (Global Min)
            const minStart = Math.min(...trips.map(t => t.FRT_START || 999999));
            const formatTime = (seconds: number) => {
                const h = Math.floor(seconds / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const hh = h < 10 ? `0${h}` : `${h}`;
                const mm = m < 10 ? `0${m}` : `${m}`;
                return `${hh}.${mm}`;
            };
            const ausfahrzeit = formatTime(minStart); // Only shown on first page

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

            // PDF Content Builder
            const content: any[] = [];
            let sheetCounter = 1;

            // Flatten Groups into Task Queue
            interface PdfTask {
                type: 'trip' | 'separator';
                data?: RecFrt;
                meta?: { line: number, kurs: number };
            }
            const taskQueue: PdfTask[] = [];

            for (let i = 0; i < groups.length; i++) {
                groups[i].forEach(trip => taskQueue.push({ type: 'trip', data: trip }));
                if (i < groups.length - 1) {
                    const next = groups[i + 1][0];
                    taskQueue.push({ type: 'separator', meta: { line: next.LI_NR!, kurs: next.LI_KU_NR! } });
                }
            }

            // Constants for Layout
            const PAGE_HEIGHT = 841.89; // A4 Portrait
            const MARGINS = 40;
            const USABLE_HEIGHT = PAGE_HEIGHT - MARGINS;
            const HEADER_HEIGHT = 220; // Increased safety margin (was 160)
            const ROW_HEIGHT = 18;     // Increased per-row estimate (was 14)
            const SEPARATOR_HEIGHT = 25;
            const FOOTER_BASE_HEIGHT = 20; // Base spacing for footer
            const FOOTER_LINE_HEIGHT = 12; // Per variant line

            // Page Builder Loop
            while (taskQueue.length > 0) {
                const pageTasks: PdfTask[] = [];
                let currentHeight = HEADER_HEIGHT;

                // 1. Fill Page
                for (let i = 0; i < taskQueue.length; i++) {
                    const task = taskQueue[i];

                    let addedHeight = 0;
                    let addedFooterHeight = 0;

                    if (task.type === 'separator') {
                        addedHeight = SEPARATOR_HEIGHT;
                    } else if (task.type === 'trip') {
                        addedHeight = ROW_HEIGHT;

                        // Check if this trip adds a new Variant to the Footer
                        const trip = task.data!;
                        const currentVars = new Set(pageTasks.filter(t => t.type === 'trip').map(t => t.data!.STR_LI_VAR));
                        if (trip.STR_LI_VAR && !currentVars.has(trip.STR_LI_VAR)) {
                            addedFooterHeight = FOOTER_LINE_HEIGHT;
                        }
                    }

                    // Check bounds
                    const currentFooterHeight = FOOTER_BASE_HEIGHT + (new Set(pageTasks.filter(t => t.type === 'trip').map(t => t.data!.STR_LI_VAR)).size * FOOTER_LINE_HEIGHT);

                    const totalNeeded = currentHeight + addedHeight + currentFooterHeight + addedFooterHeight;

                    if (totalNeeded > USABLE_HEIGHT && pageTasks.length > 0) {
                        break;
                    }

                    pageTasks.push(task);
                    currentHeight += addedHeight;
                }

                // Consume tasks
                taskQueue.splice(0, pageTasks.length);

                // 2. Render Page
                if (pageTasks.length === 0) break; // Safety

                if (content.length > 0) content.push({ text: '', pageBreak: 'before' });

                // Header Info (First Trip)
                const firstTripTask = pageTasks.find(t => t.type === 'trip');
                if (!firstTripTask) continue;
                const firstTrip = firstTripTask.data!;
                const lineNr = firstTrip.LI_NR;
                const kursNr = firstTrip.LI_KU_NR;

                const ausfahrzeitDisplay = (sheetCounter === 1) ? ausfahrzeit : '';
                const sheetRoman = toRoman(sheetCounter++);
                const umlaufText = `${umlauf.UM_UID} ${sheetRoman}`;

                // Header Block
                content.push({
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: '90%',
                            table: {
                                widths: ['auto', '*', 'auto', 'auto'],
                                body: [
                                    [
                                        { text: ausfahrzeitDisplay, style: 'headerTime', rowSpan: 2, alignment: 'center', margin: [0, 15, 0, 15] },
                                        { text: basisVersionText, fontSize: 10, margin: [0, 18, 0, 0] },
                                        { text: [{ text: 'Kurs:  ', fontSize: 10 }, { text: `${lineNr}/${kursNr}`, style: 'headerLine' }] },
                                        { text: '' }
                                    ],
                                    [
                                        {},
                                        { text: 'Bhf: Betriebshof Sieker', fontSize: 10, margin: [0, 0, 0, 5] },
                                        { text: dayText, style: 'headerDayType' },
                                        { text: umlaufText, fontSize: 24, bold: true }
                                    ]
                                ]
                            },
                            layout: {
                                hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0.5 : 0,
                                vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length) ? 0.5 : 0,
                                paddingLeft: () => 5,
                                paddingRight: () => 5,
                                paddingTop: () => 5,
                                paddingBottom: () => 5
                            }
                        },
                        { width: '*', text: '' }
                    ],
                    margin: [0, 0, 0, 10]
                });

                // Render Content (Tables + Separators)
                let currentChunk: RecFrt[] = [];

                const renderChunk = async (trips: RecFrt[]) => {
                    if (trips.length === 0) return;

                    const chunkLine = trips[0].LI_NR!;

                    // --- SMART MERGE LOGIC START ---
                    const variantStopsMap = new Map<string, any[]>();
                    const uniqueVars = [...new Set(trips.map(t => t.STR_LI_VAR))];

                    for (const v of uniqueVars) {
                        if (!v) continue;
                        const stops = await this.getVariantStops(chunkLine, v);
                        variantStopsMap.set(v, stops);
                    }

                    let skeletonVar = uniqueVars[0];
                    let maxSize = 0;
                    for (const v of uniqueVars) {
                        if (v && variantStopsMap.get(v)!.length > maxSize) {
                            maxSize = variantStopsMap.get(v)!.length;
                            skeletonVar = v;
                        }
                    }
                    const skeletonStops = variantStopsMap.get(skeletonVar!) || [];
                    let mergedStops = skeletonStops.map(s => ({ ...s }));
                    if (mergedStops.length > 0) {
                        mergedStops[0].LI_KNOTEN = true;
                        mergedStops[mergedStops.length - 1].LI_KNOTEN = true;
                    }

                    for (const v of uniqueVars) {
                        if (v === skeletonVar) continue;
                        const vStops = variantStopsMap.get(v!) || [];
                        if (!vStops.length) continue;

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

                        let lastMatchIndex = -1;
                        for (let i = 0; i < stopsToMerge.length; i++) {
                            const s = stopsToMerge[i];
                            const sRef = s.ORT_REF_ORT || s.ORT_NR;
                            const searchSpace = mergedStops.slice(lastMatchIndex + 1);
                            const relativeIndex = searchSpace.findIndex(ms => (ms.ORT_REF_ORT || ms.ORT_NR) === sRef);
                            const isImplicitKnoten = (i === 0 || i === stopsToMerge.length - 1);
                            if (relativeIndex !== -1) {
                                const matchIndex = (lastMatchIndex + 1) + relativeIndex;
                                if (s.LI_KNOTEN === true || s.LI_KNOTEN === 1 || isImplicitKnoten) mergedStops[matchIndex].LI_KNOTEN = true;
                                lastMatchIndex = matchIndex;
                            } else {
                                const newStop = { ...s };
                                if (isImplicitKnoten) newStop.LI_KNOTEN = true;
                                mergedStops.splice(lastMatchIndex + 1, 0, newStop);
                                lastMatchIndex++;
                            }
                        }
                    }

                    const displayStops = mergedStops.filter((s: any) => s.LI_KNOTEN === true || s.LI_KNOTEN === 1);

                    const tableBody: any[][] = [];
                    tableBody.push([
                        { text: 'WZ', style: 'wzCell', bold: true },
                        { text: 'Route', style: 'tableCell', bold: true },
                        ...displayStops.map((s: any) => ({ text: s.ORT_REF_ORT_KUERZEL || s.ORT_REF_ORT_NAME || s.ORT_NAME, style: 'tableCell' })),
                        { text: 'Route', style: 'tableCell', bold: true },
                        { text: 'WZ', style: 'wzCell', bold: true }
                    ]);

                    const fztList = await RecSelFztFeld.findAll({ raw: true });
                    let lastTripEndSeconds = -1;

                    for (const trip of trips) {
                        let tripStops = variantStopsMap.get(trip.STR_LI_VAR!) || [];
                        const startSeconds = trip.FRT_START || 0;
                        const tripTimeSequence: any[] = [];
                        let currentSeconds = startSeconds;

                        for (let i = 0; i < tripStops.length; i++) {
                            const stop = tripStops[i];
                            tripTimeSequence.push({ refId: stop.ORT_REF_ORT || stop.ORT_NR, time: currentSeconds });
                            if (i < tripStops.length - 1) {
                                const from = tripStops[i];
                                const to = tripStops[i + 1];
                                let fzt = fztList.find(f => f.ORT_NR === from.ORT_NR && f.SEL_ZIEL === to.ORT_NR);
                                if (!fzt) {
                                    const fromRef = from.ORT_REF_ORT || from.ORT_NR;
                                    const toRef = to.ORT_REF_ORT || to.ORT_NR;
                                    fzt = fztList.find(f => f.ORT_NR === fromRef && f.SEL_ZIEL === toRef);
                                }
                                currentSeconds += (fzt?.SEL_FZT ?? 0);
                            }
                        }
                        const endSeconds = currentSeconds;

                        const getDipslayScore = (seq: any[]) => {
                            let score = 0; let lastIdx = -1;
                            for (const item of seq) {
                                const idx = displayStops.findIndex(ds => (ds.ORT_REF_ORT || ds.ORT_NR) === item.refId);
                                if (idx !== -1) {
                                    if (lastIdx !== -1 && idx > lastIdx) score++;
                                    if (lastIdx !== -1 && idx < lastIdx) score--;
                                    lastIdx = idx;
                                }
                            }
                            return score;
                        };
                        const direction = getDipslayScore(tripTimeSequence) >= 0 ? 1 : -1;

                        const rowData = new Array(displayStops.length).fill(null);
                        let colIdx = direction === 1 ? -1 : displayStops.length;
                        let hasUnderlinedStart = false;

                        for (const tStop of tripTimeSequence) {
                            const matches = displayStops.map((s, i) => (s.ORT_REF_ORT || s.ORT_NR) === tStop.refId ? i : -1).filter(i => i !== -1);
                            if (!matches.length) continue;
                            let bestMatch = -1;
                            if (direction === 1) {
                                bestMatch = matches.find(m => m > colIdx) ?? -1;
                                if (bestMatch === -1) bestMatch = matches[0];
                            } else {
                                bestMatch = matches.reverse().find(m => m < colIdx) ?? -1;
                                if (bestMatch === -1) bestMatch = matches[0];
                            }
                            if (bestMatch !== -1) {
                                let decoration = undefined;
                                if (!hasUnderlinedStart) { decoration = 'underline'; hasUnderlinedStart = true; }
                                rowData[bestMatch] = { text: formatTime(tStop.time), decoration };
                                colIdx = bestMatch;
                            }
                        }

                        let wzA = '', wzE = '';
                        if (lastTripEndSeconds !== -1) {
                            const diff = Math.round((startSeconds - lastTripEndSeconds) / 60);
                            if (diff >= 0 && diff < 120) {
                                const waitStr = diff.toString();
                                const firstColRef = displayStops[0] ? (displayStops[0].ORT_REF_ORT || displayStops[0].ORT_NR) : -1;
                                const lastColRef = displayStops[displayStops.length - 1] ? (displayStops[displayStops.length - 1].ORT_REF_ORT || displayStops[displayStops.length - 1].ORT_NR) : -1;
                                if (tripTimeSequence[0].refId === firstColRef) wzA = waitStr;
                                else if (tripTimeSequence[0].refId === lastColRef) wzE = waitStr;
                                else wzA = waitStr;
                            }
                        }
                        lastTripEndSeconds = endSeconds;

                        tableBody.push([
                            { text: wzA, style: 'wzCell' },
                            { text: direction === 1 ? trip.STR_LI_VAR : '', style: 'tableCell', bold: true },
                            ...rowData.map(d => ({ text: d ? d.text : '-', style: 'tableCell', decoration: d?.decoration })),
                            { text: direction !== 1 ? trip.STR_LI_VAR : '', style: 'tableCell', bold: true },
                            { text: wzE, style: 'wzCell' }
                        ]);
                    }

                    content.push({
                        columns: [{ width: '*', text: '' }, {
                            width: '90%',
                            table: {
                                headerRows: 1,
                                widths: ['auto', 'auto', ...displayStops.map(() => '*'), 'auto', 'auto'],
                                body: tableBody
                            },
                            layout: { fillColor: function (rowIndex: number) { if (rowIndex <= 1) return null; return (rowIndex % 2 === 0) ? '#e6e6e6' : null; } }
                        }, { width: '*', text: '' }]
                    });
                };

                for (const task of pageTasks) {
                    if (task.type === 'trip') {
                        currentChunk.push(task.data!);
                    } else if (task.type === 'separator') {
                        if (currentChunk.length > 0) {
                            await renderChunk(currentChunk);
                            currentChunk = [];
                        }
                        // "Weiter als" - Aligned to table (90% width)
                        content.push({
                            columns: [
                                { width: '*', text: '' },
                                {
                                    width: '90%',
                                    text: `weiter als ${task.meta!.line}/${task.meta!.kurs}`,
                                    alignment: 'left',
                                    fontSize: 12,
                                    bold: true,
                                    margin: [0, 5, 0, 5]
                                },
                                { width: '*', text: '' }
                            ]
                        });
                    }
                }
                if (currentChunk.length > 0) {
                    await renderChunk(currentChunk);
                }

                // Footer (Variants) specific to THIS Page
                // Must track Line Number because Variant IDs are only unique per Line.
                const pageVars = new Map<string, number>(); // Key: "Line-Var", Value: LineNr
                for (const t of pageTasks) {
                    if (t.type === 'trip' && t.data?.STR_LI_VAR) {
                        const key = `${t.data.LI_NR}-${t.data.STR_LI_VAR}`;
                        pageVars.set(key, t.data.LI_NR!);
                    }
                }

                const variantsInfo: string[] = [];
                for (const [key, vLineNr] of pageVars) {
                    const v = key.split('-')[1]; // Extract Variant ID
                    if (!v) continue;

                    const lid = await RecLid.findOne({
                        where: { LI_NR: vLineNr, STR_LI_VAR: v, BASIS_VERSION: umlauf.BASIS_VERSION }
                    });

                    let desc = `R${v}`;
                    if (lid && lid.LIDNAME) desc += `: ${lid.LIDNAME}`;
                    else {
                        const stops = await this.getVariantStops(vLineNr, v);
                        if (stops.length > 0) desc += `: ${stops[0].ORT_NAME} - ${stops[stops.length - 1].ORT_NAME}`;
                    }
                    variantsInfo.push(desc);
                }

                if (variantsInfo.length > 0) {
                    // Footer - Aligned to table (90% width)
                    content.push({
                        columns: [
                            { width: '*', text: '' },
                            {
                                width: '90%',
                                text: variantsInfo.join('\n'),
                                fontSize: 8,
                                margin: [0, 10, 0, 0],
                                color: '#555',
                                alignment: 'left'
                            },
                            { width: '*', text: '' }
                        ]
                    });
                }
            }

            const printer = new PdfPrinter(fonts);
            const docDefinition: any = {
                content: content,
                styles: {
                    headerTime: { fontSize: 35, bold: true },
                    headerLine: { fontSize: 26, bold: true },
                    headerDayType: { fontSize: 26, bold: true },
                    tableCell: { fontSize: 9, alignment: 'center' },
                    wzCell: { fontSize: 9, bold: true, alignment: 'center' }
                },
                defaultStyle: { font: 'Roboto', fontSize: 10 },
                pageOrientation: 'portrait',
                pageSize: 'A4',
                pageMargins: [20, 20, 20, 20]
            };

            const pdfDoc = await printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=kursblatt_${umUid}.pdf`);
            pdfDoc.pipe(res);
            pdfDoc.end();

        } catch (e) {
            console.error(e);
            res.status(500).send('Error generating PDF');
        }
    }
}
