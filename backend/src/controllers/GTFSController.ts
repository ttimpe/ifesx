
import express, { Request, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { RecOrt } from '../models/VDV/RecOrt';
import { RecHp } from '../models/VDV/RecHp';
import { RecLid } from '../models/VDV/RecLid';

import { RecSel } from '../models/VDV/RecSel';
import { parse } from '@fast-csv/parse';
import { BasisVersion } from '../models/VDV/BasisVersion';
import { MengeBereich } from '../models/VDV/MengeBereich';
import { RecSelFztFeld } from '../models/VDV/RecSelFztFeld';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecZnr } from '../models/VDV/RecZnr';
import { MengeFgr } from '../models/VDV/MengeFgr';
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';

const gtfsRouter = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temp storage

// EFA Distance Loading Helper
const getDistanceFromEFA = async (originDHID: string, destDHID: string): Promise<number | null> => {
    try {
        const url = `https://westfalenfahrplan.de/nwl-efa/XML_TRIP_REQUEST2?outputFormat=rapidJSON&name_origin=${encodeURIComponent(originDHID)}&name_destination=${encodeURIComponent(destDHID)}&type_origin=any&type_destination=any&itdTripDateTimeDepArr=dep&anyObjFilter_origin=2&anyObjFilter_destination=2`;

        const response = await axios.get(url, { timeout: 10000 });

        if (response.data.journeys && response.data.journeys.length > 0) {
            const firstJourney = response.data.journeys[0];
            let totalDistance = 0;

            if (firstJourney.legs) {
                firstJourney.legs.forEach((leg: any) => {
                    if (leg.distance) {
                        totalDistance += leg.distance;
                    }
                });
            }

            return totalDistance > 0 ? totalDistance : null;
        }

        return null;
    } catch (error) {
        console.warn(`[EFA] Failed to get distance for ${originDHID} -> ${destDHID}:`, error);
        return null;
    }
};

// Haversine distance calculation fallback
const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
};

// Helper to read CSV from zip
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

// ANALYZE: Parse agency.txt to let user select
gtfsRouter.post('/analyze', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const zip = new AdmZip(req.file.path);
        const agencies = await readCsv(zip, 'agency.txt');

        res.json({
            agencies: agencies.map(a => ({
                id: a.agency_id,
                name: a.agency_name,
                url: a.agency_url
            })),
            tempFile: req.file.filename
        });

    } catch (e) {
        console.error(e);
        // CLEANUP: Delete file if analysis fails
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
                console.log(`[GTFS] Deleted invalid file: ${req.file.path}`);
            } catch (err) {
                console.error(`[GTFS] Failed to delete file: ${req.file.path}`, err);
            }
        }
        res.status(500).json({ error: 'Analysis failed (Invalid ZIP or GTFS format)' });
    }
});

interface StageProgress {
    name: string;
    current: number;
    total: number;
    details?: string;
    completed: boolean;
}

const importProgress = new Map<string, { stages: StageProgress[] }>();

// Helper to update or add a stage
const updateStage = (importId: string, stageName: string, current: number, total: number, details?: string, completed = false) => {
    if (!importId) return;

    let progress = importProgress.get(importId);
    if (!progress) {
        progress = { stages: [] };
        importProgress.set(importId, progress);
    }

    const existingStage = progress.stages.find(s => s.name === stageName);
    if (existingStage) {
        existingStage.current = current;
        existingStage.total = total;
        existingStage.details = details;
        existingStage.completed = completed;
    } else {
        progress.stages.push({ name: stageName, current, total, details, completed });
    }
};

gtfsRouter.get('/progress/:importId', (req: Request, res: Response) => {
    const p = importProgress.get(req.params.importId);
    if (!p) return res.json({ stages: [] });
    res.json(p);
});

// IMPORT: Perform the actual import (Async via Worker)
gtfsRouter.post('/import', async (req: Request, res: Response) => {
    const { tempFile, agencyId, basisVersion, importId, loadEFADistances } = req.body;

    // Validate inputs
    if (!tempFile || !agencyId || !basisVersion || !importId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Initialize progress
    updateStage(importId, 'Initialisierung', 0, 1);

    // Spawn Worker
    const { Worker } = require('worker_threads');

    // Determine worker path based on environment
    // In Docker (Prod), we run compiled JS. In Dev (ts-node), we might strictly need .js if compiled, 
    // or .ts if using ts-node/register.
    // Given the issues, we point to the compiled .js file which commonly exists in dist/workers/
    // BUT we are in src/... 
    // Let's assume the standard transpile puts it in ../workers/gtfs-import.worker.js relative to controller.

    let workerPath = path.join(__dirname, '../workers/gtfs-import.worker.js');

    // Fallback for dev environment using ts-node/tsx where .ts might be loadable directly 
    // if supported, otherwise it relies on on-the-fly compilation. 
    // Safest for 'tsx' (used in dev) is usually pointing to .ts or let tsx handle it.
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(path.join(__dirname, '../workers/import-wrapper.js'))) {
        workerPath = path.join(__dirname, '../workers/import-wrapper.js');
    }

    console.log(`[GTFS Controller] Spawning worker: ${workerPath}`);

    const worker = new Worker(workerPath, {
        workerData: {
            tempFile,
            agencyId,
            basisVersion,
            importId,
            loadEFADistances
        }
    });

    worker.on('message', (msg: any) => {
        if (msg.type === 'progress') {
            const p = msg.payload;
            updateStage(importId, p.stage, p.current, p.total, p.details, p.completed);
        } else if (msg.type === 'done') {
            console.log(`[GTFS Controller] Import ${importId} completed.`);
        } else if (msg.type === 'error') {
            console.error(`[GTFS Controller] Worker Error: ${msg.error}`);
            updateStage(importId, 'Error', 0, 0, msg.error, true);
        }
    });

    worker.on('error', (err: any) => {
        console.error(`[GTFS Controller] Worker Thread Error:`, err);
        updateStage(importId, 'Error', 0, 0, err.message, true);
    });

    worker.on('exit', (code: number) => {
        if (code !== 0) {
            console.error(`[GTFS Controller] Worker stopped with exit code ${code}`);
            // If not already flagged...
        }
    });

    // Return immediately to avoid timeout
    return res.status(202).json({ message: 'Import started', importId });
});

export default gtfsRouter;
