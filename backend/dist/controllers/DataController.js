"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataController = void 0;
const BasisVersion_1 = require("../models/VDV/BasisVersion");
const BasisVersionGueltigkeit_1 = require("../models/VDV/BasisVersionGueltigkeit");
class DataController {
    // ===== BASIS VERSION CRUD =====
    async getBasisVersionen(req, res) {
        try {
            const versionen = await BasisVersion_1.BasisVersion.findAll({
                order: [['BASIS_VERSION', 'DESC']]
            });
            return res.status(200).json(versionen);
        }
        catch (error) {
            console.error('Error fetching BasisVersionen:', error);
            return res.status(500).json({ message: 'Error fetching BasisVersionen', error });
        }
    }
    async createBasisVersion(req, res) {
        try {
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is required' });
            }
            const basis_version = parseInt(req.body['BASIS_VERSION'] || req.body['basis_version']);
            const basis_version_text = req.body['BASIS_VERSION_TEXT'] || req.body['basis_version_text'];
            if (!basis_version) {
                return res.status(400).json({ message: 'BASIS_VERSION is required' });
            }
            // Check for duplicate
            const existing = await BasisVersion_1.BasisVersion.findOne({ where: { BASIS_VERSION: basis_version } });
            if (existing) {
                return res.status(400).json({ message: 'BASIS_VERSION already exists' });
            }
            const newVersion = await BasisVersion_1.BasisVersion.create({
                BASIS_VERSION: basis_version,
                BASIS_VERSION_TEXT: basis_version_text
            });
            return res.status(201).json(newVersion);
        }
        catch (error) {
            console.error('Error creating BasisVersion:', error);
            return res.status(500).json({ message: 'Error creating BasisVersion', error });
        }
    }
    async editBasisVersion(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }
            const version = await BasisVersion_1.BasisVersion.findByPk(id);
            if (!version) {
                return res.status(404).json({ message: 'BasisVersion not found' });
            }
            if (req.body.BASIS_VERSION !== undefined || req.body.basis_version !== undefined) {
                version.BASIS_VERSION = parseInt(req.body.BASIS_VERSION || req.body.basis_version);
            }
            if (req.body.BASIS_VERSION_TEXT !== undefined || req.body.basis_version_text !== undefined) {
                version.BASIS_VERSION_TEXT = req.body.BASIS_VERSION_TEXT || req.body.basis_version_text;
            }
            await version.save();
            return res.status(200).json(version);
        }
        catch (error) {
            console.error('Error updating BasisVersion:', error);
            return res.status(500).json({ message: 'Error updating BasisVersion', error });
        }
    }
    async deleteBasisVersion(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }
            const version = await BasisVersion_1.BasisVersion.findByPk(id);
            if (!version) {
                return res.status(404).json({ message: 'BasisVersion not found' });
            }
            await version.destroy();
            return res.status(200).json({ message: 'BasisVersion deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting BasisVersion:', error);
            return res.status(500).json({ message: 'Error deleting BasisVersion', error });
        }
    }
    // ===== BASIS VERSION GÜLTIGKEIT CRUD =====
    async getGueltigkeiten(req, res) {
        try {
            const gueltigkeiten = await BasisVersionGueltigkeit_1.BasisVersionGueltigkeit.findAll({
                order: [['VER_GUELTIGKEIT', 'ASC']]
            });
            return res.status(200).json(gueltigkeiten);
        }
        catch (error) {
            console.error('Error fetching Gueltigkeiten:', error);
            return res.status(500).json({ message: 'Error fetching Gueltigkeiten', error });
        }
    }
    async createGueltigkeit(req, res) {
        try {
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is required' });
            }
            const ver_gueltigkeit = parseInt(req.body['VER_GUELTIGKEIT']);
            const basis_version = parseInt(req.body['BASIS_VERSION']);
            if (!ver_gueltigkeit) {
                return res.status(400).json({ message: 'VER_GUELTIGKEIT is required' });
            }
            if (!basis_version) {
                return res.status(400).json({ message: 'BASIS_VERSION is required' });
            }
            const newGueltigkeit = await BasisVersionGueltigkeit_1.BasisVersionGueltigkeit.create({
                VER_GUELTIGKEIT: ver_gueltigkeit,
                BASIS_VERSION: basis_version
            });
            return res.status(201).json(newGueltigkeit);
        }
        catch (error) {
            console.error('Error creating Gueltigkeit:', error);
            return res.status(500).json({ message: 'Error creating Gueltigkeit', error });
        }
    }
    async deleteGueltigkeit(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }
            const gueltigkeit = await BasisVersionGueltigkeit_1.BasisVersionGueltigkeit.findByPk(id);
            if (!gueltigkeit) {
                return res.status(404).json({ message: 'Gueltigkeit not found' });
            }
            await gueltigkeit.destroy();
            return res.status(200).json({ message: 'Gueltigkeit deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting Gueltigkeit:', error);
            return res.status(500).json({ message: 'Error deleting Gueltigkeit', error });
        }
    }
}
exports.DataController = DataController;
