import { Request, Response } from 'express';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecLid } from '../models/VDV/RecLid';

/**
 * Controller for REC_FRT (Fahrten / Trips)
 * VDV 452 compliant
 */
export class RecFrtController {

    // Get all trips
    async getAll(req: Request, res: Response) {
        try {
            const trips = await RecFrt.findAll({
                order: [['FRT_START', 'ASC']]
            });
            res.json(trips);
        } catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).json({ error: 'Failed to fetch trips' });
        }
    }

    // Get trips by Umlauf (UM_UID)
    async getByUmlauf(req: Request, res: Response) {
        try {
            const umUid = parseInt(req.params.umUid);
            const tagesartNr = req.query.tagesartNr ? parseInt(req.query.tagesartNr as string) : undefined;

            const where: any = { UM_UID: umUid };
            if (tagesartNr) where.TAGESART_NR = tagesartNr;

            const trips = await RecFrt.findAll({
                where,
                order: [['FRT_START', 'ASC']]
            });
            res.json(trips);
        } catch (error) {
            console.error('Error fetching trips by umlauf:', error);
            res.status(500).json({ error: 'Failed to fetch trips' });
        }
    }

    // Get orphan trips (UM_UID is null)
    async getOrphanTrips(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.query.basisVersion as string);
            if (!basisVersion) {
                return res.status(400).json({ error: 'basisVersion required' });
            }

            const where: any = {
                BASIS_VERSION: basisVersion,
                UM_UID: null
            };

            if (req.query.liNr) where.LI_NR = parseInt(req.query.liNr as string);
            if (req.query.tagesartNr) where.TAGESART_NR = parseInt(req.query.tagesartNr as string);

            const trips = await RecFrt.findAll({
                where,
                include: [
                    // If associations setup in Model, we would include RecLid here.
                    // But let's check RecFrt.ts model definition first.
                    // It has foreign keys but maybe not BelongsTo?
                    // Assuming we can just fetch raw or configure association.
                    // Let's assume standard sequelize pattern.
                ],
                order: [['FRT_START', 'ASC']]
            });
            res.json(trips);
        } catch (error) {
            console.error('Error fetching orphan trips:', error);
            res.status(500).json({ error: 'Failed to fetch orphan trips' });
        }
    }

    // Get single trip by composite key
    async getByCompositeKey(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);

            const trip = await RecFrt.findOne({
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });

            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.json(trip);
        } catch (error) {
            console.error('Error fetching trip:', error);
            res.status(500).json({ error: 'Failed to fetch trip' });
        }
    }

    // Create new trip
    async create(req: Request, res: Response) {
        try {
            const trip = await RecFrt.create(req.body);
            res.status(201).json(trip);
        } catch (error) {
            console.error('Error creating trip:', error);
            res.status(500).json({ error: 'Failed to create trip' });
        }
    }

    // Update trip by composite key
    async update(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);

            const [updated] = await RecFrt.update(req.body, {
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });

            if (!updated) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.json({ message: 'Trip updated' });
        } catch (error) {
            console.error('Error updating trip:', error);
            res.status(500).json({ error: 'Failed to update trip' });
        }
    }

    // Delete trip by composite key
    async delete(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);

            const deleted = await RecFrt.destroy({
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });

            if (!deleted) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting trip:', error);
            res.status(500).json({ error: 'Failed to delete trip' });
        }
    }

    // Get next available FRT_FID for a given BASIS_VERSION
    async getNextFrtFid(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.params.basisVersion || '1');

            const maxFrt = await RecFrt.findOne({
                where: { BASIS_VERSION: basisVersion },
                order: [['FRT_FID', 'DESC']]
            });

            const nextFid = maxFrt ? (maxFrt.FRT_FID || 0) + 1 : 1;
            res.json({ nextFrtFid: nextFid });
        } catch (error) {
            console.error('Error getting next FRT_FID:', error);
            res.status(500).json({ error: 'Failed to get next FRT_FID' });
        }
    }
}
