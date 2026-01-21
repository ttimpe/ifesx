
import { Request, Response } from 'express';
import { MengeBereich } from '../models/VDV/MengeBereich';

export class MengeBereichController {

    public getAll = async (req: Request, res: Response) => {
        try {
            const list = await MengeBereich.findAll();
            res.json(list);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const item = await MengeBereich.findOne({ where: { BEREICH_NR: id } });
            if (!item) return res.status(404).json({ error: 'MengeBereich not found' });
            res.json(item);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public create = async (req: Request, res: Response) => {
        try {
            // Default BASIS_VERSION to 1 if not provided
            if (!req.body.BASIS_VERSION) req.body.BASIS_VERSION = 1;

            // Auto-increment BEREICH_NR if not provided
            if (!req.body.BEREICH_NR) {
                const max = await MengeBereich.max('BEREICH_NR') as number;
                req.body.BEREICH_NR = (max || 0) + 1;
            }

            const newItem = await MengeBereich.create(req.body);
            res.json(newItem);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const [updated] = await MengeBereich.update(req.body, { where: { BEREICH_NR: id } });
            if (!updated) return res.status(404).json({ error: 'MengeBereich not found' });
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const deleted = await MengeBereich.destroy({ where: { BEREICH_NR: id } });
            if (!deleted) return res.status(404).json({ error: 'MengeBereich not found' });
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }
}
