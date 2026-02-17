"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecSelController = void 0;
const RecSel_1 = require("../models/VDV/RecSel");
const RecOrt_1 = require("../models/VDV/RecOrt");
const RecSelFztFeld_1 = require("../models/VDV/RecSelFztFeld");
/**
 * Controller for RecSel (Netzrelationen)
 * VDV 452 Table 403
 */
class RecSelController {
    constructor() {
        this.getAll = async (req, res) => {
            try {
                const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;
                const list = await RecSel_1.RecSel.findAll({
                    where: { BASIS_VERSION: basisVersion },
                    raw: true
                });
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
                const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;
                const sel = await RecSel_1.RecSel.findOne({
                    where: { ORT_NR: ortNr, SEL_ZIEL: selZiel, BASIS_VERSION: basisVersion },
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
                // Ideally basisVersion comes from query or body to identify the row to update
                const basisVersion = req.body.BASIS_VERSION || (req.query.basisVersion ? Number(req.query.basisVersion) : 1);
                const [updated] = await RecSel_1.RecSel.update(req.body, {
                    where: { ORT_NR: ortNr, SEL_ZIEL: selZiel, BASIS_VERSION: basisVersion }
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
                const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;
                const deleted = await RecSel_1.RecSel.destroy({
                    where: { ORT_NR: ortNr, SEL_ZIEL: selZiel, BASIS_VERSION: basisVersion }
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
                // Ensure BASIS_VERSION is set, default to 1 if missing in body
                const data = { ...req.body, BASIS_VERSION: req.body.BASIS_VERSION || 1 };
                const newItem = await RecSel_1.RecSel.create(data);
                res.json(newItem);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        // migrateStopDistances method removed (Legacy StopDistance model deleted)
        this.getFztByBereich = async (req, res) => {
            try {
                const bereichNr = parseInt(req.params.bereichNr);
                const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;
                const list = await RecSelFztFeld_1.RecSelFztFeld.findAll({
                    where: {
                        BEREICH_NR: bereichNr,
                        BASIS_VERSION: basisVersion
                    },
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
                const { BEREICH_NR, FGR_NR, ONR_TYP_NR, ORT_NR, SEL_ZIEL, SEL_ZIEL_TYP, SEL_FZT } = req.body;
                // Use BASIS_VERSION from body, or default to 1. 
                // Warning: if the client doesn't send it, it might default to 1 which could be wrong if editing version 2.
                const BASIS_VERSION = req.body.BASIS_VERSION || 1;
                // Upsert
                const [item, created] = await RecSelFztFeld_1.RecSelFztFeld.findOrCreate({
                    where: {
                        BASIS_VERSION,
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
                    // If it exists, update the time
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
