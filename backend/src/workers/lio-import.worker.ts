
const { parentPort, workerData } = require('worker_threads');
import path from 'path';
import fs from 'fs';

import { initDB } from '../config/database';
import { readDbf, findDbf } from '../utils/dbf-reader';
import { findDatasetDir, findAnnouncementDir, parseInfoXml } from '../utils/lio-archive';

import { BasisVersion } from '../models/VDV/BasisVersion';
import { RecOrt } from '../models/VDV/RecOrt';
import { RecHp } from '../models/VDV/RecHp';
import { RecLid } from '../models/VDV/RecLid';
import { RecZnr } from '../models/VDV/RecZnr';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';
import { MengeFgr } from '../models/VDV/MengeFgr';
import { MengeBereich } from '../models/VDV/MengeBereich';
import { RecSel } from '../models/VDV/RecSel';
import { RecSelFztFeld } from '../models/VDV/RecSelFztFeld';
import { Tagesart } from '../models/VDV/Tagesart';
import { Betriebstag } from '../models/VDV/Betriebstag';
import { RecAnr } from '../models/VDV/RecAnr';

const reportProgress = (stage: string, current: number, total: number, details = '', completed = false) => {
    if (parentPort) {
        parentPort.postMessage({ type: 'progress', payload: { stage, current, total, details, completed } });
    }
};

// Verzeichnis, in dem RecAnrController die Ansage-Audios erwartet
const ANNOUNCEMENT_TARGET = path.join(process.cwd(), 'data', 'announcements');

const BEREICH_NR = 1;
const ONR_TYP = 1;

const bulkInChunks = async (model: any, rows: any[], chunk = 1000, stage?: string) => {
    for (let i = 0; i < rows.length; i += chunk) {
        await model.bulkCreate(rows.slice(i, i + chunk), { ignoreDuplicates: true });
        if (stage) reportProgress(stage, Math.min(i + chunk, rows.length), rows.length);
    }
};

const runImport = async () => {
    try {
        const { tempDir, basisVersion, importId } = workerData;
        const BASIS_VERSION = Number(basisVersion);
        console.log(`[LIO Worker] Start importId=${importId} tempDir=${tempDir} basisVersion=${BASIS_VERSION}`);

        reportProgress('Initialisierung', 0, 1, 'Datenbank wird initialisiert...');
        await initDB();

        const root = path.isAbsolute(tempDir) ? tempDir : path.join(process.cwd(), 'uploads', tempDir);
        const dataDir = findDatasetDir(root);
        if (!dataDir) throw new Error(`Kein IBISplus-Datensatzverzeichnis in ${root} gefunden`);
        const annDir = findAnnouncementDir(root);
        const info = parseInfoXml(dataDir);

        const R = (table: string): any[] => {
            const p = findDbf(dataDir, table);
            return p ? readDbf(p).rows : [];
        };

        // --- Basis-Version anlegen/aktualisieren ---
        let validity: Date | undefined;
        if (info.useDateFrom) {
            const d = new Date(info.useDateFrom);
            if (!isNaN(d.getTime())) validity = d;
        }
        await BasisVersion.upsert({
            BASIS_VERSION,
            BASIS_VERSION_TEXT: `IBIS+ ${info.baseVersion || ''}`.trim(),
            GUELTIG_AB: validity
        });

        // --- Bestehende Daten dieser Version entfernen ---
        reportProgress('Datenbank bereinigen', 0, 1);
        await RecFrt.destroy({ where: { BASIS_VERSION } });
        await RecUmlauf.destroy({ where: { BASIS_VERSION } });
        await LidVerlauf.destroy({ where: { BASIS_VERSION } });
        await RecLid.destroy({ where: { BASIS_VERSION } });
        await RecSelFztFeld.destroy({ where: { BASIS_VERSION } });
        await RecSel.destroy({ where: { BASIS_VERSION } });
        await RecZnr.destroy({ where: { BASIS_VERSION } });
        await RecHp.destroy({ where: { BASIS_VERSION } });
        await RecOrt.destroy({ where: { BASIS_VERSION } });
        await Betriebstag.destroy({ where: { BASIS_VERSION } });
        await Tagesart.destroy({ where: { BASIS_VERSION } });
        await RecAnr.destroy({ where: { BASIS_VERSION } });

        // --- Bereich (Default) ---
        await MengeBereich.upsert({ BASIS_VERSION, BEREICH_NR, STR_BEREICH: 'IBIS', BEREICH_TEXT: 'IBISplus Import' });

        // --- Fahrgastgruppen / Fahrzeit-Typen 1..4 ---
        for (const fgr of [1, 2, 3, 4]) {
            await MengeFgr.upsert({ BASIS_VERSION, FGR_NR: fgr, STR_FGR: `FZT${fgr}`, FGR_TEXT: `Fahrzeittyp ${fgr}` });
        }

        // ============ GeoNodes & Stops ============
        reportProgress('Haltestellen einlesen', 0, 1);
        const geo = R('GeoNode');
        const geoById = new Map<number, any>(geo.map(g => [g.GNODIDX, g]));
        // STPIDX -> Koordinate (erste GPS-fähige GeoNode des Stops)
        const stpCoord = new Map<number, { x: number; y: number }>();
        for (const g of geo) {
            if (g.GNODTYP === 1 && g.GPSLOCON === 1 && (g.GNODCOORDX || g.GNODCOORDY) && !stpCoord.has(g.GNODTYPIDX)) {
                stpCoord.set(g.GNODTYPIDX, { x: g.GNODCOORDX, y: g.GNODCOORDY });
            }
        }

        const stops = R('Stop');
        const stpIdxToStpNo = new Map<number, number>();
        const orte: any[] = [];
        const hps: any[] = [];
        for (const s of stops) {
            stpIdxToStpNo.set(s.STPIDX, s.STPNO);
            const c = stpCoord.get(s.STPIDX);
            orte.push({
                BASIS_VERSION,
                ORT_NR: s.STPNO,
                ONR_TYP_NR: ONR_TYP,
                ORT_NAME: (s.STPNAME || s.STPNAMELNG || s.LOCNAME || '').substring(0, 40),
                ORT_REF_ORT_KUERZEL: (s.SHDSG || '').substring(0, 8) || null,
                HST_NR_INTERNATIONAL: String(s.STPNOLONG || s.STPNO),
                ORT_POS_LAENGE: c ? Math.round(c.x * 25 / 9) : null,
                ORT_POS_BREITE: c ? Math.round(c.y * 25 / 9) : null,
                ORT_POS_HOEHE: 0
            });
            hps.push({
                BASIS_VERSION,
                ORT_NR: s.STPNO,
                ONR_TYP_NR: ONR_TYP,
                HALTEPUNKT_NR: 1,
                DHID: String(s.STPNO)
            });
        }
        await bulkInChunks(RecOrt, orte, 500, 'Haltestellen speichern');
        await bulkInChunks(RecHp, hps, 500);

        const resolveOrtNr = (gnodidx: number): number | null => {
            const g = geoById.get(gnodidx);
            if (!g) return null;
            const stpno = stpIdxToStpNo.get(g.GNODTYPIDX);
            return stpno ?? null;
        };

        // ============ Zielanzeiger (DestinationText -> RecZnr) ============
        reportProgress('Zielanzeiger einlesen', 0, 1);
        const dst = R('DestinationText');
        const dstIdxToZnr = new Map<number, number>();
        const znrSeen = new Map<number, any>();
        for (const d of dst) {
            dstIdxToZnr.set(d.DSTTXTIDX, d.DSTTXTNO);
            if (!znrSeen.has(d.DSTTXTNO)) {
                const text = (d.VEHBUSTXT || d.DRVDSTTXT1 || d.SHDSG || '').replace(/\s+/g, ' ').trim();
                znrSeen.set(d.DSTTXTNO, { BASIS_VERSION, ZNR_NR: d.DSTTXTNO, ZNR_TEXT: text });
            }
        }
        await bulkInChunks(RecZnr, Array.from(znrSeen.values()), 500);

        // ============ Ansagen (Announce + Audio -> RecAnr) ============
        reportProgress('Ansagen extrahieren', 0, 1);
        const annSet = new Set<number>();
        if (annDir) {
            // Fragment-Index: <ANNFRAGNO>.mp3 -> vollständiger Pfad
            const fragPaths = new Map<string, string>();
            const walk = (dir: string) => {
                for (const e of fs.readdirSync(dir)) {
                    const full = path.join(dir, e);
                    const st = fs.statSync(full);
                    if (st.isDirectory()) walk(full);
                    else if (e.toLowerCase().endsWith('.mp3')) fragPaths.set(path.basename(e, path.extname(e)), full);
                }
            };
            walk(annDir);

            fs.mkdirSync(ANNOUNCEMENT_TARGET, { recursive: true });

            // Announce nach ANNNO gruppieren, nach SEQNO sortieren
            const announce = R('Announce');
            const byAnn = new Map<number, any[]>();
            for (const a of announce) {
                if (!byAnn.has(a.ANNNO)) byAnn.set(a.ANNNO, []);
                byAnn.get(a.ANNNO)!.push(a);
            }
            const anrRows: any[] = [];
            let copied = 0;
            for (const [annno, frags] of byAnn) {
                frags.sort((a, b) => a.SEQNO - b.SEQNO);
                const files: string[] = [];
                for (const f of frags) {
                    const src = fragPaths.get(String(f.ANNFRAGNO));
                    const fname = `${f.ANNFRAGNO}.mp3`;
                    if (src) {
                        const target = path.join(ANNOUNCEMENT_TARGET, fname);
                        if (!fs.existsSync(target)) {
                            try { fs.copyFileSync(src, target); copied++; } catch { /* ignore */ }
                        }
                        files.push(fname);
                    }
                }
                annSet.add(annno);
                anrRows.push({
                    BASIS_VERSION,
                    ANR_NR: annno,
                    ANR_TEXT: '',
                    ANR_DATEI: files.join(',').substring(0, 255) || null
                });
            }
            await bulkInChunks(RecAnr, anrRows, 500);
            console.log(`[LIO Worker] Ansagen: ${anrRows.length} Datensätze, ${copied} Audiodateien kopiert`);
        }

        // ============ Tagesarten & Kalender ============
        reportProgress('Kalender einlesen', 0, 1);
        const coDayTyp = R('CoDayTyp');
        await bulkInChunks(Tagesart, coDayTyp.map(c => ({
            BASIS_VERSION, TAGESART_NR: c.CODAYTYPNO, TAGESART_TEXT: (c.LONGDESC || '').substring(0, 40)
        })), 500);

        const calendar = R('Calendar');
        await bulkInChunks(Betriebstag, calendar.map(c => {
            const d = String(c.DATE); // JJJJMMTT
            return {
                BASIS_VERSION,
                BETRIEBSTAG: parseInt(d, 10),
                BETRIEBSTAG_TEXT: d.length === 8 ? `${d.substring(6, 8)}.${d.substring(4, 6)}.${d.substring(0, 4)}` : d,
                TAGESART_NR: c.CODAYTYPNO
            };
        }), 500);

        // ============ Umläufe (Block -> RecUmlauf) ============
        reportProgress('Umläufe einlesen', 0, 1);
        const blocks = R('Block');
        const blockIdxToCoDayTyp = new Map<number, number>();
        const umRows: any[] = [];
        const umSeen = new Set<number>();
        for (const b of blocks) {
            blockIdxToCoDayTyp.set(b.BLOCKIDX, b.CODAYTYPNO);
            if (!umSeen.has(b.BLOCKIDX)) {
                umSeen.add(b.BLOCKIDX);
                umRows.push({ BASIS_VERSION, TAGESART_NR: b.CODAYTYPNO, UM_UID: b.BLOCKIDX });
            }
        }
        await bulkInChunks(RecUmlauf, umRows, 500);

        // ============ Linien & Varianten (Route + PatternInfo -> RecLid) ============
        reportProgress('Linien einlesen', 0, 1);
        const routes = R('Route');
        const routeNoToShdsg = new Map<number, string>(routes.map(r => [r.ROUTENO, (r.SHDSG || '').trim()]));
        const patInfo = R('PatternInfo');
        // PATIDX -> { LI_NR, STR_LI_VAR }
        const patIdxToVar = new Map<number, { li: number; var: string }>();
        const varSeen = new Set<string>();
        const lidRows: any[] = [];
        for (const p of patInfo) {
            const li = p.ROUTENO;
            let variant = String(p.PATNO).padStart(3, '0').substring(0, 6);
            if (varSeen.has(`${li}-${variant}`)) variant = String(p.PATIDX).substring(0, 6);
            varSeen.add(`${li}-${variant}`);
            patIdxToVar.set(p.PATIDX, { li, var: variant });
            lidRows.push({
                BASIS_VERSION,
                LI_NR: li,
                STR_LI_VAR: variant,
                LI_RI_NR: p.PATDIR || null,
                BEREICH_NR,
                LI_KUERZEL: (routeNoToShdsg.get(li) || String(li)).substring(0, 6),
                LIDNAME: (p.LONGDESC || '').substring(0, 100),
                ROUTEN_NR: p.PATNO,
                ROUTEN_ART: 1
            });
        }
        await bulkInChunks(RecLid, lidRows, 500);

        // ============ Linienverlauf (Pattern -> LidVerlauf) ============
        reportProgress('Linienverläufe einlesen', 0, 1);
        const pattern = R('Pattern');
        const patByIdx = new Map<number, any[]>();
        for (const p of pattern) {
            if (!patByIdx.has(p.PATIDX)) patByIdx.set(p.PATIDX, []);
            patByIdx.get(p.PATIDX)!.push(p);
        }
        const patInfoByIdx = new Map<number, any>(patInfo.map(p => [p.PATIDX, p]));
        const verlaufRows: any[] = [];
        for (const [patidx, rows] of patByIdx) {
            const v = patIdxToVar.get(patidx);
            if (!v) continue;
            rows.sort((a, b) => a.SEQNO - b.SEQNO);
            const pi = patInfoByIdx.get(patidx);
            const destZnr = pi && pi.DSTTXTIDX ? dstIdxToZnr.get(pi.DSTTXTIDX) : undefined;
            const annNo = pi && pi.ANNNO && annSet.has(pi.ANNNO) ? pi.ANNNO : undefined;
            let lfd = 0;
            for (const row of rows) {
                const ortNr = resolveOrtNr(row.GNODIDX);
                if (!ortNr) continue;
                lfd++;
                verlaufRows.push({
                    BASIS_VERSION,
                    LI_NR: v.li,
                    STR_LI_VAR: v.var,
                    LI_LFD_NR: lfd,
                    ORT_NR: ortNr,
                    ONR_TYP_NR: ONR_TYP,
                    ZNR_NR: lfd === 1 ? destZnr : undefined,
                    ANR_NR: lfd === 1 ? annNo : undefined,
                    PRODUKTIV: !!row.PRODUCTIVE
                });
            }
        }
        await bulkInChunks(LidVerlauf, verlaufRows, 1000, 'Linienverläufe speichern');

        // ============ Fahrten (Trip -> RecFrt) ============
        reportProgress('Fahrten einlesen', 0, 1);
        const trips = R('Trip');
        const frtRows: any[] = [];
        for (const t of trips) {
            const v = patIdxToVar.get(t.PATIDX);
            const tagesart = blockIdxToCoDayTyp.get(t.BLOCKIDX);
            frtRows.push({
                BASIS_VERSION,
                FRT_FID: t.TRPIDX,
                FRT_START: t.DPTTM,
                LI_NR: t.ROUTENO,
                STR_LI_VAR: v ? v.var : null,
                UM_UID: t.BLOCKIDX || null,
                TAGESART_NR: tagesart ?? null,
                FAHRTART_NR: t.TRPTYP || 1,
                BEREICH_NR
            });
        }
        await bulkInChunks(RecFrt, frtRows, 1000, 'Fahrten speichern');

        // ============ Fahrzeiten (PatternTravelTime -> RecSel / SEL_FZT_FELD) ============
        reportProgress('Fahrzeiten einlesen', 0, 1);
        const ptt = R('PatternTravelTime');
        // `${PATIDX}-${PATSEGIDX}` -> { [typ]: TRVTM }
        const pttMap = new Map<string, Record<number, number>>();
        for (const r of ptt) {
            const k = `${r.PATIDX}-${r.PATSEGIDX}`;
            if (!pttMap.has(k)) pttMap.set(k, {});
            pttMap.get(k)![r.TRVTMTYP] = r.TRVTM;
        }

        // Pro Halt-Paar (from->to) Fahrzeiten je Typ sammeln + Distanz (DISTTO am Abgangshalt)
        const segDur = new Map<string, Record<number, number[]>>();
        const segDist = new Map<string, number>();
        for (const [patidx, rows] of patByIdx) {
            rows.sort((a, b) => a.SEQNO - b.SEQNO);
            for (let i = 0; i < rows.length - 1; i++) {
                const fromOrt = resolveOrtNr(rows[i].GNODIDX);
                const toOrt = resolveOrtNr(rows[i + 1].GNODIDX);
                if (!fromOrt || !toOrt || fromOrt === toOrt) continue;
                const segKey = `${fromOrt}-${toOrt}`;
                if (!segDist.has(segKey)) segDist.set(segKey, rows[i].DISTTO || 0);
                const times = pttMap.get(`${patidx}-${rows[i].PATSEGIDX}`);
                if (!times) continue;
                if (!segDur.has(segKey)) segDur.set(segKey, {});
                const bucket = segDur.get(segKey)!;
                for (const typ of [1, 2, 3, 4]) {
                    if (times[typ] != null) {
                        if (!bucket[typ]) bucket[typ] = [];
                        bucket[typ].push(times[typ]);
                    }
                }
            }
        }

        const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
        const selRows: any[] = [];
        const fztRows: any[] = [];
        for (const [segKey, bucket] of segDur) {
            const [fromOrt, toOrt] = segKey.split('-').map(Number);
            const dist = segDist.get(segKey) || 0;
            const base = bucket[1] && bucket[1].length ? avg(bucket[1]) : avg(Object.values(bucket).flat());
            selRows.push({
                BASIS_VERSION, BEREICH_NR, ONR_TYP_NR: ONR_TYP,
                ORT_NR: fromOrt, SEL_ZIEL: toOrt, SEL_ZIEL_TYP: ONR_TYP,
                SEL_LAENGE: dist, SEL_FZT: base, FGR_NR: 1
            });
            for (const typ of [1, 2, 3, 4]) {
                if (bucket[typ] && bucket[typ].length) {
                    fztRows.push({
                        BASIS_VERSION, BEREICH_NR, FGR_NR: typ, ONR_TYP_NR: ONR_TYP,
                        ORT_NR: fromOrt, SEL_ZIEL: toOrt, SEL_ZIEL_TYP: ONR_TYP, SEL_FZT: avg(bucket[typ])
                    });
                }
            }
        }
        await bulkInChunks(RecSel, selRows, 1000, 'Fahrzeiten speichern');
        await bulkInChunks(RecSelFztFeld, fztRows, 1000);

        // --- Aufräumen ---
        try { fs.rmSync(root, { recursive: true, force: true }); } catch { /* ignore */ }

        reportProgress('Fertig', 100, 100, 'Import erfolgreich abgeschlossen', true);
        if (parentPort) parentPort.postMessage({ type: 'done' });
        process.exit(0);
    } catch (e: any) {
        console.error('[LIO Worker] Fehler:', e);
        try {
            const { tempDir } = workerData;
            const root = path.isAbsolute(tempDir) ? tempDir : path.join(process.cwd(), 'uploads', tempDir);
            fs.rmSync(root, { recursive: true, force: true });
        } catch { /* ignore */ }
        if (parentPort) parentPort.postMessage({ type: 'error', error: e.message });
        process.exit(1);
    }
};

runImport();
