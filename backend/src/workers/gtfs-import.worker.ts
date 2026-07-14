
const { parentPort, workerData } = require('worker_threads');
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { parse } from '@fast-csv/parse';
import axios from 'axios';

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
import { Tagesart } from '../models/VDV/Tagesart';
import { Betriebstag } from '../models/VDV/Betriebstag';

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
        console.log('[GTFS Worker] Starting...');
        const { tempFile, agencyId, basisVersion, importId } = workerData;
        console.log(`[GTFS Worker] ImportID: ${importId}, File: ${tempFile}`);

        if (parentPort) parentPort.postMessage({ type: 'progress', payload: { stage: 'Worker Started', current: 0, total: 100, details: 'Initializing...', completed: false } });

        const filePath = path.join(process.cwd(), 'uploads', tempFile);

        // Init DB
        console.log('[GTFS Worker] Initializing DB...');
        await initDB();
        console.log('[GTFS Worker] DB Initialized.');

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

        // Cleanup existing data for this basis version to avoid stale records
        reportProgress('Cleaning Database', 0, 100);
        await RecFrt.destroy({ where: { BASIS_VERSION } });
        await LidVerlauf.destroy({ where: { BASIS_VERSION } });
        await RecLid.destroy({ where: { BASIS_VERSION } });
        await RecSel.destroy({ where: { BASIS_VERSION } });
        await RecSelFztFeld.destroy({ where: { BASIS_VERSION } });
        await RecZnr.destroy({ where: { BASIS_VERSION } });

        // 1. Routes
        reportProgress('Reading Routes', 0, 100);
        const allRoutes = await readCsv(zip, 'routes.txt');
        const agencyRoutes = allRoutes.filter(r => {
            if (!r.agency_id) return false; // Strict: No ID -> No Import
            const cleanId = String(r.agency_id).replace(/^"|"$/g, '').trim();
            return cleanId === String(agencyId).trim();
        });
        console.log(`[GTFS Worker] Target Agency: '${agencyId}' | Routes Found: ${agencyRoutes.length} / ${allRoutes.length}`);
        if (agencyRoutes.length > 0) {
            console.log(`[GTFS Worker] First Match: ${JSON.stringify(agencyRoutes[0].agency_id)} -> Clean: ${String(agencyRoutes[0].agency_id).replace(/^"|"$/g, '').trim()}`);
        }

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
                dep: st.departure_time,
                pickup_type: parseInt(st.pickup_type || '0'),
                drop_off_type: parseInt(st.drop_off_type || '0')
            });
        });

        tripPatterns.forEach(p => p.sort((a: any, b: any) => a.seq - b.seq));

        // --- SERVICE DEDUPLICATION ---
        reportProgress('Deduplicating Services', 0, 100);

        // 1. Group Trips by Service
        const serviceToTrips = new Map<string, any[]>();
        agencyTrips.forEach(t => {
            if (!serviceToTrips.has(t.service_id)) serviceToTrips.set(t.service_id, []);
            serviceToTrips.get(t.service_id)!.push(t);
        });

        // 2. Generate Fingerprints
        const serviceFingerprints = new Map<string, string>(); // service_id -> hash
        let debugPrintCount = 0;
        const crypto = require('crypto');

        for (const [sId, sTrips] of serviceToTrips) {
            // Create signature for each trip: route_id + pattern_content
            const tripSigs = sTrips.map(t => {
                const stops = tripPatterns.get(t.trip_id);
                if (!stops) return 'empty';
                // Pattern sig: stop_id:dep_time|...
                const patternSig = stops.map((s: any) => `${s.stop_id}:${s.dep}`).join('|');
                return `${t.route_id}|${t.direction_id}|${patternSig}`;
            });
            // Sort to ensure order doesn't matter for the set of trips
            tripSigs.sort();
            const serviceContent = tripSigs.join('||');
            if (debugPrintCount === 0) {
                console.log(`[GTFS Import Deb] Sample Fingerprint Content (First 200 chars): ${serviceContent.substring(0, 200)}`);
            }
            const hash = crypto.createHash('md5').update(serviceContent).digest('hex');
            serviceFingerprints.set(sId, hash);
        }

        // 3. Group by Fingerprint
        const fingerprintToServices = new Map<string, string[]>();
        serviceFingerprints.forEach((hash, sId) => {
            if (!fingerprintToServices.has(hash)) fingerprintToServices.set(hash, []);
            fingerprintToServices.get(hash)!.push(sId);
        });

        // 4. Identify Duplicates
        const serviceMapping = new Map<string, string>(); // duplicate -> master
        let removedTripsCount = 0;
        let removedServicesCount = 0;

        let debugPrintCount2 = 0;
        fingerprintToServices.forEach((services, hash) => {
            if (debugPrintCount2 < 5) {
                console.log(`[GTFS Import Deb] Hash ${hash.substring(0, 8)}: ${services.length} services (${services.join(', ')})`);
                debugPrintCount2++;
            }
            if (services.length > 1) {
                // Sort to ensure deterministic master (e.g. alphabetical)
                services.sort();
                const master = services[0];
                for (let i = 1; i < services.length; i++) {
                    const dup = services[i];
                    serviceMapping.set(dup, master);
                    removedServicesCount++;
                    removedTripsCount += serviceToTrips.get(dup)!.length;
                }
                // Master maps to itself (optional, but good for lookup)
                serviceMapping.set(master, master);
            } else {
                serviceMapping.set(services[0], services[0]);
            }
        });

        console.log(`[GTFS Import] Deduplication: Merged ${removedServicesCount} services into their masters. Removed ${removedTripsCount} duplicate trips.`);
        console.log(`[GTFS Import] Unique Fingerprints: ${fingerprintToServices.size} | Total Services Scanned: ${serviceToTrips.size}`);

        // 5. Prune Trips
        // We only keep trips whose service_id is a Master (or unique)
        // Effectively: serviceMapping.get(t.service_id) === t.service_id
        const filteredAgencyTrips = agencyTrips.filter(t => {
            const master = serviceMapping.get(t.service_id);
            return master === t.service_id;
        });

        // Re-assign to the main variable (mutable approach or just update references)
        // Since agencyTrips is const, we can't reassign it. We'll use splice or create a new internal var.
        // Actually, 'const agencyTrips' is defined above. We need to respect scoping.
        // Better to clear agencyTrips array and push preserved items back, or use a new variable and update later references.
        // Check usage below:
        // - used in line 219 (routeTrips loop) -> uses agencyTrips
        // - used in line 437 (usedServiceIds) -> uses agencyTrips

        // Hack to replace content of const array:
        agencyTrips.length = 0;
        agencyTrips.push(...filteredAgencyTrips);

        // Update tripIds set
        tripIds.clear();
        agencyTrips.forEach(t => tripIds.add(t.trip_id));

        console.log(`[GTFS Import] Post-Filter: ${agencyTrips.length} trips remaining.`);


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

        // --- IMPORT TAGESARTEN (Daily Schedule Deduplication) ---
        reportProgress('Processing Day Types', 0, 100);

        const usedServiceIds = new Set<string>();
        agencyTrips.forEach(t => usedServiceIds.add(t.service_id));
        console.log(`[GTFS Import] Used Service IDs (Masters): ${usedServiceIds.size}`);

        // 1. Build Date -> Active Master Services Map
        const dateToServices = new Map<string, Set<string>>();
        const calendars = await readCsv(zip, 'calendar.txt');
        const calendarDates = await readCsv(zip, 'calendar_dates.txt');

        const addToDate = (dateStr: string, sId: string) => {
            if (!dateToServices.has(dateStr)) dateToServices.set(dateStr, new Set());
            dateToServices.get(dateStr)!.add(sId);
        };
        const removeFromDate = (dateStr: string, sId: string) => {
            if (dateToServices.has(dateStr)) dateToServices.get(dateStr)!.delete(sId);
        };

        // Process Ranges
        for (const cal of calendars) {
            const master = serviceMapping.get(cal.service_id) || cal.service_id;
            if (!usedServiceIds.has(master)) continue;

            const startY = parseInt(cal.start_date.substring(0, 4));
            const startM = parseInt(cal.start_date.substring(4, 6)) - 1;
            const startD = parseInt(cal.start_date.substring(6, 8));
            const endY = parseInt(cal.end_date.substring(0, 4));
            const endM = parseInt(cal.end_date.substring(4, 6)) - 1;
            const endD = parseInt(cal.end_date.substring(6, 8));

            const current = new Date(startY, startM, startD);
            const end = new Date(endY, endM, endD);
            const activeDays = [cal.sunday, cal.monday, cal.tuesday, cal.wednesday, cal.thursday, cal.friday, cal.saturday].map(d => d === '1');

            while (current <= end) {
                if (activeDays[current.getDay()]) {
                    const dStr = `${current.getFullYear()}${(current.getMonth() + 1).toString().padStart(2, '0')}${current.getDate().toString().padStart(2, '0')}`;
                    addToDate(dStr, master);
                }
                current.setDate(current.getDate() + 1);
            }
        }

        // Process Exceptions
        for (const cd of calendarDates) {
            const master = serviceMapping.get(cd.service_id) || cd.service_id;
            if (!usedServiceIds.has(master)) continue;
            if (cd.exception_type === '1') addToDate(cd.date, master);
            else if (cd.exception_type === '2') removeFromDate(cd.date, master);
        }

        // 2. Identify Unique Schedules (Sets of Services)
        const scheduleToDates = new Map<string, { services: string[], dates: string[] }>();

        for (const [date, services] of dateToServices) {
            if (services.size === 0) continue;
            const sortedServices = Array.from(services).sort(); // Sort for deterministic signature
            const sig = sortedServices.join('|');
            if (!scheduleToDates.has(sig)) {
                scheduleToDates.set(sig, { services: sortedServices, dates: [] });
            }
            scheduleToDates.get(sig)!.dates.push(date);
        }

        console.log(`[GTFS Import] Unique Daily Schedules: ${scheduleToDates.size} covering ${dateToServices.size} dates.`);

        // 3. Create Tagesart & Betriebstag
        // Clean up
        await RecFrt.destroy({ where: { BASIS_VERSION } });
        await LidVerlauf.destroy({ where: { BASIS_VERSION } });
        await RecLid.destroy({ where: { BASIS_VERSION } });
        await Betriebstag.destroy({ where: { BASIS_VERSION } });

        let nextTagesartNr = await Tagesart.max('TAGESART_NR', { where: { BASIS_VERSION } }) as number || 0;

        // Map<MasterService, Set<TagesartNr>> for RecFrt generation
        const serviceToTagesartNrs = new Map<string, Set<number>>();
        const betriebstageToCreate: any[] = [];

        for (const [sig, info] of scheduleToDates) {
            nextTagesartNr++;
            const tNr = nextTagesartNr;
            const tName = info.services.length > 3 ? `Comb ${info.services.length} Srv` : info.services.join('+');

            await Tagesart.create({
                BASIS_VERSION,
                TAGESART_NR: tNr,
                TAGESART_TEXT: tName.substring(0, 40)
            });

            // Map each Service in this Schedule to this Tagesart
            for (const sId of info.services) {
                if (!serviceToTagesartNrs.has(sId)) serviceToTagesartNrs.set(sId, new Set());
                serviceToTagesartNrs.get(sId)!.add(tNr);
            }

            // Create Betriebstage for all dates using this Schedule
            for (const dStr of info.dates) {
                const year = dStr.substring(0, 4);
                const month = dStr.substring(4, 6);
                const day = dStr.substring(6, 8);
                const text = `${day}.${month}.${year}`;

                betriebstageToCreate.push({
                    BASIS_VERSION,
                    BETRIEBSTAG: parseInt(dStr, 10),
                    BETRIEBSTAG_TEXT: text,
                    TAGESART_NR: tNr
                });
            }
        }

        reportProgress('Saving Calendar Days', 0, betriebstageToCreate.length);
        console.log(`[GTFS Import] Betriebstage to create: ${betriebstageToCreate.length}`);

        for (let i = 0; i < betriebstageToCreate.length; i += 500) {
            const chunk = betriebstageToCreate.slice(i, i + 500);
            await Betriebstag.bulkCreate(chunk);
        }


        // Group agency routes into logical lines by (ShortName + Area)
        const lineGroups = new Map<string, { liNr: number, bereichNr: number, routes: any[] }>();

        for (const r of agencyRoutes) {
            // REMOVED HARDCODED FILTER

            const isNumeric = /^\d+$/.test(r.route_short_name);
            const liNrBase = parseInt(r.route_short_name.replace(/\D/g, ''), 10) || 0;
            let liNr = liNrBase;

            if (!isNumeric) {
                // If N1, S50 etc -> Boost by 1000 to avoid collision with Line 1
                if (liNr > 0) liNr += 1000;
                else liNr = 9000 + agencyRoutes.indexOf(r);
            } else if (liNr === 0) {
                liNr = 9000 + agencyRoutes.indexOf(r);
            }

            let routeType = parseInt(r.route_type, 10);
            if (isNaN(routeType)) routeType = 3;
            const mapping = typeToBereichVal.get(routeType);
            const bereichNr = mapping ? mapping.id : 2;

            const groupKey = `${liNr}-${bereichNr}`;
            if (!lineGroups.has(groupKey)) {
                lineGroups.set(groupKey, { liNr, bereichNr, routes: [] });
            }
            lineGroups.get(groupKey)!.routes.push(r);
        }

        reportProgress('Importing Lines & Trips', 0, lineGroups.size);
        let groupIdx = 0;
        let frtFidCounter = await RecFrt.max('FRT_FID', { where: { BASIS_VERSION } }) as number || 0;

        // Global Map for Line Variant indices (LI_NR -> next variant index) to ensure uniqueness across groups
        const globalLineVariantMap = new Map<number, number>();

        for (const [groupKey, group] of lineGroups) {
            groupIdx++;
            if (groupIdx % 5 === 0) reportProgress('Importing Lines', groupIdx, lineGroups.size, group.routes[0].route_short_name);

            const uniqueLiNr = group.liNr;
            const bereichNr = group.bereichNr;

            // Collect ALL trips for ALL routes in this group
            const groupTrips: any[] = [];
            for (const r of group.routes) {
                const rt = agencyTrips.filter(t => t.route_id === r.route_id);
                groupTrips.push(...rt);
            }

            const patterns = new Map<string, any[]>();
            const tripToPatternKey = new Map<string, string>();

            for (const trip of groupTrips) {
                const stops = tripPatterns.get(trip.trip_id);
                if (!stops || stops.length === 0) continue;
                const patternKey = stops.map(s => s.stop_id).join('|');
                if (!patterns.has(patternKey)) patterns.set(patternKey, stops);
                tripToPatternKey.set(trip.trip_id, patternKey);
            }

            // Create Variants (RecLid) and Dictionary for Trip -> Var Assign
            // Get current variant index for this LI_NR (or Start at 0)
            let variantIdx = globalLineVariantMap.get(uniqueLiNr) || 0;

            const patternKeyToVarId = new Map<string, string>(); // Key -> 001, 002

            for (const [key, stops] of patterns) {
                variantIdx++;
                const variantId = variantIdx.toString().padStart(3, '0');
                patternKeyToVarId.set(key, variantId);

                const startStopId = stops[0].stop_id;
                // Use actual last stop for name (No more tricky revenue logic)
                const endStopId = stops[stops.length - 1].stop_id;

                const getParentName = (stopId: string): string => {
                    const mappedOrtNr = stopIdToOrtNr.get(stopId);
                    if (!mappedOrtNr) return 'Unknown';
                    const childOrt = ortsToCreate.get(mappedOrtNr);
                    if (!childOrt) return 'Unknown';
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

                // RecLid - keep a name the user has already given this Fahrweg; only name new/unnamed ones
                const existingLid = await RecLid.findOne({
                    where: { BASIS_VERSION, LI_NR: uniqueLiNr, STR_LI_VAR: variantId }
                });
                await RecLid.upsert({
                    BASIS_VERSION,
                    LI_NR: uniqueLiNr,
                    STR_LI_VAR: variantId,
                    LI_KUERZEL: group.routes[0].route_short_name.substring(0, 6),
                    LIDNAME: existingLid?.LIDNAME || lidName.substring(0, 100),
                    ROUTEN_ART: 1,
                    ROUTEN_NR: variantIdx,
                    BEREICH_NR: bereichNr
                });

                // LidVerlauf - Clean up old stops first to avoid zombies (e.g. if variant got shorter)
                await LidVerlauf.destroy({
                    where: {
                        BASIS_VERSION,
                        LI_NR: uniqueLiNr,
                        STR_LI_VAR: variantId
                    }
                });

                // LidVerlauf
                let seq = 0;
                for (const stop of stops) {
                    seq++;
                    const ortNr = stopIdToOrtNr.get(stop.stop_id);
                    if (ortNr) {
                        try {
                            const forbiddenEntry = stop.pickup_type === 1;
                            const forbiddenExit = stop.drop_off_type === 1;

                            await LidVerlauf.upsert({
                                BASIS_VERSION,
                                LI_NR: uniqueLiNr,
                                STR_LI_VAR: variantId,
                                LI_LFD_NR: seq,
                                ORT_NR: ortNr,
                                ONR_TYP_NR: 1,
                                ZNR_NR: seq === 1 ? znrNr : undefined,
                                EINSTEIGEVERBOT: forbiddenEntry,
                                AUSSTEIGEVERBOT: forbiddenExit
                            });
                        } catch (err) {
                            // ignore duplicate or error
                        }
                    }
                }

                // end of variant loop
            }

            // Update global map for next group using this same LI_NR
            globalLineVariantMap.set(uniqueLiNr, variantIdx);


            // --- INSERT TRIPS FOR THIS LINE ---
            // Now that variants are created, insert the trips
            for (const trip of groupTrips) {
                const pKey = tripToPatternKey.get(trip.trip_id);
                if (!pKey) continue;

                const variantId = patternKeyToVarId.get(pKey);
                if (!variantId) continue;

                const tagesartNrs = serviceToTagesartNrs.get(trip.service_id);
                if (!tagesartNrs) continue;

                const stops = tripPatterns.get(trip.trip_id)!;
                const startTime = timeToSeconds(stops[0].dep);

                for (const tNr of tagesartNrs) {
                    frtFidCounter++;
                    await RecFrt.create({
                        BASIS_VERSION,
                        FRT_FID: frtFidCounter,
                        FRT_START: startTime,
                        LI_NR: uniqueLiNr,
                        STR_LI_VAR: variantId,
                        TAGESART_NR: tNr,
                        FAHRTART_NR: 1, // Default Normal
                        UM_UID: null, // Orphan
                        BEREICH_NR: bereichNr
                    });
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

        const toRad = (v: number) => v * Math.PI / 180;
        const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371000; // Meters
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return Math.round(R * c);
        };

        const getDistanceFromEFA = async (originDHID: string, destDHID: string): Promise<number | null> => {
            try {
                // EFA Request for Westfalenfahrplan (generic endpoint, customizable?)
                const url = `https://westfalenfahrplan.de/nwl-efa/XML_TRIP_REQUEST2?outputFormat=rapidJSON&coordOutputDistance=1&name_origin=${encodeURIComponent(originDHID)}&name_destination=${encodeURIComponent(destDHID)}&type_origin=any&type_destination=any&itdTripDateTimeDepArr=dep&anyObjFilter_origin=2&anyObjFilter_destination=2`;

                // Short timeout to not block import too long
                const response = await axios.get(url, { timeout: 3000 });

                if (response.data.journeys && response.data.journeys.length > 0) {
                    const firstJourney = response.data.journeys[0];
                    let totalDistance = 0;
                    if (firstJourney.legs) {
                        firstJourney.legs.forEach((leg: any) => {
                            if (leg.distance) totalDistance += leg.distance;
                        });
                    }
                    return totalDistance > 0 ? totalDistance : null;
                }
                return null;
            } catch (error) {
                // console.warn(`[EFA] Failed/Timeout for ${originDHID} -> ${destDHID}`);
                return null;
            }
        };

        const segmentFgrDurations = new Map<string, Set<number>>();
        const segmentDistances = new Map<string, number>();

        reportProgress('Calculating Travel Times', 0, agencyStopTimes.length);

        let processedSegmentsCount = 0;
        const totalSegmentsEstimate = agencyStopTimes.length; // Approximate

        for (const st of agencyStopTimes) {
            if (!st.departure_time || !st.arrival_time) continue;
            const tripStops = tripPatterns.get(st.trip_id);
            if (!tripStops || tripStops.length < 2) continue;
            const stopSeq = parseInt(st.stop_sequence);
            const stopIdx = tripStops.findIndex((s: any) => s.stop_id === st.stop_id && s.seq === stopSeq);
            if (stopIdx === -1 || stopIdx >= tripStops.length - 1) continue;

            const s1 = tripStops[stopIdx];
            const s2 = tripStops[stopIdx + 1];

            const fromOrtNr = stopIdToOrtNr.get(s1.stop_id);
            const toOrtNr = stopIdToOrtNr.get(s2.stop_id);

            if (!fromOrtNr || !toOrtNr || fromOrtNr === toOrtNr) continue;

            // Calculate Distance if not already set (using first occurrence)
            const segmentBaseKey = `${fromOrtNr}-${toOrtNr}`;

            // Only add to segments to process if not already known
            if (!segmentDistances.has(segmentBaseKey)) {
                segmentDistances.set(segmentBaseKey, 0); // Initialize with 0
            }

            const depTime = timeToSeconds(s1.dep);
            const arrTime = timeToSeconds(s2.arr);
            const duration = Math.max(0, arrTime - depTime);

            const fgrNr = getTimeWindow(depTime);
            const key = `${fromOrtNr}-${toOrtNr}-${fgrNr}`;

            if (!segmentFgrDurations.has(key)) segmentFgrDurations.set(key, new Set());
            segmentFgrDurations.get(key)!.add(duration);
        }

        // --- BATCH PROCESS EFA REQUESTS ---
        const { loadEFADistances } = workerData;
        if (loadEFADistances) {
            const segmentsToFetch = Array.from(segmentDistances.keys());
            reportProgress('Fetching EFA Distances', 0, segmentsToFetch.length);

            const BATCH_SIZE = 20; // 20 Parallel requests
            for (let i = 0; i < segmentsToFetch.length; i += BATCH_SIZE) {
                const batch = segmentsToFetch.slice(i, i + BATCH_SIZE);
                const promises = batch.map(async (segKey) => {
                    const [from, to] = segKey.split('-').map(Number);
                    const ort1 = ortsToCreate.get(from);
                    const ort2 = ortsToCreate.get(to);

                    if (ort1?.HST_NR_INTERNATIONAL && ort2?.HST_NR_INTERNATIONAL) {
                        try {
                            const dist = await getDistanceFromEFA(ort1.HST_NR_INTERNATIONAL, ort2.HST_NR_INTERNATIONAL);
                            if (dist !== null) {
                                segmentDistances.set(segKey, dist);
                            } else {
                                // Fallback Haversine
                                const haversine = calcDistance(
                                    ort1.ORT_POS_BREITE / 10000000, ort1.ORT_POS_LAENGE / 10000000,
                                    ort2.ORT_POS_BREITE / 10000000, ort2.ORT_POS_LAENGE / 10000000
                                );
                                segmentDistances.set(segKey, haversine);
                            }
                        } catch (e) {
                            // Fallback Haversine on Error
                            const haversine = calcDistance(
                                ort1.ORT_POS_BREITE / 10000000, ort1.ORT_POS_LAENGE / 10000000,
                                ort2.ORT_POS_BREITE / 10000000, ort2.ORT_POS_LAENGE / 10000000
                            );
                            segmentDistances.set(segKey, haversine);
                        }
                    } else if (ort1 && ort2) {
                        // Fallback Haversine if no DHID
                        const haversine = calcDistance(
                            ort1.ORT_POS_BREITE / 10000000, ort1.ORT_POS_LAENGE / 10000000,
                            ort2.ORT_POS_BREITE / 10000000, ort2.ORT_POS_LAENGE / 10000000
                        );
                        segmentDistances.set(segKey, haversine);
                    }
                });

                await Promise.all(promises);
                reportProgress('Fetching EFA Distances', Math.min(i + BATCH_SIZE, segmentsToFetch.length), segmentsToFetch.length);
            }
        } else {
            // Calculate Haversine for all if EFA disabled
            for (const segKey of segmentDistances.keys()) {
                const [from, to] = segKey.split('-').map(Number);
                const ort1 = ortsToCreate.get(from);
                const ort2 = ortsToCreate.get(to);
                if (ort1 && ort2) {
                    const dist = calcDistance(
                        ort1.ORT_POS_BREITE / 10000000, ort1.ORT_POS_LAENGE / 10000000,
                        ort2.ORT_POS_BREITE / 10000000, ort2.ORT_POS_LAENGE / 10000000
                    );
                    segmentDistances.set(segKey, dist);
                }
            }
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

            // Get calculated distance
            const dist = segmentDistances.get(segmentKey) || 0;

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
                        SEL_LAENGE: dist,
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
