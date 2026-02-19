import { Request, Response } from 'express';
import { RecAnr } from '../models/VDV/RecAnr';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

const announcementStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, './announcements/');
    },
    filename: (_req, file, cb) => {
        cb(null, file.originalname);
    }
});
export const announcementUpload = multer({ storage: announcementStorage });

/**
 * @swagger
 * tags:
 *   name: RecAnr
 *   description: API for VDV 452 RecAnr (Anschluss-Texte)
 */
export class RecAnrController {

    /**
     * @swagger
     * /vdv/anschluss:
     *   get:
     *     summary: Get all RecAnr entries
     *     tags: [RecAnr]
     *     responses:
     *       200:
     *         description: List of RecAnr
     */
    public getAll = async (req: Request, res: Response) => {
        try {
            const list = await RecAnr.findAll();
            res.json(list);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * @swagger
     * /vdv/anschluss/{id}:
     *   get:
     *     summary: Get RecAnr by ID (ANR_NR)
     *     tags: [RecAnr]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: RecAnr object
     */
    public getById = async (req: Request, res: Response) => {
        try {
            const item = await RecAnr.findOne({ where: { ANR_NR: req.params.id } });
            if (item) res.json(item);
            else res.status(404).json({ error: 'Not found' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * @swagger
     * /vdv/anschluss:
     *   post:
     *     summary: Create RecAnr
     *     tags: [RecAnr]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               ANR_NR:
     *                 type: integer
     *               ANR_TEXT:
     *                 type: string
     *     responses:
     *       200:
     *         description: Created
     */
    public create = async (req: Request, res: Response) => {
        try {
            const item = await RecAnr.create(req.body);
            res.json(item);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * @swagger
     * /vdv/anschluss/{id}:
     *   put:
     *     summary: Update RecAnr
     *     tags: [RecAnr]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *            schema:
     *              type: object
     *              properties:
     *                ANR_TEXT:
     *                  type: string
     *     responses:
     *       200:
     *         description: Updated
     */
    public update = async (req: Request, res: Response) => {
        try {
            const [updated] = await RecAnr.update(req.body, { where: { ANR_NR: req.params.id } });
            if (updated) {
                const updatedItem = await RecAnr.findOne({ where: { ANR_NR: req.params.id } });
                res.json(updatedItem);
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public delete = async (req: Request, res: Response) => {
        try {
            const deleted = await RecAnr.destroy({ where: { ANR_NR: req.params.id } });
            if (deleted) res.status(204).send();
            else res.status(404).json({ error: 'Not found' });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public getFiles = async (_req: Request, res: Response) => {
        try {
            const dir = path.resolve('./announcements/');
            await fs.mkdir(dir, { recursive: true });
            const fileNames = await fs.readdir(dir);
            return res.status(200).json(fileNames);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    public uploadFile = async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Keine Datei hochgeladen' });
            }
            return res.status(200).json({ ANR_DATEI: req.file.originalname });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}
