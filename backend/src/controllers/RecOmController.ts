import { Request, Response } from 'express';
import { RecOm } from '../models/VDV/RecOm';
import { RecOrt } from '../models/VDV/RecOrt';

export class RecOmController {

    async getAll(req: Request, res: Response) {
        try {
            const ortsmarken = await RecOm.findAll({
                include: [{
                    model: RecOrt,
                    as: 'ort',
                    attributes: ['ORT_NR', 'ORT_NAME', 'ORT_POS_LAENGE', 'ORT_POS_BREITE']
                }]
            });
            res.json(ortsmarken);
        } catch (error) {
            console.error('Error fetching ortsmarken:', error);
            res.status(500).json({ error: 'Failed to fetch ortsmarken' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const ortNr = parseInt(req.params.id);
            const ortsmarke = await RecOm.findOne({
                where: { ORT_NR: ortNr },
                include: [{
                    model: RecOrt,
                    as: 'ort',
                    attributes: ['ORT_NR', 'ORT_NAME', 'ORT_POS_LAENGE', 'ORT_POS_BREITE']
                }]
            });
            if (!ortsmarke) {
                return res.status(404).json({ error: 'Ortsmarke not found' });
            }
            res.json(ortsmarke);
        } catch (error) {
            console.error('Error fetching ortsmarke:', error);
            res.status(500).json({ error: 'Failed to fetch ortsmarke' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const ortsmarke = await RecOm.create(req.body);
            res.status(201).json(ortsmarke);
        } catch (error) {
            console.error('Error creating ortsmarke:', error);
            res.status(500).json({ error: 'Failed to create ortsmarke' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const ortNr = parseInt(req.params.id);
            const ortsmarke = await RecOm.findOne({ where: { ORT_NR: ortNr } });
            if (!ortsmarke) {
                return res.status(404).json({ error: 'Ortsmarke not found' });
            }
            await ortsmarke.update(req.body);
            res.json(ortsmarke);
        } catch (error) {
            console.error('Error updating ortsmarke:', error);
            res.status(500).json({ error: 'Failed to update ortsmarke' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const ortNr = parseInt(req.params.id);
            const ortsmarke = await RecOm.findOne({ where: { ORT_NR: ortNr } });
            if (!ortsmarke) {
                return res.status(404).json({ error: 'Ortsmarke not found' });
            }
            await ortsmarke.destroy();
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting ortsmarke:', error);
            res.status(500).json({ error: 'Failed to delete ortsmarke' });
        }
    }
}

