"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecSelController = void 0;
const RecHp_1 = require("../models/VDV/RecHp");
const RecSel_1 = require("../models/VDV/RecSel");
const RecOrt_1 = require("../models/VDV/RecOrt");
const StopDistance_1 = require("../models/StopDistance");
const MengeBereich_1 = require("../models/VDV/MengeBereich");
const RecSelFztFeld_1 = require("../models/VDV/RecSelFztFeld");
/**
 * Controller for RecSel (Netzrelationen)
 * VDV 452 Table 403
 */
class RecSelController {
    constructor() {
        this.getAll = async (req, res) => {
            try {
                const list = await RecSel_1.RecSel.findAll({ raw: true });
                // Fetch all Orte for name lookup
                const orte = await RecOrt_1.RecOrt.findAll({
                    attributes: ['ORT_NR', 'ORT_NAME'],
                    raw: true
                });
                const ortMap = new Map(orte.map(o => [o.ORT_NR, o.ORT_NAME]));
                // Add names to each row
                const enriched = list.map(sel => ({
                    ...sel,
                    ORT_NAME: ortMap.get(sel.ORT_NR) || `Ort ${sel.ORT_NR}`,
                    SEL_ZIEL_NAME: ortMap.get(sel.SEL_ZIEL) || `Ort ${sel.SEL_ZIEL}`
                }));
                res.json(enriched);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.getByCompositeKey = async (req, res) => {
            try {
                const ortNr = parseInt(req.params.ortNr);
                const selZiel = parseInt(req.params.selZiel);
                const sel = await RecSel_1.RecSel.findOne({
                    where: { ORT_NR: ortNr, SEL_ZIEL: selZiel },
                    raw: true
                });
                if (!sel) {
                    return res.status(404).json({ error: 'RecSel not found' });
                }
                // Enrich with ORT names
                const orte = await RecOrt_1.RecOrt.findAll({
                    where: { ORT_NR: [ortNr, selZiel] },
                    attributes: ['ORT_NR', 'ORT_NAME'],
                    raw: true
                });
                const ortMap = new Map(orte.map(o => [o.ORT_NR, o.ORT_NAME]));
                const enriched = {
                    ...sel,
                    ORT_NAME: ortMap.get(sel.ORT_NR) || `Ort ${sel.ORT_NR}`,
                    SEL_ZIEL_NAME: ortMap.get(sel.SEL_ZIEL) || `Ort ${sel.SEL_ZIEL}`
                };
                res.json(enriched);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.updateByCompositeKey = async (req, res) => {
            try {
                const ortNr = parseInt(req.params.ortNr);
                const selZiel = parseInt(req.params.selZiel);
                const [updated] = await RecSel_1.RecSel.update(req.body, {
                    where: { ORT_NR: ortNr, SEL_ZIEL: selZiel }
                });
                if (!updated) {
                    return res.status(404).json({ error: 'RecSel not found' });
                }
                res.json({ message: 'Updated successfully' });
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.deleteByCompositeKey = async (req, res) => {
            try {
                const ortNr = parseInt(req.params.ortNr);
                const selZiel = parseInt(req.params.selZiel);
                const deleted = await RecSel_1.RecSel.destroy({
                    where: { ORT_NR: ortNr, SEL_ZIEL: selZiel }
                });
                if (!deleted) {
                    return res.status(404).json({ error: 'RecSel not found' });
                }
                res.status(204).send();
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.create = async (req, res) => {
            try {
                const newItem = await RecSel_1.RecSel.create(req.body);
                res.json(newItem);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        /**
         * Migrates StopDistance (Legacy) to RecSel (VDV) and RecSelFztFeld (Travel Times)
         * Mapping Key: DHID -> ORT_NR
         */
        this.migrateStopDistances = async (req, res) => {
            try {
                console.log('Starting Migration: StopDistances -> RecSel + FztFeld');
                // Ensure default MengeBereich exists
                let defaultBereich = await MengeBereich_1.MengeBereich.findByPk(1);
                if (!defaultBereich) {
                    await MengeBereich_1.MengeBereich.create({
                        BASIS_VERSION: 1,
                        BEREICH_NR: 1,
                        STR_BEREICH: 'STD',
                        BEREICH_TEXT: 'Standard'
                    });
                }
                const distances = await StopDistance_1.StopDistance.findAll();
                let count = 0;
                let fztCount = 0;
                let skipped = 0;
                for (const dist of distances) {
                    // 1. Resolve Origin DHID -> ORT_NR
                    const originHp = await RecHp_1.RecHp.findOne({ where: { DHID: dist.origin_stop_id } });
                    // 2. Resolve Dest DHID -> ORT_NR
                    const destHp = await RecHp_1.RecHp.findOne({ where: { DHID: dist.destination_stop_id } });
                    if (originHp && destHp) {
                        // Check if RecSel exists
                        const exists = await RecSel_1.RecSel.findOne({
                            where: {
                                ORT_NR: originHp.ORT_NR,
                                SEL_ZIEL: destHp.ORT_NR,
                                ONR_TYP_NR: originHp.ONR_TYP_NR,
                                SEL_ZIEL_TYP: destHp.ONR_TYP_NR,
                                BASIS_VERSION: 1
                            }
                        });
                        if (!exists) {
                            await RecSel_1.RecSel.create({
                                BASIS_VERSION: 1,
                                BEREICH_NR: 1, // Default Area
                                ONR_TYP_NR: originHp.ONR_TYP_NR,
                                ORT_NR: originHp.ORT_NR,
                                SEL_ZIEL: destHp.ORT_NR,
                                SEL_ZIEL_TYP: destHp.ONR_TYP_NR,
                                SEL_LAENGE: Math.round(dist.distance),
                                SEL_FZT: dist.time || 0,
                                FGR_NR: 1 // Default Group
                            });
                            count++;
                        }
                        else {
                            // Update
                            exists.SEL_LAENGE = Math.round(dist.distance);
                            if (dist.time)
                                exists.SEL_FZT = dist.time;
                            await exists.save();
                            count++;
                        }
                        // Populate RecSelFztFeld (Travel Time Field) for Standard Area (1)
                        if (dist.time) {
                            const fztExists = await RecSelFztFeld_1.RecSelFztFeld.findOne({
                                where: {
                                    ORT_NR: originHp.ORT_NR,
                                    SEL_ZIEL: destHp.ORT_NR,
                                    ONR_TYP_NR: originHp.ONR_TYP_NR,
                                    SEL_ZIEL_TYP: destHp.ONR_TYP_NR,
                                    BEREICH_NR: 1,
                                    FGR_NR: 1,
                                    BASIS_VERSION: 1
                                }
                            });
                            if (!fztExists) {
                                await RecSelFztFeld_1.RecSelFztFeld.create({
                                    BASIS_VERSION: 1,
                                    BEREICH_NR: 1,
                                    FGR_NR: 1,
                                    ONR_TYP_NR: originHp.ONR_TYP_NR,
                                    ORT_NR: originHp.ORT_NR,
                                    SEL_ZIEL: destHp.ORT_NR,
                                    SEL_ZIEL_TYP: destHp.ONR_TYP_NR,
                                    SEL_FZT: dist.time
                                });
                                fztCount++;
                            }
                            else {
                                fztExists.SEL_FZT = dist.time;
                                await fztExists.save();
                                fztCount++;
                            }
                        }
                    }
                    else {
                        console.warn(`Skipping distance ${dist.origin_stop_id} -> ${dist.destination_stop_id}: DHID not found in RecHp`);
                        skipped++;
                    }
                }
                res.json({
                    message: 'Migration completed',
                    recSelProcessed: count,
                    recSelFztFeldProcessed: fztCount,
                    skipped: skipped
                });
            }
            catch (e) {
                console.error('Migration Error:', e);
                res.status(500).json({ error: 'Migration failed', details: e });
            }
        };
        this.getFztByBereich = async (req, res) => {
            try {
                const bereichNr = parseInt(req.params.bereichNr);
                const list = await RecSelFztFeld_1.RecSelFztFeld.findAll({
                    where: { BEREICH_NR: bereichNr },
                    raw: true
                });
                // Enrich with ORT names
                const orte = await RecOrt_1.RecOrt.findAll({
                    attributes: ['ORT_NR', 'ORT_NAME'],
                    raw: true
                });
                const ortMap = new Map(orte.map(o => [o.ORT_NR, o.ORT_NAME]));
                const enriched = list.map(sel => ({
                    ...sel,
                    ORT_NAME: ortMap.get(sel.ORT_NR) || `Ort ${sel.ORT_NR}`,
                    SEL_ZIEL_NAME: ortMap.get(sel.SEL_ZIEL) || `Ort ${sel.SEL_ZIEL}`
                }));
                res.json(enriched);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.updateFzt = async (req, res) => {
            try {
                const { BASIS_VERSION, BEREICH_NR, FGR_NR, ONR_TYP_NR, ORT_NR, SEL_ZIEL, SEL_ZIEL_TYP, SEL_FZT } = req.body;
                // Upsert
                const [item, created] = await RecSelFztFeld_1.RecSelFztFeld.findOrCreate({
                    where: {
                        BASIS_VERSION: 1, // Default
                        BEREICH_NR,
                        FGR_NR,
                        ONR_TYP_NR,
                        ORT_NR,
                        SEL_ZIEL,
                        SEL_ZIEL_TYP
                    },
                    defaults: { SEL_FZT }
                });
                if (!created) {
                    item.SEL_FZT = SEL_FZT;
                    await item.save();
                }
                res.json({ success: true, item });
            }
            catch (e) {
                console.error(e);
                res.status(500).json({ error: e });
            }
        };
    }
}
exports.RecSelController = RecSelController;
