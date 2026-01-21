"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MengeBereichController = void 0;
const MengeBereich_1 = require("../models/VDV/MengeBereich");
class MengeBereichController {
    constructor() {
        this.getAll = async (req, res) => {
            try {
                const list = await MengeBereich_1.MengeBereich.findAll();
                res.json(list);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const item = await MengeBereich_1.MengeBereich.findOne({ where: { BEREICH_NR: id } });
                if (!item)
                    return res.status(404).json({ error: 'MengeBereich not found' });
                res.json(item);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.create = async (req, res) => {
            try {
                // Default BASIS_VERSION to 1 if not provided
                if (!req.body.BASIS_VERSION)
                    req.body.BASIS_VERSION = 1;
                // Auto-increment BEREICH_NR if not provided
                if (!req.body.BEREICH_NR) {
                    const max = await MengeBereich_1.MengeBereich.max('BEREICH_NR');
                    req.body.BEREICH_NR = (max || 0) + 1;
                }
                const newItem = await MengeBereich_1.MengeBereich.create(req.body);
                res.json(newItem);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.update = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const [updated] = await MengeBereich_1.MengeBereich.update(req.body, { where: { BEREICH_NR: id } });
                if (!updated)
                    return res.status(404).json({ error: 'MengeBereich not found' });
                res.json({ success: true });
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.delete = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const deleted = await MengeBereich_1.MengeBereich.destroy({ where: { BEREICH_NR: id } });
                if (!deleted)
                    return res.status(404).json({ error: 'MengeBereich not found' });
                res.status(204).send();
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
    }
}
exports.MengeBereichController = MengeBereichController;
