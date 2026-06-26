import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Entpacken von IBISplus/LIO-Lieferpaketen.
 *
 * Akzeptierte Formate: .zip, .cab (Microsoft Cabinet), .rar (RAR5).
 *  - .zip / .cab  -> mitgeliefertes 7za-Binary (7zip-bin)
 *  - .rar         -> node-unrar-js (WASM, unterstützt RAR5; das gebündelte
 *                    p7zip 16.02 kann RAR5 nicht lesen)
 */

const SUPPORTED = ['.zip', '.cab', '.rar'];

export function isSupportedArchive(filename: string): boolean {
    return SUPPORTED.includes(path.extname(filename).toLowerCase());
}

/** Stellt sicher, dass das 7za-Binary ausführbar ist. */
const get7za = (): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sevenZip = require('7zip-bin');
    const bin = sevenZip.path7za as string;
    try {
        fs.chmodSync(bin, 0o755);
    } catch {
        // Rechte ggf. schon gesetzt
    }
    return bin;
};

const extractWith7za = async (archivePath: string, destDir: string): Promise<void> => {
    const bin = get7za();
    // x = mit Pfaden entpacken, -o = Zielordner, -y = alle Rückfragen mit Ja
    await execFileAsync(bin, ['x', archivePath, `-o${destDir}`, '-y'], { maxBuffer: 1024 * 1024 * 64 });
};

const extractRar = async (archivePath: string, destDir: string): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createExtractorFromData } = require('node-unrar-js');
    const data = fs.readFileSync(archivePath);
    const extractor = await createExtractorFromData({ data: Uint8Array.from(data).buffer });
    const extracted = extractor.extract();
    for (const file of extracted.files) {
        const header = file.fileHeader;
        const target = path.join(destDir, header.name);
        if (header.flags.directory) {
            fs.mkdirSync(target, { recursive: true });
            continue;
        }
        fs.mkdirSync(path.dirname(target), { recursive: true });
        if (file.extraction) {
            fs.writeFileSync(target, Buffer.from(file.extraction));
        }
    }
};

/** Entpackt das Archiv nach destDir (wird angelegt). */
export async function extractArchive(archivePath: string, destDir: string): Promise<void> {
    fs.mkdirSync(destDir, { recursive: true });
    const ext = path.extname(archivePath).toLowerCase();
    if (ext === '.rar') {
        await extractRar(archivePath, destDir);
    } else if (ext === '.zip' || ext === '.cab') {
        await extractWith7za(archivePath, destDir);
    } else {
        throw new Error(`Nicht unterstütztes Archivformat: ${ext}`);
    }
}

/** Rekursive Suche nach einem Verzeichnis, das ein bestimmtes Kriterium erfüllt. */
const findDirRecursive = (root: string, match: (dir: string, entries: string[]) => boolean): string | null => {
    const stack = [root];
    while (stack.length) {
        const dir = stack.pop()!;
        let entries: string[];
        try {
            entries = fs.readdirSync(dir);
        } catch {
            continue;
        }
        if (match(dir, entries)) return dir;
        for (const e of entries) {
            const full = path.join(dir, e);
            try {
                if (fs.statSync(full).isDirectory()) stack.push(full);
            } catch {
                // ignore
            }
        }
    }
    return null;
};

/** Findet das FoxPro-Datensatzverzeichnis (enthält info.xml und .dbf-Dateien). */
export function findDatasetDir(root: string): string | null {
    return findDirRecursive(root, (_dir, entries) => {
        const lower = entries.map(e => e.toLowerCase());
        return lower.includes('info.xml') && lower.some(e => e.endsWith('.dbf'));
    });
}

/** Findet das Ansagenverzeichnis (Ordner "Announcement" mit .mp3-Dateien irgendwo darunter). */
export function findAnnouncementDir(root: string): string | null {
    return findDirRecursive(root, (dir, entries) => {
        if (path.basename(dir).toLowerCase() !== 'announcement') return false;
        // Mindestens eine mp3 irgendwo darunter
        return entries.length > 0;
    });
}

export interface LioDatasetInfo {
    deviceName?: string;
    supplyGroup?: string;
    dataType?: string;
    useDateFrom?: string;
    useDateTill?: string;
    baseVersion?: string;
}

/** Liest die Metadaten aus info.xml (einfacher Regex-Parser, kein XML-Lib nötig). */
export function parseInfoXml(datasetDir: string): LioDatasetInfo {
    const infoPath = path.join(datasetDir, fs.readdirSync(datasetDir).find(f => f.toLowerCase() === 'info.xml') || 'info.xml');
    const info: LioDatasetInfo = {};
    if (!fs.existsSync(infoPath)) return info;
    const xml = fs.readFileSync(infoPath, 'utf-8');
    const pick = (tag: string): string | undefined => {
        const m = xml.match(new RegExp(`<${tag}>\\s*([^<]*?)\\s*</${tag}>`, 'i'));
        return m ? m[1].trim() : undefined;
    };
    info.deviceName = pick('devicename');
    info.supplyGroup = pick('supplygroupabr');
    info.dataType = pick('datatype');
    info.useDateFrom = pick('usedatefrom');
    info.useDateTill = pick('usedatetill');
    info.baseVersion = pick('baseversion');
    return info;
}
