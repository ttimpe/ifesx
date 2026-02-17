"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecUmlaufController = void 0;
const RecUmlauf_1 = require("../models/VDV/RecUmlauf");
const RecFrt_1 = require("../models/VDV/RecFrt");
const RecUms_1 = require("../models/VDV/RecUms");
class RecUmlaufController {
    constructor() {
        /**
         * @swagger
         * /vdv/blocks:
         *   get:
         *     summary: Get all Blocks (Umläufe)
         *     tags: [RecUmlauf]
         *     responses:
         *       200:
         *         description: List of Blocks
         */
        this.getAll = async (req, res) => {
            try {
                const list = await RecUmlauf_1.RecUmlauf.findAll({
                    limit: 100,
                    include: [{
                            model: RecFrt_1.RecFrt,
                            attributes: ['FRT_START', 'LI_NR', 'LI_KU_NR']
                        }],
                    order: [['UM_UID', 'ASC']]
                });
                // Calculate derived fields
                const enhancedList = list.map((umlauf) => {
                    // Sequelize-Typescript uses the property name defined in the model if available
                    // In RecUmlauf model: @HasMany(() => RecFrt) trips?: RecFrt[];
                    // So it should be 'trips'.
                    const trips = (umlauf.trips || umlauf.REC_FRTs || []);
                    let ausfahrt = null;
                    if (trips.length > 0) {
                        // Find earliest trip
                        const firstTrip = trips.reduce((prev, curr) => (prev.FRT_START || 999999) < (curr.FRT_START || 999999) ? prev : curr);
                        ausfahrt = {
                            zeit: firstTrip.FRT_START,
                            linie: firstTrip.LI_NR,
                            kurs: firstTrip.LI_KU_NR
                        };
                    }
                    else {
                        // console.log(`No trips found for Umlauf ${umlauf.UM_UID}`);
                    }
                    return {
                        ...umlauf.toJSON(),
                        ausfahrt // Attach to response
                    };
                });
                res.json(enhancedList);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        /**
         * @swagger
         * /vdv/blocks/detail:
         *   get:
         *     summary: Get specific Block by PK
         *     tags: [RecUmlauf]
         *     parameters:
         *       - in: query
         *         name: BASIS_VERSION
         *         schema: { type: integer }
         *       - in: query
         *         name: TAGESART_NR
         *         schema: { type: integer }
         *       - in: query
         *         name: UM_UID
         *         schema: { type: integer }
         *     responses:
         *       200:
         *         description: Block object with Trips
         */
        this.getOne = async (req, res) => {
            try {
                const { BASIS_VERSION, TAGESART_NR, UM_UID } = req.query;
                const where = {};
                if (UM_UID)
                    where.UM_UID = UM_UID;
                if (BASIS_VERSION)
                    where.BASIS_VERSION = BASIS_VERSION;
                if (TAGESART_NR)
                    where.TAGESART_NR = TAGESART_NR;
                const item = await RecUmlauf_1.RecUmlauf.findOne({
                    where,
                    include: [RecFrt_1.RecFrt]
                });
                if (item)
                    res.json(item);
                else
                    res.status(404).json({ error: 'Not found' });
            }
            catch (error) {
                console.error('Error in getOne:', error);
                res.status(500).json({ error: error.message });
            }
        };
        this.create = async (req, res) => {
            try {
                const item = await RecUmlauf_1.RecUmlauf.create(req.body);
                res.json(item);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.update = async (req, res) => {
            try {
                const { BASIS_VERSION, TAGESART_NR, UM_UID } = req.body;
                // Primary key cannot be changed easily, but fields can be.
                // However, RecUmlauf mostly contains keys. 
                // If the user wants to change "Kursnummer" (LI_KU_NR), that is actually stored in REC_FRT (RecFrt).
                // But maybe RecUmlauf has attributes too? 
                // Model shows: ANF_ORT, END_ORT, FZG_TYP_NR etc.
                const [updated] = await RecUmlauf_1.RecUmlauf.update(req.body, {
                    where: { BASIS_VERSION, TAGESART_NR, UM_UID }
                });
                // Also, if the user edits the Kurs/Course Number (LI_KU_NR), we might need to update all trips?
                // Wait, LI_KU_NR is on REC_FRT. RecUmlauf doesn't have LI_KU_NR in the model I saw (only ID).
                // Let's check model again. 
                // RecUmlauf.ts: ANF_ORT, END_ORT, FZG_TYP_NR... NO LI_KU_NR.
                // The "Kursnummer" is implicitly the UM_UID or stored on the trips.
                // If the user wants to set FZG_TYP_NR or END_ORT, this update works.
                if (updated)
                    res.json({ success: true });
                else
                    res.status(404).json({ error: 'Not found' });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.setKursNr = async (req, res) => {
            try {
                const { BASIS_VERSION, TAGESART_NR, UM_UID, LI_KU_NR } = req.body;
                // Validate inputs
                if (!UM_UID)
                    return res.status(400).json({ error: 'UM_UID is required' });
                if (LI_KU_NR === undefined)
                    return res.status(400).json({ error: 'LI_KU_NR is required' });
                // Update all trips in this Umlauf
                const [updatedCount] = await RecFrt_1.RecFrt.update({ LI_KU_NR }, {
                    where: {
                        // If BASIS_VERSION and TAGESART_NR are provided, use them for stricter scope
                        // Otherwise just UM_UID (Primary grouping)
                        ...(BASIS_VERSION ? { BASIS_VERSION } : {}),
                        ...(TAGESART_NR ? { TAGESART_NR } : {}),
                        UM_UID
                    }
                });
                res.json({ success: true, updatedCount });
            }
            catch (error) {
                console.error('Error setting KursNr:', error);
                res.status(500).json({ error: error.message });
            }
        };
        this.delete = async (req, res) => {
            try {
                const { BASIS_VERSION, TAGESART_NR, UM_UID } = req.query;
                // Also delete (or unlink) trips?
                // Unlink trips
                await RecFrt_1.RecFrt.update({ UM_UID: null }, { where: { BASIS_VERSION, TAGESART_NR, UM_UID } });
                const deleted = await RecUmlauf_1.RecUmlauf.destroy({
                    where: { BASIS_VERSION, TAGESART_NR, UM_UID }
                });
                res.json({ success: !!deleted });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        // --- RecUms / Block Pieces ---
        /**
         * @swagger
         * /vdv/block-pieces:
         *   get:
         *     summary: Get all Block Pieces (Umlaufstücke)
         *     tags: [RecUms]
         *     responses:
         *       200:
         *         description: List of Block Pieces
         */
        this.getAllUms = async (req, res) => {
            try {
                const list = await RecUms_1.RecUms.findAll({ limit: 100 });
                res.json(list);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
    }
}
exports.RecUmlaufController = RecUmlaufController;
