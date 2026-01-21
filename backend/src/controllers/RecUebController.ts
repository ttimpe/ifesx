import { Request, Response } from 'express';
import { RecUeb } from '../models/VDV/RecUeb';
import { UebFzt } from '../models/VDV/UebFzt';

/**
 * @swagger
 * tags:
 *   name: RecUeb
 *   description: API for VDV 452 RecUeb (Transfers)
 */
export class RecUebController {

    /**
     * @swagger
     * /vdv/transfers:
     *   get:
     *     summary: Get all Transfers
     *     tags: [RecUeb]
     *     responses:
     *       200:
     *         description: List of Transfers
     */
    public getAll = async (req: Request, res: Response) => {
        try {
            const list = await RecUeb.findAll({ include: [UebFzt] });
            res.json(list);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Since PK is composite, getting by ID requires multiple params or a filter query.
    // For simplicity, we might just filter or omit specific ID fetch for now unless needed.

    public create = async (req: Request, res: Response) => {
        try {
            const item = await RecUeb.create(req.body);
            res.json(item);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * @swagger
     * /vdv/transfers/detail:
     *   get:
     *     summary: Get specific Transfer by composite key
     *     tags: [RecUeb]
     *     parameters:
     *       - in: query
     *         name: BASIS_VERSION
     *         schema: { type: integer }
     *       - in: query
     *         name: BEREICH_NR
     *         schema: { type: integer }
     *       - in: query
     *         name: ONR_TYP_NR
     *         schema: { type: integer }
     *       - in: query
     *         name: ORT_NR
     *         schema: { type: integer }
     *       - in: query
     *         name: UEB_ZIEL_TYP
     *         schema: { type: integer }
     *       - in: query
     *         name: UEB_ZIEL
     *         schema: { type: integer }
     *     responses:
     *       200:
     *         description: Transfer object
     */
    public getOne = async (req: Request, res: Response) => {
        try {
            const { BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, UEB_ZIEL_TYP, UEB_ZIEL } = req.query;
            const item = await RecUeb.findOne({
                where: {
                    BASIS_VERSION,
                    BEREICH_NR,
                    ONR_TYP_NR,
                    ORT_NR,
                    UEB_ZIEL_TYP,
                    UEB_ZIEL
                },
                include: [UebFzt]
            });
            if (item) res.json(item);
            else res.status(404).json({ error: 'Not found' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public update = async (req: Request, res: Response) => {
        const transaction = await RecUeb.sequelize?.transaction();
        try {
            const { BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, UEB_ZIEL_TYP, UEB_ZIEL, uebFzts } = req.body;

            const whereClause = {
                BASIS_VERSION,
                BEREICH_NR,
                ONR_TYP_NR,
                ORT_NR,
                UEB_ZIEL_TYP,
                UEB_ZIEL
            };

            await RecUeb.update(req.body, {
                where: whereClause,
                transaction
            });

            // Sync UebFzt children
            if (uebFzts) {
                // Delete existing ones
                await UebFzt.destroy({
                    where: {
                        BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, UEB_ZIEL_TYP, UEB_ZIEL
                    },
                    transaction
                });

                // Create new ones
                if (uebFzts.length > 0) {
                    await UebFzt.bulkCreate(uebFzts.map((fzt: any) => ({
                        ...fzt,
                        BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, UEB_ZIEL_TYP, UEB_ZIEL
                    })), { transaction });
                }
            }

            await transaction?.commit();
            res.json({ success: true });
        } catch (error: any) {
            await transaction?.rollback();
            res.status(500).json({ error: error.message });
        }
    }

    public delete = async (req: Request, res: Response) => {
        try {
            const { BASIS_VERSION, BEREICH_NR, ONR_TYP_NR, ORT_NR, UEB_ZIEL_TYP, UEB_ZIEL } = req.query;
            await RecUeb.destroy({
                where: {
                    BASIS_VERSION,
                    BEREICH_NR,
                    ONR_TYP_NR,
                    ORT_NR,
                    UEB_ZIEL_TYP,
                    UEB_ZIEL
                }
            });
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
