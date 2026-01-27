import { Request, Response } from 'express';
import { MengeDienststueckart } from '../models/VDV/MengeDienststueckart';
import { RecDienststueck } from '../models/VDV/RecDienststueck';
import { RecEinzeldienst } from '../models/VDV/RecEinzeldienst';

export class DutyRosterController {

    // --- MENGE_DIENSTSTUECKART ---

    public async getAllPieceTypes(req: Request, res: Response) {
        try {
            const types = await MengeDienststueckart.findAll();
            res.json(types);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async createPieceType(req: Request, res: Response) {
        try {
            const type = await MengeDienststueckart.create(req.body);
            res.status(201).json(type);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async updatePieceType(req: Request, res: Response) {
        try {
            // PK is Composite: BASIS_VERSION, DIENSTSTUECKART
            const { basisVersion, id } = req.params;
            await MengeDienststueckart.update(req.body, {
                where: { BASIS_VERSION: basisVersion, DIENSTSTUECKART: id }
            });
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async deletePieceType(req: Request, res: Response) {
        try {
            const { basisVersion, id } = req.params;
            await MengeDienststueckart.destroy({
                where: { BASIS_VERSION: basisVersion, DIENSTSTUECKART: id }
            });
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- REC_DIENSTSTUECK ---

    public async getAllPieces(req: Request, res: Response) {
        try {
            const pieces = await RecDienststueck.findAll();
            res.json(pieces);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async createPiece(req: Request, res: Response) {
        try {
            const piece = await RecDienststueck.create(req.body);
            res.status(201).json(piece);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Deletion/Update likely needs complex composite key parsing from URL or body
    // Implementing basic filtered GET for now
    public async getPiecesByDuty(req: Request, res: Response) {
        try {
            const { basisVersion, edNr } = req.query;
            const pieces = await RecDienststueck.findAll({
                where: {
                    BASIS_VERSION: basisVersion,
                    ED_NR: edNr
                }
            });
            res.json(pieces);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }


    // --- REC_EINZELDIENST ---

    public async getAllDuties(req: Request, res: Response) {
        try {
            const duties = await RecEinzeldienst.findAll();
            res.json(duties);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public async createDuty(req: Request, res: Response) {
        try {
            const duty = await RecEinzeldienst.create(req.body);
            res.status(201).json(duty);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

}
