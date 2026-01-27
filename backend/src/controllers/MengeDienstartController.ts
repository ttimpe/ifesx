import { Request, Response } from 'express';
import { MengeDienstart } from '../models/VDV/MengeDienstart';

export class MengeDienstartController {

    async getAll(req: Request, res: Response) {
        try {
            const data = await MengeDienstart.findAll();
            res.json(data);
        } catch (error) {
            console.error('Error fetching dienstart:', error);
            res.status(500).json({ error: 'Failed to fetch dienstart' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const id = parseInt(req.params.id);
            const data = await MengeDienstart.findOne({ where: { BASIS_VERSION: basisVersion, DIENSTART_NR: id } });
            if (!data) {
                return res.status(404).json({ error: 'Dienstart not found' });
            }
            res.json(data);
        } catch (error) {
            console.error('Error fetching dienstart:', error);
            res.status(500).json({ error: 'Failed to fetch dienstart' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const data = await MengeDienstart.create(req.body);
            res.json(data);
        } catch (error) {
            console.error('Error creating dienstart:', error);
            res.status(500).json({ error: 'Failed to create dienstart' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const id = parseInt(req.params.id);
            const [updated] = await MengeDienstart.update(req.body, { where: { BASIS_VERSION: basisVersion, DIENSTART_NR: id } });
            if (updated) {
                const updatedDoc = await MengeDienstart.findOne({ where: { BASIS_VERSION: basisVersion, DIENSTART_NR: id } });
                res.status(200).json(updatedDoc);
            } else {
                res.status(404).json({ error: 'Dienstart not found' });
            }
        } catch (error) {
            console.error('Error updating dienstart:', error);
            res.status(500).json({ error: 'Failed to update dienstart' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const id = parseInt(req.params.id);
            const deleted = await MengeDienstart.destroy({ where: { BASIS_VERSION: basisVersion, DIENSTART_NR: id } });
            if (deleted) {
                res.status(204).send("Deleted");
            } else {
                res.status(404).json({ error: 'Dienstart not found' });
            }
        } catch (error) {
            console.error('Error deleting dienstart:', error);
            res.status(500).json({ error: 'Failed to delete dienstart' });
        }
    }
}
