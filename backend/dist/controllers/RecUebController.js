"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecUebController = void 0;
const RecUeb_1 = require("../models/VDV/RecUeb");
const UebFzt_1 = require("../models/VDV/UebFzt");
/**
 * @swagger
 * tags:
 *   name: RecUeb
 *   description: API for VDV 452 RecUeb (Transfers)
 */
class RecUebController {
    constructor() {
        /**
         * @swagger
         * /vdv/transfers:
         *   get:
         *     summary: Get all Transfers
         *     tags: [RecUeb]
         *     responses:
         *       200:
         *         description: List of Transfers
         */
        this.getAll = async (req, res) => {
            try {
                const list = await RecUeb_1.RecUeb.findAll({ include: [UebFzt_1.UebFzt] });
                res.json(list);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        // Since PK is composite, getting by ID requires multiple params or a filter query.
        // For simplicity, we might just filter or omit specific ID fetch for now unless needed.
        this.create = async (req, res) => {
            try {
                const item = await RecUeb_1.RecUeb.create(req.body);
                res.json(item);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        /**
         * @swagger
         * /vdv/transfers/detail:
         *   get:
         *     summary: Get specific Transfer by composite key
         *     tags: [RecUeb]
         *     parameters:
         *       - in: query
         *         name: BASIS_VERSION
         *         schema: { type: integer }
         *       - in: query
         *         name: BEREICH_NR
         *         schema: { type: integer }
         *       - in: query
         *         name: ONR_TYP_NR
         *         schema: { type: integer }
         *       - in: query
         *         name: ORT_NR
         *         schema: { type: integer }
         *       - in: query
         *         name: UEB_ZIEL_TYP
         *         schema: { type: integer }
         *       - in: query
         *         name: UEB_ZIEL
         *         schema: { type: integer }
         *     responses:
         *       200:
         *         description: Transfer object
         */
        this.getOne = async (req, res) => {
            try {
                const { BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, UEB_ZIEL_TYP, UEB_ZIEL } = req.query;
                const item = await RecUeb_1.RecUeb.findOne({
                    where: {
                        BASIS_VERSION,
                        BEREICH_NR,
                        ONR_TYP_NR,
                        ORT_NR,
                        UEB_ZIEL_TYP,
                        UEB_ZIEL
                    },
                    include: [UebFzt_1.UebFzt]
                });
                if (item)
                    res.json(item);
                else
                    res.status(404).json({ error: 'Not found' });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.update = async (req, res) => {
            try {
                // Complex update logic... simplified to creating/overwriting for now or handled via body keys
                // Ensuring we find the right record
                const { BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, UEB_ZIEL_TYP, UEB_ZIEL } = req.body;
                const [updated] = await RecUeb_1.RecUeb.update(req.body, {
                    where: {
                        BASIS_VERSION,
                        BEREICH_NR,
                        ONR_TYP_NR,
                        ORT_NR,
                        UEB_ZIEL_TYP,
                        UEB_ZIEL
                    }
                });
                // Also update children (UebFzt) would be needed here, simplified for brevity.
                res.json({ success: true });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.delete = async (req, res) => {
            try {
                const { BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, UEB_ZIEL_TYP, UEB_ZIEL } = req.query;
                await RecUeb_1.RecUeb.destroy({
                    where: {
                        BASIS_VERSION,
                        BEREICH_NR,
                        ONR_TYP_NR,
                        ORT_NR,
                        UEB_ZIEL_TYP,
                        UEB_ZIEL
                    }
                });
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
    }
}
exports.RecUebController = RecUebController;
