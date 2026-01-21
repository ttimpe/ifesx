import { Request, Response } from 'express';
import { MengeFahrtart } from '../models/VDV/MengeFahrtart';

export class MengeFahrtartController {
    public getAll = async (req: Request, res: Response) => {
        try {
            const list = await MengeFahrtart.findAll();
            res.json(list);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const item = await MengeFahrtart.findOne({ where: { FAHRTART_NR: id } });
            if (!item) return res.status(404).json({ error: 'MengeFahrtart not found' });
            res.json(item);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public create = async (req: Request, res: Response) => {
        try {
            if (!req.body.BASIS_VERSION) req.body.BASIS_VERSION = 1;
            if (!req.body.FAHRTART_NR) {
                const max = await MengeFahrtart.max('FAHRTART_NR') as number;
                req.body.FAHRTART_NR = (max || 0) + 1;
            }
            const newItem = await MengeFahrtart.create(req.body);
            res.json(newItem);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const [updated] = await MengeFahrtart.update(req.body, { where: { FAHRTART_NR: id } });
            if (!updated) return res.status(404).json({ error: 'MengeFahrtart not found' });
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const deleted = await MengeFahrtart.destroy({ where: { FAHRTART_NR: id } });
            if (!deleted) return res.status(404).json({ error: 'MengeFahrtart not found' });
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }
}
