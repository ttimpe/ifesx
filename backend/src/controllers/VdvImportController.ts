/**
 * VDV Import Controller
 * Handles import of VDV 451/452 .x10 files
 */

import { Request, Response } from 'express';
import multer from 'multer';
import iconv from 'iconv-lite';
import fs from 'fs';
import { parseVdvFile, getModelNameForTable } from '../utils/vdv-parser';

// Import all VDV models for dynamic access
import { RecOrt } from '../models/VDV/RecOrt';
import { RecHp } from '../models/VDV/RecHp';
import { RecLid } from '../models/VDV/RecLid';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecSel } from '../models/VDV/RecSel';
import { RecUeb } from '../models/VDV/RecUeb';
import { RecZnr } from '../models/VDV/RecZnr';
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecUms } from '../models/VDV/RecUms';
import { RecOm } from '../models/VDV/RecOm';
import { RecAnr } from '../models/VDV/RecAnr';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { UebFzt } from '../models/VDV/UebFzt';
import { RecSelFztFeld } from '../models/VDV/RecSelFztFeld';
import { MengeBereich } from '../models/VDV/MengeBereich';
import { MengeFgr } from '../models/VDV/MengeFgr';
import { MengeFahrtart } from '../models/VDV/MengeFahrtart';
import { MengeFzgTyp } from '../models/VDV/MengeFzgTyp';
import { Tagesart } from '../models/VDV/Tagesart';
import { BasisVersion } from '../models/VDV/BasisVersion';
import { Einzelanschluss } from '../models/VDV/Einzelanschluss';
import { Fahrzeug } from '../models/VDV/Fahrzeug';
import { Betriebstag } from '../models/VDV/Betriebstag';

// Model registry for dynamic access
const modelRegistry: Record<string, any> = {
    RecOrt,
    RecHp,
    RecLid,
    RecFrt,
    RecSel,
    RecUeb,
    RecZnr,
    RecUmlauf,
    RecUms,
    RecOm,
    RecAnr,
    LidVerlauf,
    UebFzt,
    RecSelFztFeld,
    MengeBereich,
    MengeFgr,
    MengeFahrtart,
    MengeFzgTyp,
    Tagesart,
    BasisVersion,
    Einzelanschluss,
    Fahrzeug,
    Betriebstag
};

export class VdvImportController {

    /**
     * Import a VDV .x10 file
     * POST /api/vdv/import-x10
     */
    importX10 = async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const basisVersion = parseInt(req.body.basisVersion as string, 10) || 1;
            const mode = req.body.mode || 'merge'; // 'merge' or 'replace'

            // Read file and decode from ISO8859-1
            const buffer = fs.readFileSync(req.file.path);
            const content = iconv.decode(buffer, 'ISO-8859-1');

            // Parse VDV file
            const parsed = parseVdvFile(content);

            if (!parsed.tableName) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: 'Could not detect table name in file' });
            }

            // Get model for table
            const modelName = getModelNameForTable(parsed.tableName);
            if (!modelName) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    error: `Unknown table: ${parsed.tableName}`,
                    supportedTables: Object.keys(modelRegistry)
                });
            }

            const Model = modelRegistry[modelName];
            if (!Model) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: `Model not found: ${modelName}` });
            }

            // Add BASIS_VERSION to each record
            const recordsWithVersion = parsed.records.map(record => ({
                ...record,
                BASIS_VERSION: basisVersion
            }));

            // Delete existing records if mode is 'replace'
            if (mode === 'replace') {
                await Model.destroy({ where: { BASIS_VERSION: basisVersion } });
            }

            // Insert records
            let insertedCount = 0;
            let updatedCount = 0;
            let errorCount = 0;
            const errors: string[] = [];

            for (const record of recordsWithVersion as any[]) {
                try {
                    // Special handling for REC_ORT: merge by ORT_REF_ORT_LangNr
                    if (parsed.tableName === 'REC_ORT' && record.ORT_REF_ORT_LangNr) {
                        const existing = await RecOrt.findOne({
                            where: {
                                ORT_REF_ORT_LangNr: record.ORT_REF_ORT_LangNr,
                                BASIS_VERSION: basisVersion
                            }
                        });

                        if (existing) {
                            // Update existing record
                            await existing.update(record);
                            updatedCount++;
                        } else {
                            // Create new record with auto-generated ORT_NR
                            const maxOrtNr = await RecOrt.max('ORT_NR', {
                                where: { BASIS_VERSION: basisVersion }
                            }) as number || 100000;
                            record.ORT_NR = maxOrtNr + 1;
                            await RecOrt.create(record);
                            insertedCount++;
                        }
                    } else {
                        // Default upsert behavior
                        await Model.upsert(record);
                        insertedCount++;
                    }
                } catch (err: any) {
                    errorCount++;
                    if (errors.length < 5) {
                        errors.push(`Record error: ${err.message}`);
                    }
                }
            }

            // Cleanup temp file
            fs.unlinkSync(req.file.path);

            return res.json({
                success: true,
                tableName: parsed.tableName,
                modelName,
                totalRecords: parsed.records.length,
                insertedCount,
                errorCount,
                errors: errors.length > 0 ? errors : undefined,
                header: parsed.header
            });

        } catch (error: any) {
            console.error('[VDV Import] Error:', error);
            if (req.file?.path) {
                try { fs.unlinkSync(req.file.path); } catch { }
            }
            return res.status(500).json({ error: error.message });
        }
    };

    /**
   * Analyze a VDV .x10 file without importing
   * POST /api/vdv/analyze-x10
   */
    analyzeX10 = async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            // Read file and decode from ISO8859-1
            const buffer = fs.readFileSync(req.file.path);
            const content = iconv.decode(buffer, 'ISO-8859-1');

            // Parse VDV file
            const parsed = parseVdvFile(content);

            // Cleanup temp file
            fs.unlinkSync(req.file.path);

            const modelName = getModelNameForTable(parsed.tableName);

            return res.json({
                tableName: parsed.tableName,
                modelName,
                supported: !!modelName,
                columns: parsed.columns,
                formats: parsed.formats,
                recordCount: parsed.records.length,
                sampleRecords: parsed.records.slice(0, 3),
                header: parsed.header
            });

        } catch (error: any) {
            console.error('[VDV Analyze] Error:', error);
            if (req.file?.path) {
                try { fs.unlinkSync(req.file.path); } catch { }
            }
            return res.status(500).json({ error: error.message });
        }
    };

    /**
     * Export a table as VDV 452 .x10 file
     * GET /api/vdv/export-x10/:tableName
     */
    exportX10 = async (req: Request, res: Response) => {
        try {
            const tableName = req.params.tableName.toUpperCase();
            const basisVersion = parseInt(req.query.basisVersion as string, 10) || 1;

            const modelName = getModelNameForTable(tableName);
            if (!modelName) {
                return res.status(400).json({
                    error: `Unknown table: ${tableName}`,
                    supportedTables: Object.keys(modelRegistry)
                });
            }

            const Model = modelRegistry[modelName];
            if (!Model) {
                return res.status(400).json({ error: `Model not found: ${modelName}` });
            }

            // Fetch all records
            const records = await Model.findAll({
                where: { BASIS_VERSION: basisVersion },
                raw: true
            });

            // Get column info from model
            const attributes = Model.getAttributes();
            const columns = Object.keys(attributes).filter(col => col !== 'createdAt' && col !== 'updatedAt');

            // Generate VDV 452 format
            const now = new Date();
            const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            let output = '';
            output += `mod; ${dateStr}; ${timeStr}\n`;
            output += `src; "IFESX"\n`;
            output += `chs; ISO8859-1\n`;
            output += `ver; "1.0"\n`;
            output += `ifv; "1.0.0"\n`;
            output += `dve; "1.0.0"\n`;
            output += `fft; ""\n`;
            output += `tbl; ${tableName}\n`;
            output += `atr; ${columns.join('; ')}\n`;

            // Generate format line
            const formats = columns.map(col => {
                const attr = attributes[col];
                const type = attr.type.toString().toLowerCase();
                if (type.includes('integer') || type.includes('bigint')) {
                    return 'num[9]';
                } else if (type.includes('float') || type.includes('double') || type.includes('decimal')) {
                    return 'dec[12.6]';
                } else {
                    return 'char[255]';
                }
            });
            output += `frm; ${formats.join('; ')}\n`;

            // Generate records
            for (const record of records) {
                const values = columns.map(col => {
                    const val = record[col];
                    if (val === null || val === undefined) return '';
                    if (typeof val === 'string') {
                        // Quote strings and escape internal quotes
                        return `"${val.replace(/"/g, '""')}"`;
                    }
                    return String(val);
                });
                output += `rec; ${values.join('; ')}\n`;
            }

            output += `end; ${records.length}\n`;
            output += `eof; 1\n`;

            // Convert to ISO8859-1
            const buffer = iconv.encode(output, 'ISO-8859-1');

            // Set headers for download
            res.setHeader('Content-Type', 'text/plain; charset=ISO-8859-1');
            res.setHeader('Content-Disposition', `attachment; filename="${tableName.toLowerCase()}.x10"`);
            return res.send(buffer);

        } catch (error: any) {
            console.error('[VDV Export] Error:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    /**
     * Get list of supported tables for import/export
     * GET /api/vdv/tables
     */
    getSupportedTables = async (req: Request, res: Response) => {
        const tables = Object.entries({
            'REC_ORT': 'Orte/Haltestellen',
            'REC_HP': 'Haltepunkte',
            'REC_LID': 'Linien',
            'REC_FRT': 'Fahrten',
            'REC_SEL': 'Selektionen',
            'REC_ZNR': 'Zielansagen',
            'REC_UMLAUF': 'Umläufe',
            'LID_VERLAUF': 'Linienverlauf',
            'MENGE_BEREICH': 'Bereiche',
            'MENGE_FGR': 'Fahrzeitgruppen',
            'MENGE_FAHRTART': 'Fahrtarten',
            'MENGE_FZG_TYP': 'Fahrzeugtypen',
            'FAHRZEUG': 'Fahrzeuge',
            'MENGE_TAGESART': 'Tagesarten',
            'MENGE_BASIS_VERSIONEN': 'Basis-Versionen',
            'FIRMENKALENDER': 'Betriebskalender'
        }).map(([name, description]) => ({ name, description }));

        return res.json(tables);
    };
}
