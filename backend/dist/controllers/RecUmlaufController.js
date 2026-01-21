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
                const list = await RecUmlauf_1.RecUmlauf.findAll({ limit: 100 });
                res.json(list);
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
