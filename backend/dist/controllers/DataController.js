"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataController = void 0;
const BasisVersion_1 = require("../models/VDV/BasisVersion");
const BasisVersionGueltigkeit_1 = require("../models/VDV/BasisVersionGueltigkeit");
const RecOrt_1 = require("../models/VDV/RecOrt");
const RecHp_1 = require("../models/VDV/RecHp");
const RecLid_1 = require("../models/VDV/RecLid");
const LidVerlauf_1 = require("../models/VDV/LidVerlauf");
const RecSel_1 = require("../models/VDV/RecSel");
const RecSelFztFeld_1 = require("../models/VDV/RecSelFztFeld");
const RecUmlauf_1 = require("../models/VDV/RecUmlauf");
const RecFrt_1 = require("../models/VDV/RecFrt");
const RecAnr_1 = require("../models/VDV/RecAnr");
const RecUeb_1 = require("../models/VDV/RecUeb");
const RecOm_1 = require("../models/VDV/RecOm");
const MengeBereich_1 = require("../models/VDV/MengeBereich");
const MengeFgr_1 = require("../models/VDV/MengeFgr");
const Tagesart_1 = require("../models/VDV/Tagesart");
const Betriebstag_1 = require("../models/VDV/Betriebstag");
const RecZnr_1 = require("../models/VDV/RecZnr");
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
            const id = parseInt(req.params.id);
            if (!id) {
                return res.status(400).json({ message: 'ID (BASIS_VERSION) parameter is required' });
            }
            const version = await BasisVersion_1.BasisVersion.findByPk(id);
            if (!version) {
                // Try looking into body if param ID doesn't match? No, param should be the key
                return res.status(404).json({ message: 'BasisVersion not found' });
            }
            if (req.body.BASIS_VERSION !== undefined || req.body.basis_version !== undefined) {
                // Primary key update might be tricky, usually discouraged, but if needed:
                // version.BASIS_VERSION = ...
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
            const id = parseInt(req.params.id);
            if (!id) {
                return res.status(400).json({ message: 'ID (BASIS_VERSION) parameter is required' });
            }
            const version = await BasisVersion_1.BasisVersion.findByPk(id);
            if (!version) {
                return res.status(404).json({ message: 'BasisVersion not found' });
            }
            // Delete all related records in proper order (respecting dependencies)
            console.log(`[DELETE] Deleting all data for BASIS_VERSION ${id}...`);
            await RecSelFztFeld_1.RecSelFztFeld.destroy({ where: { BASIS_VERSION: id } });
            await RecSel_1.RecSel.destroy({ where: { BASIS_VERSION: id } });
            await LidVerlauf_1.LidVerlauf.destroy({ where: { BASIS_VERSION: id } });
            await RecLid_1.RecLid.destroy({ where: { BASIS_VERSION: id } });
            await RecZnr_1.RecZnr.destroy({ where: { BASIS_VERSION: id } });
            await RecFrt_1.RecFrt.destroy({ where: { BASIS_VERSION: id } });
            await RecUmlauf_1.RecUmlauf.destroy({ where: { BASIS_VERSION: id } });
            await RecHp_1.RecHp.destroy({ where: { BASIS_VERSION: id } });
            await RecOrt_1.RecOrt.destroy({ where: { BASIS_VERSION: id } });
            await RecAnr_1.RecAnr.destroy({ where: { BASIS_VERSION: id } });
            await RecUeb_1.RecUeb.destroy({ where: { BASIS_VERSION: id } });
            await RecOm_1.RecOm.destroy({ where: { BASIS_VERSION: id } });
            await MengeBereich_1.MengeBereich.destroy({ where: { BASIS_VERSION: id } });
            await MengeFgr_1.MengeFgr.destroy({ where: { BASIS_VERSION: id } });
            // Delete calendar-related tables
            await Betriebstag_1.Betriebstag.destroy({ where: { BASIS_VERSION: id } });
            await Tagesart_1.Tagesart.destroy({ where: { BASIS_VERSION: id } });
            await BasisVersionGueltigkeit_1.BasisVersionGueltigkeit.destroy({ where: { BASIS_VERSION: id } });
            // Delete the version itself
            await version.destroy();
            console.log(`[DELETE] Successfully deleted BASIS_VERSION ${id} and all related data`);
            return res.status(200).json({ message: 'BasisVersion and all related data deleted successfully' });
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
            const [instance, created] = await BasisVersionGueltigkeit_1.BasisVersionGueltigkeit.findOrCreate({
                where: {
                    VER_GUELTIGKEIT: ver_gueltigkeit,
                    BASIS_VERSION: basis_version
                }
            });
            return res.status(created ? 201 : 200).json(instance);
        }
        catch (error) {
            console.error('Error creating Gueltigkeit:', error);
            return res.status(500).json({ message: 'Error creating Gueltigkeit', error });
        }
    }
    async deleteGueltigkeit(req, res) {
        try {
            const basisVersion = parseInt(req.body.BASIS_VERSION || req.query.basis_version);
            const verGueltigkeit = parseInt(req.body.VER_GUELTIGKEIT || req.query.ver_gueltigkeit);
            if (!basisVersion || !verGueltigkeit) {
                // Return 400 or try fallback if needed, but for now strict
                return res.status(400).json({ message: 'BASIS_VERSION and VER_GUELTIGKEIT required' });
            }
            const gueltigkeit = await BasisVersionGueltigkeit_1.BasisVersionGueltigkeit.findOne({
                where: { BASIS_VERSION: basisVersion, VER_GUELTIGKEIT: verGueltigkeit }
            });
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
