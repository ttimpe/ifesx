"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecAnrController = void 0;
const RecAnr_1 = require("../models/VDV/RecAnr");
/**
 * @swagger
 * tags:
 *   name: RecAnr
 *   description: API for VDV 452 RecAnr (Anschluss-Texte)
 */
class RecAnrController {
    constructor() {
        /**
         * @swagger
         * /vdv/anschluss:
         *   get:
         *     summary: Get all RecAnr entries
         *     tags: [RecAnr]
         *     responses:
         *       200:
         *         description: List of RecAnr
         */
        this.getAll = async (req, res) => {
            try {
                const list = await RecAnr_1.RecAnr.findAll();
                res.json(list);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        /**
         * @swagger
         * /vdv/anschluss/{id}:
         *   get:
         *     summary: Get RecAnr by ID (ANR_NR)
         *     tags: [RecAnr]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *     responses:
         *       200:
         *         description: RecAnr object
         */
        this.getById = async (req, res) => {
            try {
                const item = await RecAnr_1.RecAnr.findOne({ where: { ANR_NR: req.params.id } });
                if (item)
                    res.json(item);
                else
                    res.status(404).json({ error: 'Not found' });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        /**
         * @swagger
         * /vdv/anschluss:
         *   post:
         *     summary: Create RecAnr
         *     tags: [RecAnr]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               ANR_NR:
         *                 type: integer
         *               ANR_TEXT:
         *                 type: string
         *     responses:
         *       200:
         *         description: Created
         */
        this.create = async (req, res) => {
            try {
                const item = await RecAnr_1.RecAnr.create(req.body);
                res.json(item);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        /**
         * @swagger
         * /vdv/anschluss/{id}:
         *   put:
         *     summary: Update RecAnr
         *     tags: [RecAnr]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: integer
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *            schema:
         *              type: object
         *              properties:
         *                ANR_TEXT:
         *                  type: string
         *     responses:
         *       200:
         *         description: Updated
         */
        this.update = async (req, res) => {
            try {
                const [updated] = await RecAnr_1.RecAnr.update(req.body, { where: { ANR_NR: req.params.id } });
                if (updated) {
                    const updatedItem = await RecAnr_1.RecAnr.findOne({ where: { ANR_NR: req.params.id } });
                    res.json(updatedItem);
                }
                else {
                    res.status(404).json({ error: 'Not found' });
                }
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
        this.delete = async (req, res) => {
            try {
                const deleted = await RecAnr_1.RecAnr.destroy({ where: { ANR_NR: req.params.id } });
                if (deleted)
                    res.status(204).send();
                else
                    res.status(404).json({ error: 'Not found' });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        };
    }
}
exports.RecAnrController = RecAnrController;
