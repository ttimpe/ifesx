import { Request, Response } from 'express';
import { Tagesart } from '../models/VDV/Tagesart';

export class TagesartController {

    async getAll(req: Request, res: Response) {
        try {
            const data = await Tagesart.findAll();
            res.json(data);
        } catch (error) {
            console.error('Error fetching tagesart:', error);
            res.status(500).json({ error: 'Failed to fetch tagesart' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const data = await Tagesart.findOne({ where: { TAGESART_NR: id } });
            if (!data) {
                return res.status(404).json({ error: 'Tagesart not found' });
            }
            res.json(data);
        } catch (error) {
            console.error('Error fetching tagesart:', error);
            res.status(500).json({ error: 'Failed to fetch tagesart' });
        }
    }
}
