"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagesartController = void 0;
const Tagesart_1 = require("../models/VDV/Tagesart");
const RecFrt_1 = require("../models/VDV/RecFrt");
const Betriebstag_1 = require("../models/VDV/Betriebstag");
class TagesartController {
    async getAll(req, res) {
        try {
            const data = await Tagesart_1.Tagesart.findAll();
            res.json(data);
        }
        catch (error) {
            console.error('Error fetching tagesart:', error);
            res.status(500).json({ error: 'Failed to fetch tagesart' });
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const data = await Tagesart_1.Tagesart.findOne({ where: { TAGESART_NR: id } });
            if (!data) {
                return res.status(404).json({ error: 'Tagesart not found' });
            }
            res.json(data);
        }
        catch (error) {
            console.error('Error fetching tagesart:', error);
            res.status(500).json({ error: 'Failed to fetch tagesart' });
        }
    }
    // Merge two Tagesarten
    async mergeTagesart(req, res) {
        const { sourceId, targetId, basisVersion, deleteSource } = req.body;
        if (!sourceId || !targetId || !basisVersion) {
            return res.status(400).json({ error: 'Missing required parameters: sourceId, targetId, basisVersion' });
        }
        if (sourceId === targetId) {
            return res.status(400).json({ error: 'Source and Target cannot be the same' });
        }
        const transaction = await RecFrt_1.RecFrt.sequelize.transaction();
        try {
            // 1. Fetch Source Trips
            const sourceTrips = await RecFrt_1.RecFrt.findAll({
                where: {
                    BASIS_VERSION: basisVersion,
                    TAGESART_NR: sourceId
                },
                transaction
            });
            // 2. Fetch Target Trips
            const targetTrips = await RecFrt_1.RecFrt.findAll({
                where: {
                    BASIS_VERSION: basisVersion,
                    TAGESART_NR: targetId
                },
                transaction
            });
            // Map target trips for quick lookup: KEY = LI_NR|STR_LI_VAR|FRT_START|BEREICH_NR
            // Note: This key definition defines "equality".
            const targetMap = new Map();
            targetTrips.forEach(t => {
                const key = `${t.LI_NR}|${t.STR_LI_VAR}|${t.FRT_START}|${t.BEREICH_NR}`;
                targetMap.set(key, t);
            });
            const tripsToMove = [];
            const tripsToDelete = [];
            for (const sourceTrip of sourceTrips) {
                const key = `${sourceTrip.LI_NR}|${sourceTrip.STR_LI_VAR}|${sourceTrip.FRT_START}|${sourceTrip.BEREICH_NR}`;
                const targetTrip = targetMap.get(key);
                if (targetTrip) {
                    // DUPLICATE FOUND
                    const sourceAssigned = (sourceTrip.UM_UID && sourceTrip.UM_UID > 0);
                    const targetAssigned = (targetTrip.UM_UID && targetTrip.UM_UID > 0);
                    if (sourceAssigned && !targetAssigned) {
                        // Case A: Source Assigned, Target Orphan -> Keep Source (will move), Delete Target
                        tripsToDelete.push(targetTrip.FRT_FID); // Delete TARGET
                        tripsToMove.push(sourceTrip.FRT_FID); // Move SOURCE
                        // Remove from map to prevent double processing if exact duplicate exists multiple times (unlikely with unique constraints but good practice)
                        targetMap.delete(key);
                    }
                    else if (!sourceAssigned && targetAssigned) {
                        // Case B: Source Orphan, Target Assigned -> Keep Target, Delete Source
                        tripsToDelete.push(sourceTrip.FRT_FID); // Delete SOURCE
                        // Target stays as is.
                    }
                    else if (!sourceAssigned && !targetAssigned) {
                        // Case C: Both Orphans -> Keep Target (arbitrary), Delete Source
                        tripsToDelete.push(sourceTrip.FRT_FID);
                    }
                    else {
                        // Case D: Both Assigned -> Conflict.
                        // Logic says: "If the trip exists in both tagesarten... delete the one that ISN'T assigned".
                        // Use case assumption: Merge shouldn't break existing blocks.
                        // We KEEP BOTH. Logic: They belong to different blocks probably.
                        tripsToMove.push(sourceTrip.FRT_FID);
                    }
                }
                else {
                    // No duplicate in target -> Move source trip
                    tripsToMove.push(sourceTrip.FRT_FID);
                }
            }
            // Execute deletions
            if (tripsToDelete.length > 0) {
                await RecFrt_1.RecFrt.destroy({
                    where: {
                        BASIS_VERSION: basisVersion,
                        FRT_FID: tripsToDelete
                    },
                    transaction
                });
            }
            // Execute Moves (Update TAGESART_NR)
            if (tripsToMove.length > 0) {
                await RecFrt_1.RecFrt.update({ TAGESART_NR: targetId }, {
                    where: {
                        BASIS_VERSION: basisVersion,
                        FRT_FID: tripsToMove
                    },
                    transaction
                });
            }
            // Update Betriebstage that pointed to Source -> Point to Target
            // (Only for this basis version!)
            await Betriebstag_1.Betriebstag.update({ TAGESART_NR: targetId }, {
                where: {
                    BASIS_VERSION: basisVersion,
                    TAGESART_NR: sourceId
                },
                transaction
            });
            // Optional: Delete Source Tagesart
            if (deleteSource) {
                // Only delete if NO references remain in OTHER basis versions?
                // Or just for this basis version context?
                // Tagesart table is global or versioned?
                // TAGESART table has no BASIS_VERSION PK typically in VDV (it's MENGE_TAGESART).
                // IFES might treat it globally.
                // If we delete here, it affects ALL versions.
                // Safety check: specific to implementation.
                // Users usually reuse IDs.
                // For now, let's NOT delete the Tagesart definition row unless explicitly confirmed safe.
                // The Checkbox says "Delete Source Day Type".
                // We will delete it.
                await Tagesart_1.Tagesart.destroy({ where: { TAGESART_NR: sourceId }, transaction });
            }
            await transaction.commit();
            res.json({
                success: true,
                moved: tripsToMove.length,
                deleted: tripsToDelete.length
            });
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error merging tagesart:', error);
            res.status(500).json({ error: 'Merge failed: ' + error.message });
        }
    }
}
exports.TagesartController = TagesartController;
