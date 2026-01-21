"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const VehicleSchedule_1 = require("../models/VehicleSchedule");
const Trip_1 = require("../models/Trip");
const StopTime_1 = require("../models/StopTime");
const RouteStop_1 = require("../models/RouteStop");
const Route_1 = require("../models/Route");
const Line_1 = require("../models/Line");
const Stop_1 = require("../models/Stop");
class ScheduleController {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }
    async getAllSchedules(req, res) {
        try {
            const schedules = await VehicleSchedule_1.VehicleSchedule.findAll();
            return res.status(200).json(schedules);
        }
        catch (error) {
            console.error('Error fetching schedule:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getScheduleById(req, res) {
        const scheduleId = req.params.id;
        try {
            const schedule = await VehicleSchedule_1.VehicleSchedule.findByPk(scheduleId);
            if (!schedule) {
                return res.status(404).json({ message: 'Schedule not found' });
            }
            return res.status(200).json(schedule);
        }
        catch (error) {
            console.error('Error fetching schedule:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async createSchedule(req, res) {
        const { number, stringValue } = req.body;
        try {
            const newSchedule = await VehicleSchedule_1.VehicleSchedule.create({ number, stringValue });
            return res.status(201).json(newSchedule);
        }
        catch (error) {
            console.error('Error creating schedule:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateSchedule(req, res) {
        const scheduleId = req.params.id;
        const scheduleData = req.body;
        try {
            const schedule = await VehicleSchedule_1.VehicleSchedule.findByPk(scheduleId, {
                include: [{
                        model: Trip_1.Trip,
                        include: [{
                                model: StopTime_1.StopTime,
                                include: [RouteStop_1.RouteStop]
                            }, Route_1.Route]
                    }]
            });
            if (!schedule) {
                throw new Error('Schedule not found');
            }
            // Update schedule properties
            await schedule.update(scheduleData);
            // Fetch the updated schedule with trips and stop times
            const updatedSchedule = await VehicleSchedule_1.VehicleSchedule.findByPk(scheduleId);
            return res.status(200).json(updatedSchedule);
        }
        catch (error) {
            console.error('Error updating schedule:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getTripsForSchedule(req, res) {
        const scheduleId = parseInt(req.params.scheduleId);
        const trips = await Trip_1.Trip.findAll({ where: { schedule_id: scheduleId }, include: [StopTime_1.StopTime, {
                    model: Route_1.Route,
                    include: [Line_1.Line]
                }] });
        return res.status(200).json(trips);
    }
    async getTripById(req, res) {
        const tripId = req.params.tripId;
        try {
            const trip = await Trip_1.Trip.findByPk(tripId, { include: [{
                        model: StopTime_1.StopTime,
                        include: [{
                                model: RouteStop_1.RouteStop,
                                include: [Stop_1.Stop]
                            }]
                    }, { model: Route_1.Route, include: [Line_1.Line] }] });
            if (!trip) {
                return res.status(404).json({ message: 'Trip not found' });
            }
            return res.status(200).json(trip);
        }
        catch (error) {
            console.error('Error fetching trip:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async createTripForSchedule(req, res) {
        const scheduleId = req.params.id;
        const tripData = req.body;
        try {
            let trip = await Trip_1.Trip.create({
                ...tripData,
                schedule_id: scheduleId,
                stopTimes: tripData.stopTimes,
            }, { include: [StopTime_1.StopTime] });
            console.log(trip);
            return res.status(200).json(trip);
        }
        catch (error) {
            console.error('Error creating trip:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateTripForSchedule(req, res) {
        console.log('Updating trip');
        const scheduleId = parseInt(req.params.scheduleId);
        const tripId = parseInt(req.params.tripId);
        const updatedTripData = req.body;
        const updatedStopTimes = updatedTripData.stopTimes;
        for (let i = 0; i < updatedStopTimes.length; i++) {
            updatedStopTimes[i].trip_id = tripId;
        }
        const existingTrip = await Trip_1.Trip.findByPk(tripId, {
            include: [StopTime_1.StopTime]
        });
        // update wuth save
        if (existingTrip) {
            existingTrip.schedule_id = scheduleId;
            existingTrip.routeId = updatedTripData.routeId;
            existingTrip.turnaroundMinutes = updatedTripData.turnaroundMinutes;
            existingTrip.courseNumber = updatedTripData.courseNumber;
            // Delete all prior stop times
            StopTime_1.StopTime.destroy({
                where: {
                    trip_id: tripId
                }
            });
            StopTime_1.StopTime.bulkCreate(updatedStopTimes);
        }
        let updatedTrip = await (existingTrip === null || existingTrip === void 0 ? void 0 : existingTrip.save());
        console.log(updatedTrip);
        return res.status(200).json(updatedTrip);
    }
    async deleteTripForSchedule(req, res) {
        const scheduleId = req.params.scheduleId;
        const tripId = req.params.tripId;
        const deletedTrip = await Trip_1.Trip.destroy({ where: { id: tripId, schedule_id: scheduleId } });
        return res.status(200).json(deletedTrip);
    }
    async repeatTrip(req, res) {
        /*
        const scheduleId = req.params.scheduleId
        const tripId = req.params.tripId;
        const repeatTime = req.params.repeatTime
    
     
        try {
          const trip = await Trip.findByPk(tripId, { include: [StopTime] });
          const newTrip = await Trip.create({trip})
    
          
    
    
    
          if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
          }
            */
    }
    async getPrintout(req, res) {
        const scheduleId = req.params.scheduleId;
        let output = '<!doctype html><html><head><meta charset="utf-8"><style type="text/css">body { font-family: "Helvetica Neue"; }</style></head><body></body></body></html>';
        res.send(output);
    }
}
exports.ScheduleController = ScheduleController;
