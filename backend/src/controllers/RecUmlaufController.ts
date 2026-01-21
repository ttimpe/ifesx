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
            const list = await RecUmlauf.findAll({ limit: 100 });
            res.json(list);
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
