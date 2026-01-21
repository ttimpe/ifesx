import { Request, Response } from 'express';
import { Einzelanschluss } from '../models/VDV/Einzelanschluss';
import { RecUms } from '../models/VDV/RecUms';
import { RecOrt } from '../models/VDV/RecOrt';

export class ConnectionController {

    // Get all connections
    public getAll = async (req: Request, res: Response) => {
        try {
            const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;
            const connections = await Einzelanschluss.findAll({
                where: { BASIS_VERSION: basisVersion },
                include: [RecUms]
            });
            res.json(connections);
        } catch (error) {
            console.error("Error fetching connections:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // Get one connection
    public getOne = async (req: Request, res: Response) => {
        try {
            const { einanNr } = req.params;
            const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;

            const connection = await Einzelanschluss.findOne({
                where: {
                    EINAN_NR: einanNr,
                    BASIS_VERSION: basisVersion
                },
                include: [RecUms]
            });

            if (!connection) {
                res.status(404).json({ message: "Connection not found" });
                return;
            }

            res.json(connection);
        } catch (error) {
            console.error("Error fetching connection:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // Create Connection
    public create = async (req: Request, res: Response) => {
        try {
            const data = req.body;
            // Ensure unique EINAN_NR if not provided or handle auto-increment logic if manually managed
            // VDV says EINAN_NR 1..32764

            if (!data.EINAN_NR) {
                const max = await Einzelanschluss.max('EINAN_NR') as number;
                data.EINAN_NR = (max || 0) + 1;
            }

            const connection = await Einzelanschluss.create(data);
            res.json(connection);
        } catch (error) {
            console.error("Error creating connection:", error);
            res.status(500).send(error);
        }
    }

    // Update Connection
    public update = async (req: Request, res: Response) => {
        try {
            const { einanNr } = req.params;
            const data = req.body;
            const basisVersion = data.BASIS_VERSION || 1;

            const connection = await Einzelanschluss.findOne({
                where: { EINAN_NR: einanNr, BASIS_VERSION: basisVersion }
            });

            if (!connection) {
                res.status(404).send("Connection not found");
                return;
            }

            await connection.update(data);
            res.json(connection);
        } catch (error) {
            console.error("Error updating connection:", error);
            res.status(500).send(error);
        }
    }

    // Delete Connection
    public delete = async (req: Request, res: Response) => {
        try {
            const { einanNr } = req.params;
            const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;

            const connection = await Einzelanschluss.findOne({
                where: { EINAN_NR: einanNr, BASIS_VERSION: basisVersion }
            });

            if (!connection) {
                res.status(404).send("Connection not found");
                return;
            }

            // Cascade delete UMS
            await RecUms.destroy({
                where: { EINAN_NR: einanNr, BASIS_VERSION: basisVersion }
            });

            await connection.destroy();
            res.json({ message: "Deleted" });
        } catch (error) {
            console.error("Error deleting connection:", error);
            res.status(500).send(error);
        }
    }

    // --- UMS Management ---

    public addUms = async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const ums = await RecUms.create(data);
            res.json(ums);
        } catch (error) {
            console.error("Error adding UMS:", error);
            res.status(500).send(error);
        }
    }

    public deleteUms = async (req: Request, res: Response) => {
        try {
            // Composite key deletion via body or params?
            // Params: /connections/:einanNr/ums/:tagesartNr/:beginn/:ende
            const { einanNr, tagesartNr, beginn, ende } = req.params;
            const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;

            const deleted = await RecUms.destroy({
                where: {
                    BASIS_VERSION: basisVersion,
                    EINAN_NR: einanNr,
                    TAGESART_NR: tagesartNr,
                    UMS_BEGINN: beginn,
                    UMS_ENDE: ende
                }
            });

            res.json({ deleted });
        } catch (error) {
            console.error("Error deleting UMS:", error);
            res.status(500).send(error);
        }
    }
}
