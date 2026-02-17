
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { parse } from '@fast-csv/parse';

// Hardcoded hash for stability, or dynamic find
const findLatestZip = () => {
    const uploadDir = path.join(__dirname, '../uploads'); // backend/uploads
    if (!fs.existsSync(uploadDir)) return null;
    const files = fs.readdirSync(uploadDir)
        .filter(f => !f.startsWith('.') && f !== 'README.md')
        .map(f => ({ name: f, time: fs.statSync(path.join(uploadDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);
    return files.length > 0 ? files[0].name : null;
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

const run = async () => {
    try {
        const filename = findLatestZip();
        if (!filename) {
            console.error('No zip file found in backend/uploads/');
            return;
        }
        console.log(`Analyzing ${filename}...`);
        const filePath = path.join(__dirname, '../uploads', filename);
        const zip = new AdmZip(filePath);

        const routes = await readCsv(zip, 'routes.txt');
        const trips = await readCsv(zip, 'trips.txt');
        const stopTimes = await readCsv(zip, 'stop_times.txt');

        console.log(`Loaded ${routes.length} routes, ${trips.length} trips, ${stopTimes.length} stop_times.`);

        // Build StopTimes map
        const tripPatterns = new Map<string, any[]>();
        stopTimes.forEach((st: any) => {
            if (!tripPatterns.has(st.trip_id)) tripPatterns.set(st.trip_id, []);
            tripPatterns.get(st.trip_id)!.push(st);
        });

        // Sort
        tripPatterns.forEach(p => p.sort((a: any, b: any) => parseInt(a.stop_sequence) - parseInt(b.stop_sequence)));

        // Analyze Routes
        const routeAnalysis = new Map<string, { patterns: Set<string>, tripCount: number }>();

        for (const trip of trips) {
            const stops = tripPatterns.get(trip.trip_id);
            if (!stops) continue;
            const patternKey = stops.map((s: any) => s.stop_id).join('|');

            if (!routeAnalysis.has(trip.route_id)) {
                routeAnalysis.set(trip.route_id, { patterns: new Set(), tripCount: 0 });
            }
            const info = routeAnalysis.get(trip.route_id)!;
            info.patterns.add(patternKey);
            info.tripCount++;
        }


        // Analyze Trip Collisions



        // --- SIMULATE DEDUPLICATION for owl-14 ---
        const targetAgencyId = 'owl-14';
        console.log(`--- Simulating Deduplication for Agency: ${targetAgencyId} ---`);

        // 1. Filter Routes/Trips
        const agencyRoutes = routes.filter((r: any) => {
            const rAgencyId = r.agency_id ? String(r.agency_id).replace(/^"|"$/g, '').trim() : targetAgencyId;
            return rAgencyId === targetAgencyId;
        });
        const routeIds = new Set(agencyRoutes.map((r: any) => r.route_id));
        const agencyTrips = trips.filter((t: any) => routeIds.has(t.route_id));

        console.log(`Found ${agencyRoutes.length} routes and ${agencyTrips.length} trips.`);

        // 2. Group Trips by Service
        const serviceToTrips = new Map<string, any[]>();
        agencyTrips.forEach((t: any) => {
            if (!serviceToTrips.has(t.service_id)) serviceToTrips.set(t.service_id, []);
            serviceToTrips.get(t.service_id)!.push(t);
        });
        console.log(`Unique Services (Pre-Dedup): ${serviceToTrips.size}`);

        // 3. Generate Fingerprints
        const serviceFingerprints = new Map<string, string>(); // service_id -> hash
        const crypto = require('crypto');

        for (const [sId, sTrips] of serviceToTrips) {
            // Create signature for each trip: route_id + pattern_content
            const tripSigs = sTrips.map((t: any) => {
                const stops = tripPatterns.get(t.trip_id);
                if (!stops) return 'empty';
                const patternSig = stops.map((s: any) => `${s.stop_id}:${s.departure_time}`).join('|');
                return `${t.route_id}|${t.direction_id}|${patternSig}`;
            });
            tripSigs.sort();
            const serviceContent = tripSigs.join('||');
            const hash = crypto.createHash('md5').update(serviceContent).digest('hex');
            serviceFingerprints.set(sId, hash);
        }

        // 4. Group by Fingerprint
        const fingerprintToServices = new Map<string, string[]>();
        serviceFingerprints.forEach((hash, sId) => {
            if (!fingerprintToServices.has(hash)) fingerprintToServices.set(hash, []);
            fingerprintToServices.get(hash)!.push(sId);
        });

        console.log(`Unique Fingerprints: ${fingerprintToServices.size}`);

        // 5. List collisions
        let potentialMerges = 0;
        fingerprintToServices.forEach((services, hash) => {
            if (services.length > 1) {
                potentialMerges += (services.length - 1);
                // console.log(`Fingerprint ${hash.substr(0,8)} shared by: ${services.join(', ')}`);
            }
        });
        console.log(`Potential Merges: ${potentialMerges}`);

        return;



    } catch (e) {
        console.error(e);
    }
};

run();
