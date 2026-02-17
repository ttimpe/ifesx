"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleController = void 0;
const MengeFzgTyp_1 = require("../models/VDV/MengeFzgTyp");
const Fahrzeug_1 = require("../models/VDV/Fahrzeug");
class VehicleController {
    constructor() {
        // --- Vehicle Types ---
        this.getAllTypes = async (req, res) => {
            try {
                const basisVersion = req.query.basis_version || req.query.basisVersion;
                const whereClause = {};
                if (basisVersion) {
                    whereClause.BASIS_VERSION = basisVersion;
                }
                const types = await MengeFzgTyp_1.MengeFzgTyp.findAll({ where: whereClause });
                res.json(types);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.createType = async (req, res) => {
            try {
                // Get max ID to auto-increment for now
                const max = await MengeFzgTyp_1.MengeFzgTyp.max('FZG_TYP_NR') || 0;
                const newType = await MengeFzgTyp_1.MengeFzgTyp.create({
                    ...req.body,
                    FZG_TYP_NR: max + 1,
                    BASIS_VERSION: req.body.BASIS_VERSION || 1
                });
                res.json(newType);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        // --- Vehicles ---
        this.getAllVehicles = async (req, res) => {
            try {
                const basisVersion = req.query.basis_version || req.query.basisVersion;
                const whereClause = {};
                if (basisVersion) {
                    whereClause.BASIS_VERSION = basisVersion;
                }
                const vehicles = await Fahrzeug_1.Fahrzeug.findAll({
                    where: whereClause,
                    include: [{
                            model: MengeFzgTyp_1.MengeFzgTyp,
                            required: false,
                            where: basisVersion ? { BASIS_VERSION: basisVersion } : {}
                        }]
                });
                res.json(vehicles);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.createVehicle = async (req, res) => {
            try {
                const max = await Fahrzeug_1.Fahrzeug.max('FZG_NR') || 0;
                const newVehicle = await Fahrzeug_1.Fahrzeug.create({
                    ...req.body,
                    FZG_NR: max + 1,
                    BASIS_VERSION: req.body.BASIS_VERSION || 1
                });
                res.json(newVehicle);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.getVehicleById = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const basisVersion = req.query.basis_version || req.query.basisVersion;
                const whereClause = { FZG_NR: id };
                if (basisVersion) {
                    whereClause.BASIS_VERSION = basisVersion;
                }
                const vehicle = await Fahrzeug_1.Fahrzeug.findOne({
                    where: whereClause,
                    include: [{
                            model: MengeFzgTyp_1.MengeFzgTyp,
                            required: false
                        }]
                });
                if (!vehicle) {
                    return res.status(404).json({ error: 'Vehicle not found' });
                }
                res.json(vehicle);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.updateVehicle = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const basisVersion = req.body.BASIS_VERSION;
                const whereClause = { FZG_NR: id };
                if (basisVersion) {
                    whereClause.BASIS_VERSION = basisVersion;
                }
                const [updated] = await Fahrzeug_1.Fahrzeug.update(req.body, {
                    where: whereClause
                });
                if (updated === 0) {
                    return res.status(404).json({ error: 'Vehicle not found' });
                }
                const vehicle = await Fahrzeug_1.Fahrzeug.findOne({ where: whereClause });
                res.json(vehicle);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.deleteVehicle = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const basisVersion = req.query.basis_version || req.query.basisVersion;
                const whereClause = { FZG_NR: id };
                if (basisVersion) {
                    whereClause.BASIS_VERSION = basisVersion;
                }
                const deleted = await Fahrzeug_1.Fahrzeug.destroy({ where: whereClause });
                if (deleted) {
                    res.json({ message: 'Vehicle deleted successfully' });
                }
                else {
                    res.status(404).json({ error: 'Vehicle not found' });
                }
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.updateType = async (req, res) => {
            try {
                const { id } = req.params;
                const { BASIS_VERSION } = req.body;
                const whereClause = { FZG_TYP_NR: id };
                if (BASIS_VERSION) {
                    whereClause.BASIS_VERSION = BASIS_VERSION;
                }
                const [updated] = await MengeFzgTyp_1.MengeFzgTyp.update(req.body, {
                    where: whereClause
                });
                if (updated) {
                    const updatedType = await MengeFzgTyp_1.MengeFzgTyp.findOne({ where: whereClause });
                    res.json(updatedType);
                }
                else {
                    res.status(404).json({ error: 'Vehicle Type not found' });
                }
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.deleteType = async (req, res) => {
            try {
                const { id } = req.params;
                // Get basis version from query param if not in body, similar to deleteVehicle
                const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;
                const whereClause = { FZG_TYP_NR: id, BASIS_VERSION: basisVersion };
                // Check for dependent vehicles
                const vehicleCount = await Fahrzeug_1.Fahrzeug.count({ where: { FZG_TYP_NR: id, BASIS_VERSION: basisVersion } });
                if (vehicleCount > 0) {
                    return res.status(400).json({ error: `Cannot delete: Type has ${vehicleCount} dependent vehicles.` });
                }
                const deleted = await MengeFzgTyp_1.MengeFzgTyp.destroy({ where: whereClause });
                if (deleted) {
                    res.json({ message: 'Vehicle Type deleted successfully' });
                }
                else {
                    res.status(404).json({ error: 'Vehicle Type not found' });
                }
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.batchCreateVehicles = async (req, res) => {
            try {
                const { startNumber, count, fzgTypNr, polkennPrefix, basisVersion } = req.body;
                if (!startNumber || !count || !fzgTypNr) {
                    return res.status(400).json({
                        error: 'Missing required fields: startNumber, count, fzgTypNr'
                    });
                }
                const vehicles = [];
                for (let i = 0; i < count; i++) {
                    const fzgNr = startNumber + i;
                    const polkenn = polkennPrefix ? `${polkennPrefix}${fzgNr}` : undefined;
                    vehicles.push({
                        FZG_NR: fzgNr,
                        POLKENN: polkenn,
                        FZG_TYP_NR: fzgTypNr,
                        BASIS_VERSION: basisVersion || 1
                    });
                }
                const created = await Fahrzeug_1.Fahrzeug.bulkCreate(vehicles);
                res.json(created);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
    }
}
exports.VehicleController = VehicleController;
