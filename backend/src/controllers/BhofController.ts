import { Request, Response } from 'express';
import { MengeBhof } from '../models/VDV/MengeBhof';

export class BhofController {

    public getAll = async (req: Request, res: Response) => {
        try {
            const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : undefined;
            const where = basisVersion ? { BASIS_VERSION: basisVersion } : {};
            const list = await MengeBhof.findAll({ where });
            res.json(list);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public getById = async (req: Request, res: Response) => {
        try {
            const bhofNr = parseInt(req.params.bhofNr);
            const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : 1;

            const item = await MengeBhof.findOne({
                where: {
                    BHOF_NR: bhofNr,
                    BASIS_VERSION: basisVersion
                }
            });

            if (!item) return res.status(404).json({ error: 'Betriebshof not found' });
            res.json(item);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public create = async (req: Request, res: Response) => {
        try {
            // Default BASIS_VERSION to 1 if not provided
            if (!req.body.BASIS_VERSION) req.body.BASIS_VERSION = 1;

            // Auto-increment BHOF_NR if not provided
            if (!req.body.BHOF_NR) {
                const max = await MengeBhof.max('BHOF_NR', {
                    where: { BASIS_VERSION: req.body.BASIS_VERSION }
                }) as number;
                req.body.BHOF_NR = (max || 0) + 1;
            }

            const newItem = await MengeBhof.create(req.body);
            res.json(newItem);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public update = async (req: Request, res: Response) => {
        try {
            const bhofNr = parseInt(req.params.bhofNr);
            const basisVersion = parseInt(req.query.basisVersion as string) || 1;

            const [updated] = await MengeBhof.update(req.body, {
                where: {
                    BHOF_NR: bhofNr,
                    BASIS_VERSION: basisVersion
                }
            });

            if (!updated) return res.status(404).json({ error: 'Betriebshof not found' });

            const updatedItem = await MengeBhof.findOne({
                where: {
                    BHOF_NR: bhofNr,
                    BASIS_VERSION: basisVersion
                }
            });

            res.json(updatedItem);
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }

    public delete = async (req: Request, res: Response) => {
        try {
            const bhofNr = parseInt(req.params.bhofNr);
            const basisVersion = parseInt(req.query.basisVersion as string) || 1;

            const deleted = await MengeBhof.destroy({
                where: {
                    BHOF_NR: bhofNr,
                    BASIS_VERSION: basisVersion
                }
            });

            if (!deleted) return res.status(404).json({ error: 'Betriebshof not found' });
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: e });
        }
    }
}
