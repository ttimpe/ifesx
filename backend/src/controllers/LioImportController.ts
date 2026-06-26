import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomBytes } from 'crypto';
import {
    isSupportedArchive,
    extractArchive,
    findDatasetDir,
    findAnnouncementDir,
    parseInfoXml
} from '../utils/lio-archive';
import { countDbfRows, findDbf } from '../utils/dbf-reader';

const lioRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

// ---- Fortschritts-Verwaltung (analog GTFS) ----
interface StageProgress {
    name: string;
    current: number;
    total: number;
    details?: string;
    completed: boolean;
}
const importProgress = new Map<string, { stages: StageProgress[] }>();

const updateStage = (importId: string, name: string, current: number, total: number, details?: string, completed = false) => {
    if (!importId) return;
    let progress = importProgress.get(importId);
    if (!progress) {
        progress = { stages: [] };
        importProgress.set(importId, progress);
    }
    const existing = progress.stages.find(s => s.name === name);
    if (existing) {
        existing.current = current;
        existing.total = total;
        existing.details = details;
        existing.completed = completed;
    } else {
        progress.stages.push({ name, current, total, details, completed });
    }
};

// Tabellen, deren Zeilenzahl im Analyse-Schritt angezeigt wird
const COUNT_TABLES: { table: string; label: string }[] = [
    { table: 'Stop', label: 'Haltestellen' },
    { table: 'Route', label: 'Linien' },
    { table: 'PatternInfo', label: 'Varianten' },
    { table: 'CoDayTyp', label: 'Tagesarten' },
    { table: 'Calendar', label: 'Kalendertage' },
    { table: 'Block', label: 'Umläufe' },
    { table: 'Trip', label: 'Fahrten' },
    { table: 'Announce', label: 'Ansagen' }
];

// ANALYSE: Archiv entpacken, Metadaten + Tabellenumfang zurückgeben
lioRouter.post('/analyze', upload.single('file'), async (req: Request, res: Response) => {
    const uploaded = req.file;
    if (!uploaded) return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    if (!isSupportedArchive(uploaded.originalname)) {
        fs.unlinkSync(uploaded.path);
        return res.status(400).json({ error: 'Nicht unterstütztes Format. Erlaubt: .cab, .zip, .rar' });
    }

    const tempDir = `lio-${randomBytes(8).toString('hex')}`;
    const destPath = path.join(process.cwd(), 'uploads', tempDir);
    // Originalendung beibehalten, damit das Format erkannt wird
    const archivePath = uploaded.path + path.extname(uploaded.originalname).toLowerCase();
    try {
        fs.renameSync(uploaded.path, archivePath);
        await extractArchive(archivePath, destPath);
        fs.unlinkSync(archivePath);

        const dataDir = findDatasetDir(destPath);
        if (!dataDir) throw new Error('Kein IBISplus-Datensatz (info.xml + .dbf) im Archiv gefunden');

        const info = parseInfoXml(dataDir);
        const counts: Record<string, number> = {};
        for (const { table, label } of COUNT_TABLES) {
            const p = findDbf(dataDir, table);
            counts[label] = p ? countDbfRows(p) : 0;
        }

        res.json({
            tempDir,
            info,
            counts,
            hasAnnouncements: !!findAnnouncementDir(destPath)
        });
    } catch (e: any) {
        console.error('[LIO] Analyse fehlgeschlagen:', e);
        try { if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath); } catch { /* ignore */ }
        try { fs.rmSync(destPath, { recursive: true, force: true }); } catch { /* ignore */ }
        res.status(500).json({ error: e.message || 'Analyse fehlgeschlagen' });
    }
});

// IMPORT: Worker starten
lioRouter.post('/import', async (req: Request, res: Response) => {
    const { tempDir, basisVersion, importId } = req.body;
    if (!tempDir || !basisVersion || !importId) {
        return res.status(400).json({ error: 'Fehlende Parameter (tempDir, basisVersion, importId)' });
    }
    const root = path.join(process.cwd(), 'uploads', tempDir);
    if (!fs.existsSync(root)) {
        return res.status(400).json({ error: 'Entpacktes Archiv nicht gefunden (Analyse erneut ausführen)' });
    }

    updateStage(importId, 'Initialisierung', 0, 1);

    const { Worker } = require('worker_threads');
    let workerPath = path.join(__dirname, '../workers/lio-import.worker.js');
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(path.join(__dirname, '../workers/lio-import-wrapper.js'))) {
        workerPath = path.join(__dirname, '../workers/lio-import-wrapper.js');
    }

    const worker = new Worker(workerPath, { workerData: { tempDir, basisVersion, importId } });
    worker.on('message', (msg: any) => {
        if (msg.type === 'progress') {
            const p = msg.payload;
            updateStage(importId, p.stage, p.current, p.total, p.details, p.completed);
        } else if (msg.type === 'error') {
            updateStage(importId, 'Error', 0, 0, msg.error, true);
        }
    });
    worker.on('error', (err: any) => updateStage(importId, 'Error', 0, 0, err.message, true));
    worker.on('exit', (code: number) => {
        if (code !== 0) console.error(`[LIO] Worker beendet mit Code ${code}`);
    });

    return res.status(202).json({ message: 'Import gestartet', importId });
});

lioRouter.get('/progress/:importId', (req: Request, res: Response) => {
    const p = importProgress.get(req.params.importId);
    if (!p) return res.json({ stages: [] });
    res.json(p);
});

export default lioRouter;
