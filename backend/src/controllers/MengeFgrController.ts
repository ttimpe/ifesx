import { Request, Response } from 'express';
import { MengeFgr } from '../models/VDV/MengeFgr';

export class MengeFgrController {
    public getAll = async (req: Request, res: Response) => {
        try {
            const list = await MengeFgr.findAll();
            res.json(list);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const item = await MengeFgr.findOne({ where: { FGR_NR: id } });
            if (!item) return res.status(404).json({ error: 'MengeFgr not found' });
            res.json(item);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public create = async (req: Request, res: Response) => {
        try {
            if (!req.body.BASIS_VERSION) req.body.BASIS_VERSION = 1;
            if (!req.body.FGR_NR) {
                const max = await MengeFgr.max('FGR_NR') as number;
                req.body.FGR_NR = (max || 0) + 1;
            }
            const newItem = await MengeFgr.create(req.body);
            res.json(newItem);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const [updated] = await MengeFgr.update(req.body, { where: { FGR_NR: id } });
            if (!updated) return res.status(404).json({ error: 'MengeFgr not found' });
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const deleted = await MengeFgr.destroy({ where: { FGR_NR: id } });
            if (!deleted) return res.status(404).json({ error: 'MengeFgr not found' });
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }
}
