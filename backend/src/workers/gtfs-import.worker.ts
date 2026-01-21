
const { parentPort, workerData } = require('worker_threads');
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { parse } from '@fast-csv/parse';

// Import Database and Models (Worker needs its own connection)
import { initDB } from '../config/database';
import { BasisVersion } from '../models/VDV/BasisVersion';
import { RecOrt } from '../models/VDV/RecOrt';
import { RecHp } from '../models/VDV/RecHp';
import { RecLid } from '../models/VDV/RecLid';
import { RecZnr } from '../models/VDV/RecZnr';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';
import { MengeFgr } from '../models/VDV/MengeFgr';
import { RecSel } from '../models/VDV/RecSel';
import { RecSelFztFeld } from '../models/VDV/RecSelFztFeld';
import { MengeBereich } from '../models/VDV/MengeBereich';

// Helper to report progress
const reportProgress = (stage: string, current: number, total: number, details: string = '', completed: boolean = false) => {
    if (parentPort) {
        parentPort.postMessage({
            type: 'progress',
            payload: {
                stage,
                current,
                total,
                details,
                completed
            }
        });
    }
};

const readCsv = async (zip: AdmZip, filename: string): Promise<any[]> => {
    const entry = zip.getEntry(filename);
    if (!entry) return [];
    const content = zip.readAsText(entry);

    return new Promise((resolve, reject) => {
        const rows: any[] = [];
        const stream = parse({ headers: true })
            .on('error', error => reject(error))
            .on('data', row => rows.push(row))
            .on('end', () => resolve(rows));
        stream.write(content);
        stream.end();
    });
};

const timeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    if (parts.length !== 3) return 0;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = parseInt(parts[2], 10);
    return h * 3600 + m * 60 + s;
};

// Main Import Logic
const runImport = async () => {
    try {
        const { tempFile, agencyId, basisVersion, importId } = workerData;
        const filePath = path.join(process.cwd(), 'uploads', tempFile);

        // Init DB
        await initDB();

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        reportProgress('Initialisierung', 0, 1, 'File loading...');

        const zip = new AdmZip(filePath);
        const BASIS_VERSION = Number(basisVersion);

        // 0. Update Basis Version
        let validityDate: Date | undefined;
        try {
            const feedInfo = await readCsv(zip, 'feed_info.txt');
            if (feedInfo.length > 0 && feedInfo[0].feed_start_date) {
                const dStr = feedInfo[0].feed_start_date;
                const year = parseInt(dStr.substring(0, 4));
                const month = parseInt(dStr.substring(4, 6)) - 1;
                const day = parseInt(dStr.substring(6, 8));
                validityDate = new Date(year, month, day);
            } else {
                const calendar = await readCsv(zip, 'calendar.txt');
                if (calendar.length > 0) {
                    const minDate = calendar.reduce((min: any, c: any) => {
                        return (!min || c.start_date < min) ? c.start_date : min;
                    }, '');
                    if (minDate) {
                        const year = parseInt(minDate.substring(0, 4));
                        const month = parseInt(minDate.substring(4, 6)) - 1;
                        const day = parseInt(minDate.substring(6, 8));
                        validityDate = new Date(year, month, day);
                    }
                }
            }
        } catch (e) {
            console.warn('[GTFS Worker] Could not determining validity date:', e);
        }

        await BasisVersion.upsert({
            BASIS_VERSION,
            BASIS_VERSION_TEXT: `Version ${BASIS_VERSION}`,
            GUELTIG_AB: validityDate
        });

        // 1. Routes
        reportProgress('Reading Routes', 0, 100);
        const allRoutes = await readCsv(zip, 'routes.txt');
        const agencyRoutes = allRoutes.filter(r => {
            if (!r.agency_id) return true;
            return String(r.agency_id).trim() === String(agencyId).trim();
        });
        const routeIds = new Set(agencyRoutes.map(r => r.route_id));

        // 2. Trips
        reportProgress('Reading Trips', 0, 100);
        const allTrips = await readCsv(zip, 'trips.txt');
        const agencyTrips = allTrips.filter(t => routeIds.has(t.route_id));
        const tripIds = new Set(agencyTrips.map(t => t.trip_id));

        // 3. Stop Times
        reportProgress('Reading StopTimes', 0, 100);
        const allStopTimes = await readCsv(zip, 'stop_times.txt');
        const agencyStopTimes = allStopTimes.filter(st => tripIds.has(st.trip_id));

        const usedStopIds = new Set<string>();
        const tripPatterns = new Map<string, any[]>();

        agencyStopTimes.forEach(st => {
            usedStopIds.add(st.stop_id);
            if (!tripPatterns.has(st.trip_id)) {
                tripPatterns.set(st.trip_id, []);
            }
            tripPatterns.get(st.trip_id)!.push({
                stop_id: st.stop_id,
                seq: parseInt(st.stop_sequence),
                arr: st.arrival_time,
                dep: st.departure_time
            });
        });

        tripPatterns.forEach(p => p.sort((a: any, b: any) => a.seq - b.seq));

        // 4. Stops
        const allStops = await readCsv(zip, 'stops.txt');
        const usedStops = allStops.filter(s => usedStopIds.has(s.stop_id));

        // --- IMPORT STOPS (VDV Refactor) ---
        reportProgress('Processing Stops', 0, usedStops.length);

        // DHID: LAND:GEMEINDESCHLÜSSEL:ORT_REF_ORT_LANGNR:MASTNR:HALTEPUNKT_NR
        // Example: de:05711:5272:77:77 (or without Mast/Hp)

        // Maps to track existing/created entities to reuse IDs
        // Map<ORT_REF_ORT_LANGNR (string), ORT_NR (number)>
        // Uses string key because LANGNR comes from DHID string
        const parentOrtMap = new Map<string, number>();

        // Map<Full DHID (string), ORT_NR (number)>
        // For children stops (Steige/Maste)
        const childOrtMap = new Map<string, number>();

        // Map<Full DHID (string), ORT_NR (number)> for lookups in Line/Trip processing
        // Stores the ORT_NR of the CHILD (the one referenced in stop_times)
        const stopIdToOrtNr = new Map<string, number>();

        // Map<ORT_NR, RecOrt>
        const ortsToCreate = new Map<number, any>();
        const hpsToCreate: any[] = [];

        // Create a Map for fast stop lookup
        const stopDataMap = new Map(allStops.map(s => [s.stop_id, s]));

        // Determine Stop Order based on Lines
        const orderedStopIds = new Set<string>();

        // Sort routes numerically by short_name
        agencyRoutes.sort((a, b) => {
            const numA = parseInt(a.route_short_name.replace(/\D/g, ''), 10) || 999999;
            const numB = parseInt(b.route_short_name.replace(/\D/g, ''), 10) || 999999;
            return numA - numB;
        });

        // Collect stops in order
        for (const route of agencyRoutes) {
            const routeTrips = agencyTrips.filter(t => t.route_id === route.route_id);
            // Sort trips? Optional. Maybe longest first?
            // Just iterate all to ensure we catch all stops on this line
            for (const trip of routeTrips) {
                const pattern = tripPatterns.get(trip.trip_id);
                if (pattern) {
                    pattern.forEach(p => orderedStopIds.add(p.stop_id));
                }
            }
        }

        // Add remaining used stops that weren't on any route (unlikely for valid GTFS but safe)
        for (const s of usedStops) {
            orderedStopIds.add(s.stop_id);
        }

        // Counter for sequential ORT_NR
        // User requested starting at 1001 for Line 1
        const maxOrtNr = await RecOrt.max('ORT_NR', { where: { BASIS_VERSION } }) as number || 1000;
        let nextOrtNr = maxOrtNr < 1000 ? 1000 : maxOrtNr;

        const getNextOrtNr = () => {
            nextOrtNr++;
            return nextOrtNr;
        };

        const parseDhidV2 = (dhid: string) => {
            const cleanDhid = dhid.replace('_Parent', '');
            const parts = cleanDhid.split(':');
            // Assuming default format: land:gemeinde:langnr:mast:hp
            const land = parts[0] || '';
            const gemeinde = parts[1] || '';
            const refOrtLangNr = parts[2] || '';
            return {
                land,
                gemeinde,
                refOrtLangNr,
                mastNr: parts[3] || '',
                hpNr: parts[4] || '',
                parentKey: `${land}:${gemeinde}:${refOrtLangNr}`
            };
        };

        // 1. Prepare Parent Info from all stops
        // Map clean stop_id (and parent keys) to Name/Code
        const parentInfo = new Map<string, { name: string, code: string }>();

        for (const s of allStops) {
            const cleanId = s.stop_id.replace('_Parent', '');
            const { parentKey, refOrtLangNr, mastNr, hpNr } = parseDhidV2(s.stop_id);

            // Register direct ID (useful for parent_station lookup)
            parentInfo.set(cleanId, { name: s.stop_name, code: s.stop_code });

            if ((refOrtLangNr && !mastNr && !hpNr) || s.location_type === '1') {
                parentInfo.set(parentKey, { name: s.stop_name, code: s.stop_code });
            }
        }

        // --- ID Generation State ---
        let nextParentId = 1000; // Parents start at 1000
        const parentChildCountMap = new Map<number, number>(); // Track children per parent ID

        let stopCount = 0;
        // Iterate over ORDERED stops
        for (const stopId of orderedStopIds) {
            const s = stopDataMap.get(stopId);
            if (!s) continue;

            stopCount++;
            if (stopCount % 100 === 0) reportProgress('Processing Stops', stopCount, orderedStopIds.size);

            // Skip strict parents (we only import children as RecOrt)
            if (s.location_type === '1') continue;

            const { parentKey, refOrtLangNr, mastNr, hpNr } = parseDhidV2(s.stop_id);
            if (!refOrtLangNr) continue; // Skip invalid DHIDs

            // Determine Parent Lookup Key (Priority: parent_station > DHID parentKey)
            let lookupKey = parentKey;
            if (s.parent_station) {
                lookupKey = s.parent_station.replace('_Parent', '');
            }

            // Determine Parent Name
            const pInfo = parentInfo.get(lookupKey);
            let parentName = pInfo ? pInfo.name : (s.parent_station ? 'Unknown Parent' : s.stop_name);
            let parentCode = pInfo ? pInfo.code : (s.stop_code || '');

            // Fallback: If no parent_station and derived parent not found, use own name
            if (!pInfo && !s.parent_station) parentName = s.stop_name;

            // Manage Parent Reference (ORT_REF_ORT) - Short Sequential ID (1000+)
            let parentRefOrtId = parentOrtMap.get(lookupKey);
            if (!parentRefOrtId) {
                // New Parent
                parentRefOrtId = nextParentId++;
                parentOrtMap.set(lookupKey, parentRefOrtId);
            }

            // Calculate Child ORT_NR based on Parent (Parent * 100 + Index)
            // Example: Parent 1001 -> Child 100101, 100102...
            let childIndex = parentChildCountMap.get(parentRefOrtId) || 0;
            childIndex++;
            parentChildCountMap.set(parentRefOrtId, childIndex);

            const ortNr = (parentRefOrtId * 100) + childIndex;
            stopIdToOrtNr.set(s.stop_id, ortNr);

            // Original DHID int value for LangNr field
            // Use refOrtLangNr from the PARENT KEY if possible (for Grouping Badge)
            // Or fallback to parsed refOrtLangNr from child if parent lookup matches child parentKey
            let parentLangNr = 0;
            const lookupParts = lookupKey.split(':');
            if (lookupParts.length >= 3) {
                parentLangNr = parseInt(lookupParts[2], 10) || 0;
            } else {
                // Try to fallback to child's inferred parent LangNr
                parentLangNr = parseInt(refOrtLangNr, 10) || 0;
            }

            // Use Map.set
            ortsToCreate.set(ortNr, {
                ORT_NR: ortNr,
                BASIS_VERSION,
                ONR_TYP_NR: 1, // 1 = Haltestelle/Ort
                ORT_NAME: s.stop_name,
                ORT_REF_ORT: parentRefOrtId, // Sequential internal ID
                ORT_REF_ORT_LangNr: parentLangNr, // The "5081" goes here (Parent's ID)
                ORT_REF_ORT_NAME: parentName, // Parent Name
                ORT_REF_ORT_KUERZEL: parentCode || null,
                HST_NR_INTERNATIONAL: s.stop_id,
                ORT_POS_LAENGE: Math.round(parseFloat(s.stop_lon) * 10000000),
                ORT_POS_BREITE: Math.round(parseFloat(s.stop_lat) * 10000000),
                ORT_POS_HOEHE: 0
            });

            // Create HP (Haltepunkt)
            // If hpNr exists
            if (hpNr || mastNr) {
                const finalHpNr = parseInt(hpNr || mastNr || '0', 10);
                if (finalHpNr > 0) {
                    hpsToCreate.push({
                        BASIS_VERSION,
                        ORT_NR: ortNr,
                        HALTEPUNKT_NR: finalHpNr,
                        ONR_TYP_NR: 1,
                        ZUSATZ_INFO: s.platform_code || mastNr || null,
                        DHID: s.stop_id
                    });
                }
            }
        }

        // DB Insert Stops
        reportProgress('Importing Places', 0, ortsToCreate.size);
        const ortsArray = Array.from(ortsToCreate.values());

        // Chunk inserts
        for (let i = 0; i < ortsArray.length; i += 100) {
            const chunk = ortsArray.slice(i, i + 100);
            reportProgress('Importing Places', i, ortsArray.length);

            for (const ort of chunk) {
                const exists = await RecOrt.findOne({ where: { ORT_NR: ort.ORT_NR, BASIS_VERSION } });
                if (!exists) {
                    await RecOrt.create(ort);
                }
            }
        }

        // DB Insert Hps
        reportProgress('Importing Stop Points', 0, hpsToCreate.length);
        for (let i = 0; i < hpsToCreate.length; i += 100) {
            const chunk = hpsToCreate.slice(i, i + 100);
            reportProgress('Importing Stop Points', i, hpsToCreate.length);
            for (const hp of chunk) {
                const exists = await RecHp.findOne({ where: { ORT_NR: hp.ORT_NR, HALTEPUNKT_NR: hp.HALTEPUNKT_NR, BASIS_VERSION } });
                if (!exists) {
                    await RecHp.create(hp);
                }
            }
        }

        // --- IMPORT AREAS (MENGE_BEREICH) ---
        // Map common GTFS route_types to VDV Area IDs
        const typeToBereichVal = new Map<number, { id: number, text: string, kuerzel: string }>();

        const addMapping = (types: number[], id: number, text: string, kuerzel: string) => {
            types.forEach(t => typeToBereichVal.set(t, { id, text, kuerzel }));
        };
        addMapping([0, 900], 1, 'Straßenbahn', 'Tram');
        addMapping([3, 700, 715], 2, 'Bus', 'Bus');
        addMapping([1, 2, 100, 101, 102, 109], 3, 'Zug', 'Zug');

        const areasToEnsure = [
            { id: 1, text: 'Straßenbahn', kuerzel: 'Tram' },
            { id: 2, text: 'Bus', kuerzel: 'Bus' },
            { id: 3, text: 'Zug', kuerzel: 'Zug' }
        ];

        for (const area of areasToEnsure) {
            const exists = await MengeBereich.findOne({ where: { BEREICH_NR: area.id, BASIS_VERSION } });
            if (!exists) {
                await MengeBereich.create({
                    BASIS_VERSION,
                    BEREICH_NR: area.id,
                    STR_BEREICH: area.kuerzel,
                    BEREICH_TEXT: area.text
                });
            }
        }

        // --- IMPORT LINES ---
        reportProgress('Importing Lines', 0, agencyRoutes.length);
        let lineIdx = 0;
        for (const r of agencyRoutes) {
            lineIdx++;
            if (lineIdx % 5 === 0) reportProgress('Importing Lines', lineIdx, agencyRoutes.length, r.route_short_name);

            const liNr = parseInt(r.route_short_name.replace(/\D/g, ''), 10) || 0;
            let uniqueLiNr = liNr;
            if (uniqueLiNr === 0) {
                uniqueLiNr = 9000 + lineIdx;
            }

            // Determine Bereich
            let routeType = parseInt(r.route_type, 10);
            if (isNaN(routeType)) routeType = 3;

            const mapping = typeToBereichVal.get(routeType);
            const bereichNr = mapping ? mapping.id : 2; // Default to Bus

            const routeTrips = agencyTrips.filter(t => t.route_id === r.route_id);
            const patterns = new Map<string, any[]>();
            for (const trip of routeTrips) {
                const stops = tripPatterns.get(trip.trip_id);
                if (!stops || stops.length === 0) continue;
                const patternKey = stops.map(s => s.stop_id).join('|');
                if (!patterns.has(patternKey)) patterns.set(patternKey, stops);
            }

            let variantIdx = 0;
            for (const [key, stops] of patterns) {
                variantIdx++;
                const variantId = variantIdx.toString().padStart(3, '0');

                const startStopId = stops[0].stop_id;
                const endStopId = stops[stops.length - 1].stop_id;

                const getParentName = (stopId: string): string => {
                    const mappedOrtNr = stopIdToOrtNr.get(stopId);
                    if (!mappedOrtNr) return 'Unknown';
                    const childOrt = ortsToCreate.get(mappedOrtNr);
                    if (!childOrt) return 'Unknown';
                    // Use the stored Parent Name directly
                    return childOrt.ORT_REF_ORT_NAME || childOrt.ORT_NAME || 'Unknown';
                };

                const startName = getParentName(startStopId);
                const endName = getParentName(endStopId);
                const lidName = `${startName} – ${endName}`;

                // ZNR
                let znrNr = 0;
                const existingZnr = await RecZnr.findOne({ where: { ZNR_TEXT: endName, BASIS_VERSION } });
                if (existingZnr) {
                    znrNr = existingZnr.ZNR_NR;
                } else {
                    const maxZnr = await RecZnr.max('ZNR_NR', { where: { BASIS_VERSION } }) as number || 0;
                    znrNr = maxZnr + 1;
                    await RecZnr.create({
                        BASIS_VERSION,
                        ZNR_NR: znrNr,
                        ZNR_TEXT: endName.substring(0, 40)
                    });
                }

                // RecLid
                const existingLid = await RecLid.findOne({
                    where: { BASIS_VERSION, LI_NR: uniqueLiNr, STR_LI_VAR: variantId }
                });
                if (!existingLid) {
                    await RecLid.create({
                        BASIS_VERSION,
                        LI_NR: uniqueLiNr,
                        STR_LI_VAR: variantId,
                        STR_LID: r.route_short_name.substring(0, 4),
                        LI_KUERZEL: r.route_short_name.substring(0, 6),
                        LIDNAME: lidName.substring(0, 100),
                        ROUTEN_ART: 1,
                        ROUTEN_NR: variantIdx,
                        BEREICH_NR: bereichNr
                    });
                }

                // LidVerlauf
                let seq = 0;
                for (const stop of stops) {
                    seq++;
                    const ortNr = stopIdToOrtNr.get(stop.stop_id);
                    if (ortNr) {
                        try {
                            await LidVerlauf.create({
                                BASIS_VERSION,
                                LI_NR: uniqueLiNr,
                                STR_LI_VAR: variantId,
                                LI_LFD_NR: seq,
                                ORT_NR: ortNr,
                                ONR_TYP_NR: 1,
                                ZNR_NR: seq === 1 ? znrNr : undefined,
                                EINSTEIGEVERBOT: false,
                                AUSSTEIGEVERBOT: false
                            });
                        } catch (err) {
                            // ignore duplicate
                        }
                    }
                }
            }
        }

        // --- RELATIONS & TRAVEL TIMES ---
        reportProgress('Importing Relations', 0, 0);

        const timeWindows = [
            { start: 0, end: 3 * 3600, label: '00:00-02:59' },
            { start: 3 * 3600, end: 6 * 3600, label: '03:00-05:59' },
            { start: 6 * 3600, end: 9 * 3600, label: '06:00-08:59' },
            { start: 9 * 3600, end: 12 * 3600, label: '09:00-11:59' },
            { start: 12 * 3600, end: 15 * 3600, label: '12:00-14:59' },
            { start: 15 * 3600, end: 18 * 3600, label: '15:00-17:59' },
            { start: 18 * 3600, end: 21 * 3600, label: '18:00-20:59' },
            { start: 21 * 3600, end: 24 * 3600, label: '21:00-23:59' }
        ];

        // Create FGR
        for (let i = 0; i < timeWindows.length; i++) {
            const fgrNr = i + 1;
            const fgrExists = await MengeFgr.findOne({ where: { FGR_NR: fgrNr, BASIS_VERSION } });
            if (!fgrExists) {
                await MengeFgr.create({
                    BASIS_VERSION,
                    FGR_NR: fgrNr,
                    STR_FGR: `FGR${fgrNr}`,
                    FGR_TEXT: timeWindows[i].label
                });
            }
        }

        const getTimeWindow = (depTimeSeconds: number): number => {
            const normalizedTime = depTimeSeconds % (24 * 3600);
            for (let i = 0; i < timeWindows.length; i++) {
                if (normalizedTime >= timeWindows[i].start && normalizedTime < timeWindows[i].end) return i + 1;
            }
            return 1;
        };

        const segmentFgrDurations = new Map<string, Set<number>>();

        reportProgress('Calculating Travel Times', 0, agencyStopTimes.length);

        for (const st of agencyStopTimes) {
            if (!st.departure_time || !st.arrival_time) continue;
            const tripStops = tripPatterns.get(st.trip_id);
            if (!tripStops || tripStops.length < 2) continue;
            const stopSeq = parseInt(st.stop_sequence);
            const stopIdx = tripStops.findIndex((s: any) => s.stop_id === st.stop_id && s.seq === stopSeq);
            if (stopIdx === -1 || stopIdx >= tripStops.length - 1) continue;

            const s1 = tripStops[stopIdx];
            const s2 = tripStops[stopIdx + 1];

            const fromOrt = stopIdToOrtNr.get(s1.stop_id);
            const toOrt = stopIdToOrtNr.get(s2.stop_id);

            if (!fromOrt || !toOrt || fromOrt === toOrt) continue;

            const depTime = timeToSeconds(s1.dep);
            const arrTime = timeToSeconds(s2.arr);
            const duration = Math.max(0, arrTime - depTime);

            const fgrNr = getTimeWindow(depTime);
            const key = `${fromOrt}-${toOrt}-${fgrNr}`;

            if (!segmentFgrDurations.has(key)) segmentFgrDurations.set(key, new Set());
            segmentFgrDurations.get(key)!.add(duration);
        }

        const segmentsByKey = new Map<string, Map<number, Set<number>>>();
        for (const [key, durations] of segmentFgrDurations) {
            const lastDash = key.lastIndexOf('-');
            const segmentKey = key.substring(0, lastDash);
            const fgrNr = parseInt(key.substring(lastDash + 1));
            if (!segmentsByKey.has(segmentKey)) segmentsByKey.set(segmentKey, new Map());
            segmentsByKey.get(segmentKey)!.set(fgrNr, durations);
        }

        const processedSegments = new Set<string>();

        reportProgress('Saving Relations', 0, segmentsByKey.size);
        let selIdx = 0;

        for (const [segmentKey, fgrMap] of segmentsByKey) {
            selIdx++;
            if (selIdx % 100 === 0) reportProgress('Saving Relations', selIdx, segmentsByKey.size);

            const [fromOrt, toOrt] = segmentKey.split('-').map(Number);
            const sortedFgrs = Array.from(fgrMap.keys()).sort((a, b) => a - b);

            for (const fgrNr of sortedFgrs) {
                const durations = fgrMap.get(fgrNr)!;
                const avgDuration = Math.round(Array.from(durations).reduce((a, b) => a + b, 0) / durations.size);

                if (fgrNr === 1 && !processedSegments.has(segmentKey)) {
                    await RecSel.create({
                        BASIS_VERSION,
                        BEREICH_NR: 1,
                        ONR_TYP_NR: 1,
                        ORT_NR: fromOrt,
                        SEL_ZIEL: toOrt,
                        SEL_ZIEL_TYP: 1,
                        SEL_LAENGE: 0,
                        SEL_FZT: avgDuration,
                        FGR_NR: 1
                    });
                    processedSegments.add(segmentKey);
                }

                await RecSelFztFeld.create({
                    BASIS_VERSION,
                    BEREICH_NR: 1,
                    FGR_NR: fgrNr,
                    ONR_TYP_NR: 1,
                    ORT_NR: fromOrt,
                    SEL_ZIEL: toOrt,
                    SEL_ZIEL_TYP: 1,
                    SEL_FZT: avgDuration
                });
            }
        }

        reportProgress('Done', 100, 100, 'Import completed successfully', true);

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`[GTFS Worker] Cleaned up temp file: ${filePath}`);
            } catch (err) {
                console.warn(`[GTFS Worker] Failed to clean up temp file: ${filePath}`, err);
            }
        }

        if (parentPort) parentPort.postMessage({ type: 'done' });
        process.exit(0);

    } catch (e: any) {
        console.error(e);
        // Attempt cleanup on error too
        const { tempFile } = workerData;
        if (tempFile) {
            const filePath = path.join(process.cwd(), 'uploads', tempFile);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    console.log(`[GTFS Worker] Cleaned up temp file after error: ${filePath}`);
                } catch (cleanupErr) {
                    // ignore
                }
            }
        }

        if (parentPort) parentPort.postMessage({ type: 'error', error: e.message });
        process.exit(1);
    }
};

runImport();
