import { Request, Response } from 'express';
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecUms } from '../models/VDV/RecUms';

export class RecUmlaufController {
    /**
     * @swagger
     * /vdv/blocks:
     *   get:
     *     summary: Get all Blocks (Umläufe)
     *     tags: [RecUmlauf]
     *     responses:
     *       200:
     *         description: List of Blocks
     */
    public getAll = async (req: Request, res: Response) => {
        try {
            const list = await RecUmlauf.findAll({
                limit: 100,
                include: [{
                    model: RecFrt,
                    attributes: ['FRT_START', 'LI_NR', 'LI_KU_NR']
                }],
                order: [['UM_UID', 'ASC']]
            });

            // Calculate derived fields
            const enhancedList = list.map((umlauf: any) => {
                // Sequelize-Typescript uses the property name defined in the model if available
                // In RecUmlauf model: @HasMany(() => RecFrt) trips?: RecFrt[];
                // So it should be 'trips'.
                const trips = (umlauf.trips || umlauf.REC_FRTs || []) as RecFrt[];

                let ausfahrt = null;

                if (trips.length > 0) {
                    // Find earliest trip
                    const firstTrip = trips.reduce((prev, curr) => (prev.FRT_START || 999999) < (curr.FRT_START || 999999) ? prev : curr);
                    ausfahrt = {
                        zeit: firstTrip.FRT_START,
                        linie: firstTrip.LI_NR,
                        kurs: firstTrip.LI_KU_NR
                    };
                } else {
                    // console.log(`No trips found for Umlauf ${umlauf.UM_UID}`);
                }

                return {
                    ...umlauf.toJSON(),
                    ausfahrt // Attach to response
                };
            });

            res.json(enhancedList);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * @swagger
     * /vdv/blocks/detail:
     *   get:
     *     summary: Get specific Block by PK
     *     tags: [RecUmlauf]
     *     parameters:
     *       - in: query
     *         name: BASIS_VERSION
     *         schema: { type: integer }
     *       - in: query
     *         name: TAGESART_NR
     *         schema: { type: integer }
     *       - in: query
     *         name: UM_UID
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Block object with Trips
     */
    public getOne = async (req: Request, res: Response) => {
        try {
            const { BASIS_VERSION, TAGESART_NR, UM_UID } = req.query;
            const where: any = {};
            if (UM_UID) where.UM_UID = UM_UID;
            if (BASIS_VERSION) where.BASIS_VERSION = BASIS_VERSION;
            if (TAGESART_NR) where.TAGESART_NR = TAGESART_NR;

            const item = await RecUmlauf.findOne({
                where,
                include: [RecFrt]
            });
            if (item) res.json(item);
            else res.status(404).json({ error: 'Not found' });
        } catch (error: any) {
            console.error('Error in getOne:', error);
            res.status(500).json({ error: error.message });
        }
    }

    public create = async (req: Request, res: Response) => {
        try {
            const item = await RecUmlauf.create(req.body);
            res.json(item);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public update = async (req: Request, res: Response) => {
        try {
            const { BASIS_VERSION, TAGESART_NR, UM_UID } = req.body;
            // Primary key cannot be changed easily, but fields can be.
            // However, RecUmlauf mostly contains keys. 
            // If the user wants to change "Kursnummer" (LI_KU_NR), that is actually stored in REC_FRT (RecFrt).
            // But maybe RecUmlauf has attributes too? 
            // Model shows: ANF_ORT, END_ORT, FZG_TYP_NR etc.

            const [updated] = await RecUmlauf.update(req.body, {
                where: { BASIS_VERSION, TAGESART_NR, UM_UID }
            });

            // Also, if the user edits the Kurs/Course Number (LI_KU_NR), we might need to update all trips?
            // Wait, LI_KU_NR is on REC_FRT. RecUmlauf doesn't have LI_KU_NR in the model I saw (only ID).
            // Let's check model again. 
            // RecUmlauf.ts: ANF_ORT, END_ORT, FZG_TYP_NR... NO LI_KU_NR.
            // The "Kursnummer" is implicitly the UM_UID or stored on the trips.
            // If the user wants to set FZG_TYP_NR or END_ORT, this update works.

            if (updated) res.json({ success: true });
            else res.status(404).json({ error: 'Not found' });

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public setKursNr = async (req: Request, res: Response) => {
        try {
            const { BASIS_VERSION, TAGESART_NR, UM_UID, LI_KU_NR } = req.body;

            // Validate inputs
            if (!UM_UID) return res.status(400).json({ error: 'UM_UID is required' });
            if (LI_KU_NR === undefined) return res.status(400).json({ error: 'LI_KU_NR is required' });

            // Update all trips in this Umlauf
            const [updatedCount] = await RecFrt.update(
                { LI_KU_NR },
                {
                    where: {
                        // If BASIS_VERSION and TAGESART_NR are provided, use them for stricter scope
                        // Otherwise just UM_UID (Primary grouping)
                        ...(BASIS_VERSION ? { BASIS_VERSION } : {}),
                        ...(TAGESART_NR ? { TAGESART_NR } : {}),
                        UM_UID
                    }
                }
            );

            res.json({ success: true, updatedCount });
        } catch (error: any) {
            console.error('Error setting KursNr:', error);
            res.status(500).json({ error: error.message });
        }
    }

    public delete = async (req: Request, res: Response) => {
        try {
            const { BASIS_VERSION, TAGESART_NR, UM_UID } = req.query;
            // Also delete (or unlink) trips?
            // Unlink trips
            await RecFrt.update({ UM_UID: null }, { where: { BASIS_VERSION, TAGESART_NR, UM_UID } });

            const deleted = await RecUmlauf.destroy({
                where: { BASIS_VERSION, TAGESART_NR, UM_UID }
            });
            res.json({ success: !!deleted });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- RecUms / Block Pieces ---

    /**
     * @swagger
     * /vdv/block-pieces:
     *   get:
     *     summary: Get all Block Pieces (Umlaufstücke)
     *     tags: [RecUms]
     *     responses:
     *       200:
     *         description: List of Block Pieces
     */
    public getAllUms = async (req: Request, res: Response) => {
        try {
            const list = await RecUms.findAll({ limit: 100 });
            res.json(list);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
