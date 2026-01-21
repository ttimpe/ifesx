"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementController = void 0;
const Announcement_1 = require("./../models/Announcement");
const RecAnr_1 = require("../models/VDV/RecAnr");
const { promises: fs } = require('fs');
class AnnouncementController {
    // Migration Endpoint
    async migrateAnnouncements(req, res) {
        try {
            const announcements = await Announcement_1.Announcement.findAll();
            let migratedCount = 0;
            for (const ans of announcements) {
                const exists = await RecAnr_1.RecAnr.findByPk(ans.number); // Using 'number' as ANR_NR
                if (!exists) {
                    await RecAnr_1.RecAnr.create({
                        ANR_NR: ans.number,
                        ANR_TEXT: ans.name,
                        ANR_DATEI: ans.fileName, // Using 'fileName' for ANR_DATEI
                        BASIS_VERSION: 1
                    });
                    migratedCount++;
                }
            }
            return res.status(200).json({ success: true, message: `Migrated ${migratedCount} announcements.` });
        }
        catch (error) {
            console.error('Migration error:', error);
            return res.status(500).json({ message: 'Migration failed', error });
        }
    }
    // Get all announcements
    async getAllAnnoucements(req, res) {
        try {
            const announcements = await RecAnr_1.RecAnr.findAll();
            const mapped = announcements.map(a => ({
                id: a.ANR_NR,
                number: a.ANR_NR,
                name: a.ANR_TEXT,
                fileName: a.ANR_DATEI,
                stops: [] // Relations not fully migrated yet? RouteStop needs to look up ANR_NR
            }));
            return res.status(200).json(mapped);
        }
        catch (error) {
            console.error('Error fetching announcements:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getAllAnnouncementFiles(req, res) {
        try {
            let fileNames = await fs.readdir('./announcements/');
            return res.status(200).json(fileNames);
        }
        catch (error) {
            console.error('Error fetching files');
            return res.status(500).json({ message: 'Server error' });
        }
    }
    async getAnnouncementById(req, res) {
        const announcementId = req.params.id;
        try {
            const announcement = await RecAnr_1.RecAnr.findByPk(announcementId);
            if (!announcement) {
                return res.status(404).json({ message: 'Announcement not found' });
            }
            const mapped = {
                id: announcement.ANR_NR,
                number: announcement.ANR_NR,
                name: announcement.ANR_TEXT,
                fileName: announcement.ANR_DATEI,
                stops: []
            };
            return res.status(200).json(mapped);
        }
        catch (error) {
            console.error('Error fetching announcement:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async createAnnouncement(req, res) {
        const announcementData = req.body; // Expects { number, name, fileName }
        try {
            const newAnnouncement = await RecAnr_1.RecAnr.create({
                ANR_NR: announcementData.number, // Or auto-increment logic if needed? Legacy used manual number.
                ANR_TEXT: announcementData.name,
                ANR_DATEI: announcementData.fileName,
                BASIS_VERSION: 1
            });
            const mapped = {
                id: newAnnouncement.ANR_NR,
                number: newAnnouncement.ANR_NR,
                name: newAnnouncement.ANR_TEXT,
                fileName: newAnnouncement.ANR_DATEI,
            };
            return res.status(201).json(mapped);
        }
        catch (error) {
            console.error('Error creating announcement:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateAnnouncement(req, res) {
        const announcementId = req.params.id;
        const updatedAnnouncementData = req.body;
        try {
            const announcement = await RecAnr_1.RecAnr.findByPk(announcementId);
            if (!announcement) {
                return res.status(404).json({ message: 'Announcement not found' });
            }
            // Update fields
            if (updatedAnnouncementData.name)
                announcement.ANR_TEXT = updatedAnnouncementData.name;
            if (updatedAnnouncementData.fileName)
                announcement.ANR_DATEI = updatedAnnouncementData.fileName;
            await announcement.save();
            const mapped = {
                id: announcement.ANR_NR,
                number: announcement.ANR_NR,
                name: announcement.ANR_TEXT,
                fileName: announcement.ANR_DATEI,
            };
            return res.status(200).json(mapped);
        }
        catch (error) {
            console.error('Error updating announcement:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async deleteAnnouncement(req, res) {
        const announcementId = req.params.id;
        try {
            const existingAnnouncement = await RecAnr_1.RecAnr.findByPk(announcementId);
            if (!existingAnnouncement) {
                return res.status(404).json({ success: false, message: 'Announcement not found' });
            }
            await existingAnnouncement.destroy();
            return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting announcement:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
exports.AnnouncementController = AnnouncementController;
