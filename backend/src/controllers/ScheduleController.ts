// scheduleController.ts
import { Request, Response } from 'express';
import { VehicleSchedule } from '../models/VehicleSchedule';
import { Trip } from '../models/Trip';
import { StopTime } from '../models/StopTime';
import { RouteStop } from '../models/RouteStop';
import { Sequelize } from 'sequelize';
import { Route } from '../models/Route';
import { Line } from '../models/Line';
import { Stop } from '../models/Stop';


class ScheduleController {
// Get all schedules
private sequelize: Sequelize
constructor(sequelize: Sequelize) {
    this.sequelize = sequelize
}
public async getAllSchedules(req: Request, res: Response) {
  try {
    const schedules = await VehicleSchedule.findAll();
    return res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
public async getScheduleById(req: Request, res: Response) {
    const scheduleId = req.params.id;

    try {
      const schedule = await VehicleSchedule.findByPk(scheduleId)

      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }

      return res.status(200).json(schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public async createSchedule(req: Request, res: Response) {
    const { number, stringValue } = req.body;

    try {
      const newSchedule = await VehicleSchedule.create({ number, stringValue });

      return res.status(201).json(newSchedule);
    } catch (error) {
      console.error('Error creating schedule:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public async updateSchedule(req: Request, res: Response) {
    const scheduleId = req.params.id;
    const scheduleData = req.body;
    try {
        const schedule = await VehicleSchedule.findByPk(scheduleId, {
          include: [{
            model: Trip,
            include: [{
              model: StopTime,
              include: [RouteStop]
            }, Route]
          }]
        });
  
        if (!schedule) {
          throw new Error('Schedule not found');
        }
  
        // Update schedule properties
        await schedule.update(scheduleData);
  
       
  
       
  
        // Fetch the updated schedule with trips and stop times
        const updatedSchedule = await VehicleSchedule.findByPk(scheduleId);
  
        return res.status(200).json(updatedSchedule);
    } catch (error) {
      console.error('Error updating schedule:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getTripsForSchedule(req: Request, res: Response) {
    const scheduleId = parseInt(req.params.scheduleId)
    const trips = await Trip.findAll({ where: { schedule_id: scheduleId }, include: [StopTime, {
        model: Route,
        include: [Line]
    }]})
    return res.status(200).json(trips)


  }

  public async getTripById(req: Request, res: Response) {
    const tripId = req.params.tripId;

    try {
      const trip = await Trip.findByPk(tripId, { include: [{
        model: StopTime,
        include: [{
            model: RouteStop,
            include: [Stop]
        }]
      }, { model: Route, include:[Line] }]})

      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      return res.status(200).json(trip);
    } catch (error) {
      console.error('Error fetching trip:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  public async createTripForSchedule(req: Request, res: Response) {
    const scheduleId = req.params.id;
    const tripData = req.body;
  
    try {
        
        let trip = await Trip.create(
          {
            ...tripData,
            schedule_id: scheduleId,
            stopTimes: tripData.stopTimes,
          }, { include: [StopTime]}
        );
       
        console.log(trip)
  
     
      return res.status(200).json(trip);
    } catch (error) {
      console.error('Error creating trip:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async updateTripForSchedule(req: Request, res: Response) {
    console.log('Updating trip')
    const scheduleId = parseInt(req.params.scheduleId);
    const tripId = parseInt(req.params.tripId)
    const updatedTripData = req.body;
    const updatedStopTimes = updatedTripData.stopTimes

    for (let i=0; i<updatedStopTimes.length; i++) {
      updatedStopTimes[i].trip_id = tripId
    }


    const existingTrip = await Trip.findByPk(tripId, {
      include: [StopTime]
    });
    // update wuth save
    if (existingTrip) {
      existingTrip.schedule_id = scheduleId
      existingTrip.routeId = updatedTripData.routeId;
      existingTrip.turnaroundMinutes = updatedTripData.turnaroundMinutes
      existingTrip.courseNumber = updatedTripData.courseNumber
      // Delete all prior stop times
      StopTime.destroy({
        where: {
          trip_id: tripId
        }
      })
      StopTime.bulkCreate(updatedStopTimes);



    }

    let updatedTrip = await existingTrip?.save()
    console.log(updatedTrip)
    return res.status(200).json(updatedTrip)


  }

  public async deleteTripForSchedule(req: Request, res: Response) {
    const scheduleId = req.params.scheduleId
    const tripId = req.params.tripId
    const deletedTrip = await Trip.destroy({ where: { id: tripId, schedule_id: scheduleId}})
    
    return res.status(200).json(deletedTrip)

  }


  public async repeatTrip(req: Request, res: Response) {
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
  public async getPrintout(req: Request, res: Response) {
    const scheduleId = req.params.scheduleId
    let output = '<!doctype html><html><head><meta charset="utf-8"><style type="text/css">body { font-family: "Helvetica Neue"; }</style></head><body></body></body></html>'
    res.send(output);
  }

}
export { ScheduleController };
