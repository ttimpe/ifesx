"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationController = void 0;
const RecZnr_1 = require("../models/VDV/RecZnr");
class DestinationController {
    // Get all destinations
    async getAllDestinations(req, res) {
        try {
            const basisVersion = req.query.basis_version || req.query.basisVersion;
            const whereClause = {};
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }
            const destinations = await RecZnr_1.RecZnr.findAll({
                where: whereClause
            });
            const mappedDestinations = destinations.map(d => ({
                ...d.toJSON(),
                id: d.ZNR_NR,
                number: d.ZNR_NR,
                name: d.ZNR_TEXT,
                sign_text: d.ZNR_TEXT
            }));
            return res.status(200).json(mappedDestinations);
        }
        catch (error) {
            console.error('Error fetching destinations:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getDestinationById(req, res) {
        const destinationId = req.params.id;
        try {
            const destination = await RecZnr_1.RecZnr.findByPk(destinationId);
            if (!destination) {
                return res.status(404).json({ message: 'Destination not found' });
            }
            return res.status(200).json({
                ...destination.toJSON(),
                id: destination.ZNR_NR,
                number: destination.ZNR_NR,
                name: destination.ZNR_TEXT,
                sign_text: destination.ZNR_TEXT
            });
        }
        catch (error) {
            console.error('Error fetching destination:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async createDestination(req, res) {
        const { ZNR_NR, ZNR_TEXT, ZNR_KUERZEL, FAHRERKURZTEXT, SEITENTEXT, ZNR_CODE, BASIS_VERSION, number, name, short_name, sign_text } = req.body;
        // Use VDV fields if present, else fall back to legacy mappings
        const nr = ZNR_NR !== undefined ? ZNR_NR : number;
        const text = ZNR_TEXT || name || sign_text || short_name;
        if (nr === undefined || !text) {
            return res.status(400).json({ message: 'ZNR_NR and ZNR_TEXT are required' });
        }
        try {
            const newDestination = await RecZnr_1.RecZnr.create({
                ZNR_NR: nr,
                ZNR_TEXT: text,
                ZNR_KUERZEL: ZNR_KUERZEL || short_name,
                FAHRERKURZTEXT: FAHRERKURZTEXT,
                SEITENTEXT: SEITENTEXT,
                ZNR_CODE: ZNR_CODE,
                BASIS_VERSION: BASIS_VERSION || 1
            });
            return res.status(201).json(newDestination);
        }
        catch (error) {
            console.error('Error creating destination:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateDestination(req, res) {
        const destinationId = req.params.id;
        const { ZNR_NR, ZNR_TEXT, ZNR_KUERZEL, FAHRERKURZTEXT, SEITENTEXT, ZNR_CODE, BASIS_VERSION, number, name, short_name, sign_text } = req.body;
        try {
            const destination = await RecZnr_1.RecZnr.findByPk(destinationId);
            if (!destination) {
                return res.status(404).json({ message: 'Destination not found' });
            }
            // Update destination properties - prioritize VDV fields
            if (ZNR_NR !== undefined)
                destination.ZNR_NR = ZNR_NR;
            else if (number !== undefined)
                destination.ZNR_NR = number;
            if (ZNR_TEXT !== undefined)
                destination.ZNR_TEXT = ZNR_TEXT;
            else if (name !== undefined)
                destination.ZNR_TEXT = name;
            else if (sign_text !== undefined)
                destination.ZNR_TEXT = sign_text;
            if (ZNR_KUERZEL !== undefined)
                destination.ZNR_KUERZEL = ZNR_KUERZEL;
            else if (short_name !== undefined)
                destination.ZNR_KUERZEL = short_name;
            if (FAHRERKURZTEXT !== undefined)
                destination.FAHRERKURZTEXT = FAHRERKURZTEXT;
            if (SEITENTEXT !== undefined)
                destination.SEITENTEXT = SEITENTEXT;
            if (ZNR_CODE !== undefined)
                destination.ZNR_CODE = ZNR_CODE;
            if (BASIS_VERSION !== undefined)
                destination.BASIS_VERSION = BASIS_VERSION;
            await destination.save();
            const result = destination.toJSON();
            return res.status(200).json({
                ...result,
                id: result.ZNR_NR,
                number: result.ZNR_NR,
                name: result.ZNR_TEXT,
                sign_text: result.ZNR_TEXT
            });
        }
        catch (error) {
            console.error('Error updating destination:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async migrateDestinations(req, res) {
        // Migration from legacy model disabled
        return res.status(501).json({ message: 'Migration not available' });
    }
}
exports.DestinationController = DestinationController;
