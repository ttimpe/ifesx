import { BasisVersion } from "../models/VDV/BasisVersion";
import { BasisVersionGueltigkeit } from "../models/VDV/BasisVersionGueltigkeit";
import { Request, Response } from 'express';
import { RecOrt } from '../models/VDV/RecOrt';
import { RecHp } from '../models/VDV/RecHp';
import { RecLid } from '../models/VDV/RecLid';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecSel } from '../models/VDV/RecSel';
import { RecSelFztFeld } from '../models/VDV/RecSelFztFeld';
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecAnr } from '../models/VDV/RecAnr';
import { RecUeb } from '../models/VDV/RecUeb';
import { RecOm } from '../models/VDV/RecOm';
import { MengeBereich } from '../models/VDV/MengeBereich';
import { MengeFgr } from '../models/VDV/MengeFgr';
import { Tagesart } from '../models/VDV/Tagesart';
import { Betriebstag } from '../models/VDV/Betriebstag';
import { RecZnr } from '../models/VDV/RecZnr';

export class DataController {
    // ===== BASIS VERSION CRUD =====

    public async getBasisVersionen(req: Request, res: Response) {
        try {
            const versionen = await BasisVersion.findAll({
                order: [['BASIS_VERSION', 'DESC']]
            })
            return res.status(200).json(versionen)
        } catch (error) {
            console.error('Error fetching BasisVersionen:', error)
            return res.status(500).json({ message: 'Error fetching BasisVersionen', error })
        }
    }

    public async createBasisVersion(req: Request, res: Response) {
        try {
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is required' })
            }

            const basis_version: number = parseInt(req.body['BASIS_VERSION'] || req.body['basis_version']);
            const basis_version_text: string = req.body['BASIS_VERSION_TEXT'] || req.body['basis_version_text'];

            if (!basis_version) {
                return res.status(400).json({ message: 'BASIS_VERSION is required' })
            }

            // Check for duplicate
            const existing = await BasisVersion.findOne({ where: { BASIS_VERSION: basis_version } })
            if (existing) {
                return res.status(400).json({ message: 'BASIS_VERSION already exists' })
            }

            const newVersion = await BasisVersion.create({
                BASIS_VERSION: basis_version,
                BASIS_VERSION_TEXT: basis_version_text
            })

            return res.status(201).json(newVersion)
        } catch (error) {
            console.error('Error creating BasisVersion:', error)
            return res.status(500).json({ message: 'Error creating BasisVersion', error })
        }
    }

    public async editBasisVersion(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id)
            if (!id) {
                return res.status(400).json({ message: 'ID (BASIS_VERSION) parameter is required' })
            }

            const version = await BasisVersion.findByPk(id)
            if (!version) {
                // Try looking into body if param ID doesn't match? No, param should be the key
                return res.status(404).json({ message: 'BasisVersion not found' })
            }

            if (req.body.BASIS_VERSION !== undefined || req.body.basis_version !== undefined) {
                // Primary key update might be tricky, usually discouraged, but if needed:
                // version.BASIS_VERSION = ...
            }
            if (req.body.BASIS_VERSION_TEXT !== undefined || req.body.basis_version_text !== undefined) {
                version.BASIS_VERSION_TEXT = req.body.BASIS_VERSION_TEXT || req.body.basis_version_text
            }

            await version.save()
            return res.status(200).json(version)
        } catch (error) {
            console.error('Error updating BasisVersion:', error)
            return res.status(500).json({ message: 'Error updating BasisVersion', error })
        }
    }

    public async deleteBasisVersion(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id)
            if (!id) {
                return res.status(400).json({ message: 'ID (BASIS_VERSION) parameter is required' })
            }

            const version = await BasisVersion.findByPk(id)
            if (!version) {
                return res.status(404).json({ message: 'BasisVersion not found' })
            }

            // Delete all related records in proper order (respecting dependencies)
            console.log(`[DELETE] Deleting all data for BASIS_VERSION ${id}...`);

            await RecSelFztFeld.destroy({ where: { BASIS_VERSION: id } });
            await RecSel.destroy({ where: { BASIS_VERSION: id } });
            await LidVerlauf.destroy({ where: { BASIS_VERSION: id } });
            await RecLid.destroy({ where: { BASIS_VERSION: id } });
            await RecZnr.destroy({ where: { BASIS_VERSION: id } });
            await RecFrt.destroy({ where: { BASIS_VERSION: id } });
            await RecUmlauf.destroy({ where: { BASIS_VERSION: id } });
            await RecHp.destroy({ where: { BASIS_VERSION: id } });
            await RecOrt.destroy({ where: { BASIS_VERSION: id } });
            await RecAnr.destroy({ where: { BASIS_VERSION: id } });
            await RecUeb.destroy({ where: { BASIS_VERSION: id } });
            await RecOm.destroy({ where: { BASIS_VERSION: id } });
            await MengeBereich.destroy({ where: { BASIS_VERSION: id } });
            await MengeFgr.destroy({ where: { BASIS_VERSION: id } });

            // Delete calendar-related tables
            await Betriebstag.destroy({ where: { BASIS_VERSION: id } });
            await Tagesart.destroy({ where: { BASIS_VERSION: id } });
            await BasisVersionGueltigkeit.destroy({ where: { BASIS_VERSION: id } });

            // Delete the version itself
            await version.destroy()

            console.log(`[DELETE] Successfully deleted BASIS_VERSION ${id} and all related data`);
            return res.status(200).json({ message: 'BasisVersion and all related data deleted successfully' })
        } catch (error) {
            console.error('Error deleting BasisVersion:', error)
            return res.status(500).json({ message: 'Error deleting BasisVersion', error })
        }
    }

    // ===== BASIS VERSION GÜLTIGKEIT CRUD =====

    public async getGueltigkeiten(req: Request, res: Response) {
        try {
            const gueltigkeiten = await BasisVersionGueltigkeit.findAll({
                order: [['VER_GUELTIGKEIT', 'ASC']]
            })
            return res.status(200).json(gueltigkeiten)
        } catch (error) {
            console.error('Error fetching Gueltigkeiten:', error)
            return res.status(500).json({ message: 'Error fetching Gueltigkeiten', error })
        }
    }

    public async createGueltigkeit(req: Request, res: Response) {
        try {
            if (!req.body) {
                return res.status(400).json({ message: 'Request body is required' })
            }

            const ver_gueltigkeit: number = parseInt(req.body['VER_GUELTIGKEIT']);
            const basis_version: number = parseInt(req.body['BASIS_VERSION']);

            if (!ver_gueltigkeit) {
                return res.status(400).json({ message: 'VER_GUELTIGKEIT is required' })
            }
            if (!basis_version) {
                return res.status(400).json({ message: 'BASIS_VERSION is required' })
            }

            const [instance, created] = await BasisVersionGueltigkeit.findOrCreate({
                where: {
                    VER_GUELTIGKEIT: ver_gueltigkeit,
                    BASIS_VERSION: basis_version
                }
            })

            return res.status(created ? 201 : 200).json(instance)
        } catch (error) {
            console.error('Error creating Gueltigkeit:', error)
            return res.status(500).json({ message: 'Error creating Gueltigkeit', error })
        }
    }

    public async deleteGueltigkeit(req: Request, res: Response) {
        try {
            const basisVersion = parseInt(req.body.BASIS_VERSION || req.query.basis_version);
            const verGueltigkeit = parseInt(req.body.VER_GUELTIGKEIT || req.query.ver_gueltigkeit);

            if (!basisVersion || !verGueltigkeit) {
                // Return 400 or try fallback if needed, but for now strict
                return res.status(400).json({ message: 'BASIS_VERSION and VER_GUELTIGKEIT required' })
            }

            const gueltigkeit = await BasisVersionGueltigkeit.findOne({
                where: { BASIS_VERSION: basisVersion, VER_GUELTIGKEIT: verGueltigkeit }
            })
            if (!gueltigkeit) {
                return res.status(404).json({ message: 'Gueltigkeit not found' })
            }

            await gueltigkeit.destroy()
            return res.status(200).json({ message: 'Gueltigkeit deleted successfully' })
        } catch (error) {
            console.error('Error deleting Gueltigkeit:', error)
            return res.status(500).json({ message: 'Error deleting Gueltigkeit', error })
        }
    }

}