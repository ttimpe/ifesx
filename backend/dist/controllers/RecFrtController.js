"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecFrtController = void 0;
const RecFrt_1 = require("../models/VDV/RecFrt");
/**
 * Controller for REC_FRT (Fahrten / Trips)
 * VDV 452 compliant
 */
class RecFrtController {
    // Get all trips
    async getAll(req, res) {
        try {
            const trips = await RecFrt_1.RecFrt.findAll({
                order: [['FRT_START', 'ASC']]
            });
            res.json(trips);
        }
        catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).json({ error: 'Failed to fetch trips' });
        }
    }
    // Get trips by Umlauf (UM_UID)
    async getByUmlauf(req, res) {
        try {
            const umUid = parseInt(req.params.umUid);
            const tagesartNr = req.query.tagesartNr ? parseInt(req.query.tagesartNr) : undefined;
            const where = { UM_UID: umUid };
            if (tagesartNr)
                where.TAGESART_NR = tagesartNr;
            const trips = await RecFrt_1.RecFrt.findAll({
                where,
                order: [['FRT_START', 'ASC']]
            });
            res.json(trips);
        }
        catch (error) {
            console.error('Error fetching trips by umlauf:', error);
            res.status(500).json({ error: 'Failed to fetch trips' });
        }
    }
    // Get single trip by composite key
    async getByCompositeKey(req, res) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);
            const trip = await RecFrt_1.RecFrt.findOne({
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });
            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.json(trip);
        }
        catch (error) {
            console.error('Error fetching trip:', error);
            res.status(500).json({ error: 'Failed to fetch trip' });
        }
    }
    // Create new trip
    async create(req, res) {
        try {
            const trip = await RecFrt_1.RecFrt.create(req.body);
            res.status(201).json(trip);
        }
        catch (error) {
            console.error('Error creating trip:', error);
            res.status(500).json({ error: 'Failed to create trip' });
        }
    }
    // Update trip by composite key
    async update(req, res) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);
            const [updated] = await RecFrt_1.RecFrt.update(req.body, {
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });
            if (!updated) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.json({ message: 'Trip updated' });
        }
        catch (error) {
            console.error('Error updating trip:', error);
            res.status(500).json({ error: 'Failed to update trip' });
        }
    }
    // Delete trip by composite key
    async delete(req, res) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);
            const deleted = await RecFrt_1.RecFrt.destroy({
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });
            if (!deleted) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting trip:', error);
            res.status(500).json({ error: 'Failed to delete trip' });
        }
    }
    // Get next available FRT_FID for a given BASIS_VERSION
    async getNextFrtFid(req, res) {
        try {
            const basisVersion = parseInt(req.params.basisVersion || '1');
            const maxFrt = await RecFrt_1.RecFrt.findOne({
                where: { BASIS_VERSION: basisVersion },
                order: [['FRT_FID', 'DESC']]
            });
            const nextFid = maxFrt ? (maxFrt.FRT_FID || 0) + 1 : 1;
            res.json({ nextFrtFid: nextFid });
        }
        catch (error) {
            console.error('Error getting next FRT_FID:', error);
            res.status(500).json({ error: 'Failed to get next FRT_FID' });
        }
    }
}
exports.RecFrtController = RecFrtController;
