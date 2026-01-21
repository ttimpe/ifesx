import { Request, Response } from 'express';
import { MengeFzgTyp } from '../models/VDV/MengeFzgTyp';
import { Fahrzeug } from '../models/VDV/Fahrzeug';

export class VehicleController {

    // --- Vehicle Types ---

    public getAllTypes = async (req: Request, res: Response) => {
        try {
            const basisVersion = req.query.basis_version || req.query.basisVersion;
            const whereClause: any = {};
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }

            const types = await MengeFzgTyp.findAll({ where: whereClause });
            res.json(types);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public createType = async (req: Request, res: Response) => {
        try {
            // Get max ID to auto-increment for now
            const max = await MengeFzgTyp.max('FZG_TYP_NR') as number || 0;
            const newType = await MengeFzgTyp.create({
                ...req.body,
                FZG_TYP_NR: max + 1,
                BASIS_VERSION: req.body.BASIS_VERSION || 1
            });
            res.json(newType);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    // --- Vehicles ---

    public getAllVehicles = async (req: Request, res: Response) => {
        try {
            const basisVersion = req.query.basis_version || req.query.basisVersion;
            const whereClause: any = {};
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }

            const vehicles = await Fahrzeug.findAll({
                where: whereClause,
                include: [{
                    model: MengeFzgTyp,
                    required: false,
                    where: basisVersion ? { BASIS_VERSION: basisVersion } : {}
                }]
            });
            res.json(vehicles);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public createVehicle = async (req: Request, res: Response) => {
        try {
            const max = await Fahrzeug.max('FZG_NR') as number || 0;
            const newVehicle = await Fahrzeug.create({
                ...req.body,
                FZG_NR: max + 1,
                BASIS_VERSION: req.body.BASIS_VERSION || 1
            });
            res.json(newVehicle);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public getVehicleById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const basisVersion = req.query.basis_version || req.query.basisVersion;

            const whereClause: any = { FZG_NR: id };
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }

            const vehicle = await Fahrzeug.findOne({
                where: whereClause,
                include: [{
                    model: MengeFzgTyp,
                    required: false
                }]
            });

            if (!vehicle) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }

            res.json(vehicle);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public updateVehicle = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const basisVersion = req.body.BASIS_VERSION;

            const whereClause: any = { FZG_NR: id };
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }

            const [updated] = await Fahrzeug.update(req.body, {
                where: whereClause
            });

            if (updated === 0) {
                return res.status(404).json({ error: 'Vehicle not found' });
            }

            const vehicle = await Fahrzeug.findOne({ where: whereClause });
            res.json(vehicle);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public deleteVehicle = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const basisVersion = req.query.basis_version || req.query.basisVersion;

            const whereClause: any = { FZG_NR: id };
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }

            const deleted = await Fahrzeug.destroy({ where: whereClause });

            if (deleted) {
                res.json({ message: 'Vehicle deleted successfully' });
            } else {
                res.status(404).json({ error: 'Vehicle not found' });
            }
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public updateType = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { BASIS_VERSION } = req.body;

            const whereClause: any = { FZG_TYP_NR: id };
            if (BASIS_VERSION) {
                whereClause.BASIS_VERSION = BASIS_VERSION;
            }

            const [updated] = await MengeFzgTyp.update(req.body, {
                where: whereClause
            });

            if (updated) {
                const updatedType = await MengeFzgTyp.findOne({ where: whereClause });
                res.json(updatedType);
            } else {
                res.status(404).json({ error: 'Vehicle Type not found' });
            }
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public deleteType = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            // Get basis version from query param if not in body, similar to deleteVehicle
            const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;

            const whereClause: any = { FZG_TYP_NR: id, BASIS_VERSION: basisVersion };

            // Check for dependent vehicles
            const vehicleCount = await Fahrzeug.count({ where: { FZG_TYP_NR: id, BASIS_VERSION: basisVersion } });
            if (vehicleCount > 0) {
                return res.status(400).json({ error: `Cannot delete: Type has ${vehicleCount} dependent vehicles.` });
            }

            const deleted = await MengeFzgTyp.destroy({ where: whereClause });

            if (deleted) {
                res.json({ message: 'Vehicle Type deleted successfully' });
            } else {
                res.status(404).json({ error: 'Vehicle Type not found' });
            }
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public batchCreateVehicles = async (req: Request, res: Response) => {
        try {
            const { startNumber, count, fzgTypNr, polkennPrefix, basisVersion } = req.body;

            if (!startNumber || !count || !fzgTypNr) {
                return res.status(400).json({
                    error: 'Missing required fields: startNumber, count, fzgTypNr'
                });
            }

            const vehicles: any[] = [];
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

            const created = await Fahrzeug.bulkCreate(vehicles);
            res.json(created);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }
}
