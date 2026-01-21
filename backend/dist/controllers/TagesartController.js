"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagesartController = void 0;
const Tagesart_1 = require("../models/VDV/Tagesart");
class TagesartController {
    async getAll(req, res) {
        try {
            const data = await Tagesart_1.Tagesart.findAll();
            res.json(data);
        }
        catch (error) {
            console.error('Error fetching tagesart:', error);
            res.status(500).json({ error: 'Failed to fetch tagesart' });
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const data = await Tagesart_1.Tagesart.findOne({ where: { TAGESART_NR: id } });
            if (!data) {
                return res.status(404).json({ error: 'Tagesart not found' });
            }
            res.json(data);
        }
        catch (error) {
            console.error('Error fetching tagesart:', error);
            res.status(500).json({ error: 'Failed to fetch tagesart' });
        }
    }
}
exports.TagesartController = TagesartController;
