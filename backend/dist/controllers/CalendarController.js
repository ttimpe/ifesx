"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const Tagesart_1 = require("../models/VDV/Tagesart");
const Betriebstag_1 = require("../models/VDV/Betriebstag");
class CalendarController {
    // Tagesart / MENGE_TAGESART
    async getTagesarten(req, res) {
        try {
            const tagesarten = await Tagesart_1.Tagesart.findAll();
            return res.status(200).json(tagesarten);
        }
        catch (error) {
            console.error('Error fetching Tagesarten:', error);
            return res.status(500).json({ message: 'Error fetching Tagesarten', error });
        }
    }
    async addTagesart(req, res) {
        console.log('Add tagesart called');
        try {
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is required' });
            }
            const tagesart_nr = parseInt(req.body['tagesart_nr']);
            const tagesart_text = req.body['tagesart_text'];
            // Validate required fields
            if (!tagesart_nr) {
                return res.status(400).json({ message: 'TAGESART_NR is required' });
            }
            // Check for duplicate TAGESART_NR
            const existing = await Tagesart_1.Tagesart.findOne({ where: { TAGESART_NR: tagesart_nr } });
            if (existing) {
                return res.status(400).json({ message: 'TAGESART_NR already exists' });
            }
            const tagesart = await Tagesart_1.Tagesart.create({
                TAGESART_NR: tagesart_nr,
                TAGESART_TEXT: tagesart_text
            });
            return res.status(201).json(tagesart);
        }
        catch (error) {
            console.error('Error creating Tagesart:', error);
            return res.status(500).json({ message: 'Error creating Tagesart', error });
        }
    }
    async editTagesart(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }
            const tagesart = await Tagesart_1.Tagesart.findByPk(id);
            if (!tagesart) {
                return res.status(404).json({ message: 'Tagesart not found' });
            }
            // Update fields
            if (req.body.tagesart_nr !== undefined) {
                tagesart.TAGESART_NR = parseInt(req.body.tagesart_nr);
            }
            if (req.body.tagesart_text !== undefined) {
                tagesart.TAGESART_TEXT = req.body.tagesart_text;
            }
            await tagesart.save();
            return res.status(200).json(tagesart);
        }
        catch (error) {
            console.error('Error updating Tagesart:', error);
            return res.status(500).json({ message: 'Error updating Tagesart', error });
        }
    }
    async deleteTagesart(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }
            const tagesart = await Tagesart_1.Tagesart.findByPk(id);
            if (!tagesart) {
                return res.status(404).json({ message: 'Tagesart not found' });
            }
            // Check for dependencies in Betriebstage
            const dependentBetriebstage = await Betriebstag_1.Betriebstag.count({
                where: { TAGESART_NR: tagesart.TAGESART_NR }
            });
            if (dependentBetriebstage > 0) {
                return res.status(400).json({
                    message: `Cannot delete Tagesart: ${dependentBetriebstage} Betriebstage are using this Tagesart`
                });
            }
            await tagesart.destroy();
            return res.status(200).json({ message: 'Tagesart deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting Tagesart:', error);
            return res.status(500).json({ message: 'Error deleting Tagesart', error });
        }
    }
    // Basis Versionen - moved to DataController
    // Betriebstage / FIRMENKALENDER
    async getBetriebstage(req, res) {
        try {
            const betriebstage = await Betriebstag_1.Betriebstag.findAll({
                include: [{
                        model: Tagesart_1.Tagesart,
                        as: 'tagesart'
                    }],
                order: [['BETRIEBSTAG', 'ASC']]
            });
            return res.status(200).json(betriebstage);
        }
        catch (error) {
            console.error('Error fetching Betriebstage:', error);
            return res.status(500).json({ message: 'Error fetching Betriebstage', error });
        }
    }
    async addBetriebstag(req, res) {
        try {
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is required' });
            }
            const betriebstag = parseInt(req.body['betriebstag']);
            const betriebstag_text = req.body['betriebstag_text'] || '';
            const tagesart_nr = parseInt(req.body['tagesart_nr']);
            // Validate required fields
            if (!betriebstag) {
                return res.status(400).json({ message: 'BETRIEBSTAG is required' });
            }
            if (!tagesart_nr) {
                return res.status(400).json({ message: 'TAGESART_NR is required' });
            }
            // Verify that the Tagesart exists
            const tagesart = await Tagesart_1.Tagesart.findOne({ where: { TAGESART_NR: tagesart_nr } });
            if (!tagesart) {
                return res.status(400).json({ message: 'Invalid TAGESART_NR: Tagesart does not exist' });
            }
            const newBetriebstag = await Betriebstag_1.Betriebstag.create({
                BETRIEBSTAG: betriebstag,
                BETRIEBSTAG_TEXT: betriebstag_text,
                TAGESART_NR: tagesart_nr
            });
            // Fetch with relations
            const created = await Betriebstag_1.Betriebstag.findByPk(newBetriebstag.id, {
                include: [{
                        model: Tagesart_1.Tagesart,
                        as: 'tagesart'
                    }]
            });
            return res.status(201).json(created);
        }
        catch (error) {
            console.error('Error creating Betriebstag:', error);
            return res.status(500).json({ message: 'Error creating Betriebstag', error });
        }
    }
    async editBetriebstag(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }
            const betriebstag = await Betriebstag_1.Betriebstag.findByPk(id);
            if (!betriebstag) {
                return res.status(404).json({ message: 'Betriebstag not found' });
            }
            // Update fields
            if (req.body.betriebstag !== undefined) {
                betriebstag.BETRIEBSTAG = parseInt(req.body.betriebstag);
            }
            if (req.body.betriebstag_text !== undefined) {
                betriebstag.BETRIEBSTAG_TEXT = req.body.betriebstag_text;
            }
            if (req.body.tagesart_nr !== undefined) {
                const tagesart_nr = parseInt(req.body.tagesart_nr);
                // Verify that the Tagesart exists
                const tagesart = await Tagesart_1.Tagesart.findOne({ where: { TAGESART_NR: tagesart_nr } });
                if (!tagesart) {
                    return res.status(400).json({ message: 'Invalid TAGESART_NR: Tagesart does not exist' });
                }
                betriebstag.TAGESART_NR = tagesart_nr;
            }
            await betriebstag.save();
            // Fetch with relations
            const updated = await Betriebstag_1.Betriebstag.findByPk(id, {
                include: [{
                        model: Tagesart_1.Tagesart,
                        as: 'tagesart'
                    }]
            });
            return res.status(200).json(updated);
        }
        catch (error) {
            console.error('Error updating Betriebstag:', error);
            return res.status(500).json({ message: 'Error updating Betriebstag', error });
        }
    }
    async deleteBetriebstag(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }
            const betriebstag = await Betriebstag_1.Betriebstag.findByPk(id);
            if (!betriebstag) {
                return res.status(404).json({ message: 'Betriebstag not found' });
            }
            await betriebstag.destroy();
            return res.status(200).json({ message: 'Betriebstag deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting Betriebstag:', error);
            return res.status(500).json({ message: 'Error deleting Betriebstag', error });
        }
    }
}
exports.CalendarController = CalendarController;
