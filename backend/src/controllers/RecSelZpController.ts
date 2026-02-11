import { Request, Response } from 'express';
import { RecSelZp } from '../models/VDV/RecSelZp';

export class RecSelZpController {

    // Get all intermediate points for a specific section
    public getBySection = async (req: Request, res: Response) => {
        try {
            const { ortNr, selZiel } = req.params;
            const list = await RecSelZp.findAll({
                where: {
                    ORT_NR: ortNr,
                    SEL_ZIEL: selZiel
                },
                order: [['ZP_LFD_NR', 'ASC']]
            });
            res.json(list);
        } catch (error) {
            console.error('Error fetching intermediate points:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Get all intermediate points
    public getAll = async (req: Request, res: Response) => {
        try {
            const basisVersion = req.query.basisVersion;
            const whereClause: any = {};

            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }

            const list = await RecSelZp.findAll({
                where: whereClause,
                include: [
                    { association: 'zpOrt' } // Include the related Ort for coordinates
                ]
            });
            res.json(list);
        } catch (error) {
            console.error('Error fetching all intermediate points:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Create a new intermediate point
    public create = async (req: Request, res: Response) => {
        try {
            const newItem = await RecSelZp.create(req.body);
            res.status(201).json(newItem);
        } catch (error) {
            console.error('Error creating intermediate point:', error);
            res.status(500).json({ error: 'Internal Server Error', details: error });
        }
    }

    // Update an intermediate point
    public update = async (req: Request, res: Response) => {
        try {
            const { zpOnr } = req.params; // Identifier for the specific ZP in the section
            // Ideally we need composite key: ortNr, selZiel, zpOnr, zpTyp? 
            // The PK is BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, SEL_ZIEL, SEL_ZIEL_TYP, ZP_ONR, ZP_TYP
            // This is complex to target via URL. We might need to pass all in body or use a specific query.
            // For now, let's assume body contains keys and use update with where clause derived from body or params.
            // But strict REST suggests /rec-sel-zp/:id which RecSelZp doesn't have.
            // We'll use a post/put with body check for now or specific params matching the section.

            // Actually, let's try to match the keys from the body
            const keys = {
                BASIS_VERSION: req.body.BASIS_VERSION,
                BEREICH_NR: req.body.BEREICH_NR,
                ONR_TYP_NR: req.body.ONR_TYP_NR,
                ORT_NR: req.body.ORT_NR,
                SEL_ZIEL: req.body.SEL_ZIEL,
                SEL_ZIEL_TYP: req.body.SEL_ZIEL_TYP,
                ZP_ONR: req.body.ZP_ONR,
                ZP_TYP: req.body.ZP_TYP
            };

            const [updated] = await RecSelZp.update(req.body, {
                where: keys
            });

            if (updated) {
                res.json({ message: 'Updated successfully' });
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            console.error('Error updating intermediate point:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Delete an intermediate point
    public delete = async (req: Request, res: Response) => {
        try {
            // Expecting keys in query or body because URL is too long for 8 composite keys
            const keys = req.body; // or req.query
            const deleted = await RecSelZp.destroy({
                where: {
                    BASIS_VERSION: keys.BASIS_VERSION,
                    BEREICH_NR: keys.BEREICH_NR,
                    ONR_TYP_NR: keys.ONR_TYP_NR,
                    ORT_NR: keys.ORT_NR,
                    SEL_ZIEL: keys.SEL_ZIEL,
                    SEL_ZIEL_TYP: keys.SEL_ZIEL_TYP,
                    ZP_ONR: keys.ZP_ONR,
                    ZP_TYP: keys.ZP_TYP
                }
            });

            if (deleted) {
                res.json({ message: 'Deleted successfully' });
            } else {
                res.status(404).json({ error: 'Item not found' });
            }
        } catch (error) {
            console.error('Error deleting intermediate point:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
