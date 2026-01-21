"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleController = void 0;
const RecFzgTyp_1 = require("../models/VDV/RecFzgTyp");
const RecFzg_1 = require("../models/VDV/RecFzg");
class VehicleController {
    constructor() {
        // --- Vehicle Types ---
        this.getAllTypes = async (req, res) => {
            try {
                const types = await RecFzgTyp_1.RecFzgTyp.findAll();
                res.json(types);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.createType = async (req, res) => {
            try {
                // Get max ID to auto-increment for now
                const max = await RecFzgTyp_1.RecFzgTyp.max('FZG_TYP_NR') || 0;
                const newType = await RecFzgTyp_1.RecFzgTyp.create({
                    ...req.body,
                    FZG_TYP_NR: max + 1,
                    BASIS_VERSION: 1
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
                const vehicles = await RecFzg_1.RecFzg.findAll({
                    include: [RecFzgTyp_1.RecFzgTyp]
                });
                res.json(vehicles);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
        this.createVehicle = async (req, res) => {
            try {
                const max = await RecFzg_1.RecFzg.max('FZG_NR') || 0;
                const newVehicle = await RecFzg_1.RecFzg.create({
                    ...req.body,
                    FZG_NR: max + 1,
                    BASIS_VERSION: 1
                });
                res.json(newVehicle);
            }
            catch (e) {
                res.status(500).json({ error: e });
            }
        };
    }
}
exports.VehicleController = VehicleController;
