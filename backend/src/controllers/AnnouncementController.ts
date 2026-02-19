import { RecAnr } from '../models/VDV/RecAnr';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
const { promises: fs } = require('fs')

const announcementStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, './announcements/');
  },
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  }
});
export const announcementUpload = multer({ storage: announcementStorage });

class AnnouncementController {


  // Get all announcements
  public async getAllAnnoucements(req: Request, res: Response) {
    try {
      const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;

      const announcements = await RecAnr.findAll({
        where: { BASIS_VERSION: basisVersion }
      });

      const mapped = announcements.map(a => ({
        id: a.ANR_NR,
        number: a.ANR_NR,
        name: a.ANR_TEXT,
        fileName: a.ANR_DATEI,
        basisVersion: a.BASIS_VERSION,
        stops: [] // Relations not fully migrated yet? RouteStop needs to look up ANR_NR
      }));
      return res.status(200).json(mapped);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getAllAnnouncementFiles(req: Request, res: Response) {
    try {
      const dir = path.resolve('./announcements/');
      await fs.mkdir(dir, { recursive: true });
      let fileNames = await fs.readdir(dir);
      return res.status(200).json(fileNames);
    } catch (error) {
      console.error('Error fetching files', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  public async uploadAnnouncementFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Keine Datei hochgeladen' });
      }
      return res.status(200).json({ fileName: req.file.originalname });
    } catch (error) {
      console.error('Error uploading file', error);
      return res.status(500).json({ message: 'Upload fehlgeschlagen' });
    }
  }

  public async getAnnouncementById(req: Request, res: Response) {
    const announcementId = req.params.id;
    // Default to version 1 if not provided, but ideally frontend should always send it for detail view
    const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;

    try {
      const announcement = await RecAnr.findOne({
        where: {
          ANR_NR: announcementId,
          BASIS_VERSION: basisVersion
        }
      });

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      const mapped = {
        id: announcement.ANR_NR,
        number: announcement.ANR_NR,
        name: announcement.ANR_TEXT,
        fileName: announcement.ANR_DATEI,
        basisVersion: announcement.BASIS_VERSION,
        stops: []
      };

      return res.status(200).json(mapped);
    } catch (error) {
      console.error('Error fetching announcement:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async createAnnouncement(req: Request, res: Response) {
    const announcementData = req.body; // Expects { number, name, fileName, basisVersion }

    try {
      const newAnnouncement = await RecAnr.create({
        ANR_NR: announcementData.number,
        ANR_TEXT: announcementData.name,
        ANR_DATEI: announcementData.fileName,
        BASIS_VERSION: announcementData.basisVersion || 1
      });

      const mapped = {
        id: newAnnouncement.ANR_NR,
        number: newAnnouncement.ANR_NR,
        name: newAnnouncement.ANR_TEXT,
        fileName: newAnnouncement.ANR_DATEI,
        basisVersion: newAnnouncement.BASIS_VERSION
      };
      return res.status(201).json(mapped);
    } catch (error) {
      console.error('Error creating announcement:', error);
      // Determine if duplicate key error
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async updateAnnouncement(req: Request, res: Response) {
    const announcementId = req.params.id;
    const updatedAnnouncementData = req.body;
    const basisVersion = updatedAnnouncementData.basisVersion || 1;

    try {
      const announcement = await RecAnr.findOne({
        where: {
          ANR_NR: announcementId,
          BASIS_VERSION: basisVersion
        }
      });

      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      // Update fields
      if (updatedAnnouncementData.name) announcement.ANR_TEXT = updatedAnnouncementData.name;
      if (updatedAnnouncementData.fileName !== undefined) announcement.ANR_DATEI = updatedAnnouncementData.fileName;

      await announcement.save();

      const mapped = {
        id: announcement.ANR_NR,
        number: announcement.ANR_NR,
        name: announcement.ANR_TEXT,
        fileName: announcement.ANR_DATEI,
        basisVersion: announcement.BASIS_VERSION
      };

      return res.status(200).json(mapped);
    } catch (error) {
      console.error('Error updating announcement:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteAnnouncement(req: Request, res: Response) {
    const announcementId = req.params.id;
    const basisVersion = req.query.basisVersion ? Number(req.query.basisVersion) : 1;

    try {
      const existingAnnouncement = await RecAnr.findOne({
        where: {
          ANR_NR: announcementId,
          BASIS_VERSION: basisVersion
        }
      });

      if (!existingAnnouncement) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }

      await existingAnnouncement.destroy();

      return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
export { AnnouncementController };
