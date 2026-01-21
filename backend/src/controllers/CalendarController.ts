import { Tagesart } from "../models/VDV/Tagesart";
import { Betriebstag } from "../models/VDV/Betriebstag";

import { Request, Response } from 'express';

export class CalendarController {

    // Tagesart / MENGE_TAGESART


    public async getTagesarten(req: Request, res: Response) {
        try {
            const tagesarten = await Tagesart.findAll()
            return res.status(200).json(tagesarten)
        } catch (error) {
            console.error('Error fetching Tagesarten:', error)
            return res.status(500).json({ message: 'Error fetching Tagesarten', error })
        }
    }

    public async addTagesart(req: Request, res: Response) {
        console.log('Add tagesart called')
        try {
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is required' })
            }

            const tagesart_nr: number = parseInt(req.body['tagesart_nr'] || req.body['TAGESART_NR']);
            const tagesart_text: string = req.body['tagesart_text'] || req.body['TAGESART_TEXT'];
            const basis_version: number = parseInt(req.body['basis_version'] || req.body['BASIS_VERSION'] || 1);

            // Validate required fields
            if (!tagesart_nr) {
                return res.status(400).json({ message: 'TAGESART_NR is required' })
            }

            // Check for duplicate TAGESART_NR (per Basis Version)
            const existing = await Tagesart.findOne({ where: { TAGESART_NR: tagesart_nr, BASIS_VERSION: basis_version } })
            if (existing) {
                return res.status(400).json({ message: 'TAGESART_NR already exists' })
            }

            const tagesart = await Tagesart.create({
                BASIS_VERSION: basis_version || 1, // Default or required? VDV implies required.
                TAGESART_NR: tagesart_nr,
                TAGESART_TEXT: tagesart_text
            })

            return res.status(201).json(tagesart)
        } catch (error) {
            console.error('Error creating Tagesart:', error)
            return res.status(500).json({ message: 'Error creating Tagesart', error })
        }
    }

    public async editTagesart(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.body.BASIS_VERSION || req.body.basis_version || 1);
            const tagesartNr = parseInt(req.body.TAGESART_NR || req.body.tagesart_nr || req.params.id);

            if (!tagesartNr) {
                return res.status(400).json({ message: 'TAGESART_NR is required' })
            }

            const tagesart = await Tagesart.findOne({ where: { TAGESART_NR: tagesartNr, BASIS_VERSION: basisVersion } })
            if (!tagesart) {
                return res.status(404).json({ message: 'Tagesart not found' })
            }

            // Update fields
            if (req.body.tagesart_text !== undefined) {
                tagesart.TAGESART_TEXT = req.body.tagesart_text
            }

            await tagesart.save()
            return res.status(200).json(tagesart)
        } catch (error) {
            console.error('Error updating Tagesart:', error)
            return res.status(500).json({ message: 'Error updating Tagesart', error })
        }
    }

    public async deleteTagesart(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.body.BASIS_VERSION || req.body.basis_version || 1);
            const tagesartNr = parseInt(req.body.TAGESART_NR || req.body.tagesart_nr || req.params.id);

            if (!tagesartNr) {
                return res.status(400).json({ message: 'TAGESART_NR is required' })
            }

            const tagesart = await Tagesart.findOne({ where: { TAGESART_NR: tagesartNr, BASIS_VERSION: basisVersion } })
            if (!tagesart) {
                return res.status(404).json({ message: 'Tagesart not found' })
            }

            // Check for dependencies in Betriebstage
            const dependentBetriebstage = await Betriebstag.count({
                where: { TAGESART_NR: tagesart.TAGESART_NR, BASIS_VERSION: tagesart.BASIS_VERSION }
            })

            if (dependentBetriebstage > 0) {
                return res.status(400).json({
                    message: `Cannot delete Tagesart: ${dependentBetriebstage} Betriebstage are using this Tagesart`
                })
            }

            await tagesart.destroy()
            return res.status(200).json({ message: 'Tagesart deleted successfully' })
        } catch (error) {
            console.error('Error deleting Tagesart:', error)
            return res.status(500).json({ message: 'Error deleting Tagesart', error })
        }
    }

    // Basis Versionen - moved to DataController

    // Betriebstage / FIRMENKALENDER

    public async getBetriebstage(req: Request, res: Response) {
        try {
            const hasBasisVersion = req.query.basis_version || req.query.BASIS_VERSION;
            const whereClause = hasBasisVersion ? { BASIS_VERSION: parseInt(hasBasisVersion as string) } : {};

            const betriebstage = await Betriebstag.findAll({
                where: whereClause,
                include: [{
                    model: Tagesart,
                    as: 'tagesart'
                }],
                order: [['BETRIEBSTAG', 'ASC']]
            })
            return res.status(200).json(betriebstage)
        } catch (error) {
            console.error('Error fetching Betriebstage:', error)
            return res.status(500).json({ message: 'Error fetching Betriebstage', error })
        }
    }

    public async addBetriebstag(req: Request, res: Response) {
        try {
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is required' })
            }

            const betriebstag: number = parseInt(req.body['BETRIEBSTAG'] || req.body['betriebstag']);
            const betriebstag_text: string = req.body['BETRIEBSTAG_TEXT'] || req.body['betriebstag_text'] || '';
            const tagesart_nr: number = parseInt(req.body['TAGESART_NR'] || req.body['tagesart_nr']);
            const basis_version: number = parseInt(req.body['BASIS_VERSION'] || req.body['basis_version'] || '0');

            // Validate required fields
            if (!betriebstag || isNaN(betriebstag)) {
                return res.status(400).json({ message: 'BETRIEBSTAG is required' })
            }
            if (!tagesart_nr || isNaN(tagesart_nr)) {
                return res.status(400).json({ message: 'TAGESART_NR is required' })
            }
            if (!basis_version || isNaN(basis_version)) {
                return res.status(400).json({ message: 'BASIS_VERSION is required' })
            }

            // Verify that the Tagesart exists
            const tagesart = await Tagesart.findOne({ where: { TAGESART_NR: tagesart_nr } })
            if (!tagesart) {
                return res.status(400).json({ message: 'Invalid TAGESART_NR: Tagesart does not exist' })
            }

            // Check if Betriebstag already exists for this BasisVersion and Date
            let existingBetriebstag = await Betriebstag.findOne({
                where: {
                    BASIS_VERSION: basis_version,
                    BETRIEBSTAG: betriebstag
                }
            })

            let newBetriebstag: Betriebstag;

            if (existingBetriebstag) {
                // Update existing
                existingBetriebstag.TAGESART_NR = tagesart_nr;
                if (betriebstag_text) existingBetriebstag.BETRIEBSTAG_TEXT = betriebstag_text;
                await existingBetriebstag.save();
                newBetriebstag = existingBetriebstag;
            } else {
                // Create new
                newBetriebstag = await Betriebstag.create({
                    BASIS_VERSION: basis_version,
                    BETRIEBSTAG: betriebstag,
                    BETRIEBSTAG_TEXT: betriebstag_text,
                    TAGESART_NR: tagesart_nr
                })
            }

            // Fetch with relations
            const created = await Betriebstag.findOne({
                where: { BASIS_VERSION: newBetriebstag.BASIS_VERSION, BETRIEBSTAG: newBetriebstag.BETRIEBSTAG },
                include: [{
                    model: Tagesart,
                    as: 'tagesart'
                }]
            })

            return res.status(201).json(created)
        } catch (error) {
            console.error('Error creating Betriebstag:', error)
            return res.status(500).json({ message: 'Error creating Betriebstag', error })
        }
    }

    public async editBetriebstag(req: Request, res: Response) {
        try {
            // Composite key update: expecting identity in body if ID not usable
            const basisVersion = parseInt(req.body.BASIS_VERSION || req.body.basis_version);
            const betriebstagDate = parseInt(req.body.BETRIEBSTAG || req.body.betriebstag);

            if (!basisVersion || !betriebstagDate) {
                return res.status(400).json({ message: 'BASIS_VERSION and BETRIEBSTAG are required in body' })
            }

            const betriebstag = await Betriebstag.findOne({
                where: { BASIS_VERSION: basisVersion, BETRIEBSTAG: betriebstagDate }
            })
            if (!betriebstag) {
                return res.status(404).json({ message: 'Betriebstag not found' })
            }

            // Update fields
            if (req.body.BETRIEBSTAG_TEXT !== undefined || req.body.betriebstag_text !== undefined) {
                betriebstag.BETRIEBSTAG_TEXT = req.body.BETRIEBSTAG_TEXT || req.body.betriebstag_text
            }
            if (req.body.TAGESART_NR !== undefined || req.body.tagesart_nr !== undefined) {
                const tagesart_nr = parseInt(req.body.TAGESART_NR || req.body.tagesart_nr)
                // Verify that the Tagesart exists
                const tagesart = await Tagesart.findOne({ where: { TAGESART_NR: tagesart_nr } })
                if (!tagesart) {
                    return res.status(400).json({ message: 'Invalid TAGESART_NR: Tagesart does not exist' })
                }
                betriebstag.TAGESART_NR = tagesart_nr
            }

            await betriebstag.save()

            // Fetch with relations
            const updated = await Betriebstag.findOne({
                where: { BASIS_VERSION: basisVersion, BETRIEBSTAG: betriebstagDate },
                include: [{
                    model: Tagesart,
                    as: 'tagesart'
                }]
            })

            return res.status(200).json(updated)
        } catch (error) {
            console.error('Error updating Betriebstag:', error)
            return res.status(500).json({ message: 'Error updating Betriebstag', error })
        }
    }

    public async deleteBetriebstag(req: Request, res: Response) {
        try {
            // Expect composite key in query or body, since URL param :id is 1D
            const basisVersion = parseInt(req.query.basis_version as string || req.body.BASIS_VERSION);
            const betriebstagDate = parseInt(req.query.betriebstag as string || req.body.BETRIEBSTAG);

            if (!basisVersion || !betriebstagDate) {
                // Fallback: try parsing ID if it looks key-like "1_20250101" (Not standard but helpful)
                const id = req.params.id;
                if (id && id.includes('_')) {
                    const parts = id.split('_');
                    // implement fallback parsing if needed, or just error
                }
                return res.status(400).json({ message: 'BASIS_VERSION and BETRIEBSTAG required' })
            }

            const betriebstag = await Betriebstag.findOne({
                where: { BASIS_VERSION: basisVersion, BETRIEBSTAG: betriebstagDate }
            })
            if (!betriebstag) {
                return res.status(404).json({ message: 'Betriebstag not found' })
            }

            await betriebstag.destroy()
            return res.status(200).json({ message: 'Betriebstag deleted successfully' })
        } catch (error) {
            console.error('Error deleting Betriebstag:', error)
            return res.status(500).json({ message: 'Error deleting Betriebstag', error })
        }
    }

}