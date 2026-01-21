"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkController = void 0;
const Stop_1 = require("../models/Stop");
const StopDistance_1 = require("./../models/StopDistance");
class NetworkController {
    // Get all specialCharacters
    async getAllStopDistances(req, res) {
        try {
            const stopDistances = await StopDistance_1.StopDistance.findAll({
                include: [
                    { model: Stop_1.Stop, as: 'originStop' }, // Include the origin stop
                    { model: Stop_1.Stop, as: 'destinationStop' } // Include the destination stop
                ]
            });
            return res.status(200).json(stopDistances);
        }
        catch (error) {
            console.error('Error fetching stopDistances:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async createStopDistance(req, res) {
        try {
            const newStopDistance = await StopDistance_1.StopDistance.upsert(req.body);
            return res.status(201).json(newStopDistance);
        }
        catch (error) {
            console.error('Error creating stopDistance:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateStopDistance(req, res) {
        const originId = req.params.origin_stop_id;
        const destinationId = req.params.destination_stop_id;
        const { distance } = req.body;
        try {
            const stopDistance = await StopDistance_1.StopDistance.findOne({ where: { "origin_stop_id": originId, "destination_stop_id": destinationId } });
            if (!stopDistance) {
                return res.status(404).json({ message: 'StopDistance not found' });
            }
            // Update specialCharacter properties
            stopDistance.distance = distance;
            await stopDistance.save();
            return res.status(200).json(stopDistance);
        }
        catch (error) {
            console.error('Error updating stopDistance:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.NetworkController = NetworkController;
