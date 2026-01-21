import { Stop } from '../models/Stop';
import { Destination } from './../models/Destination';
import { StopDistance } from './../models/StopDistance';
// specialCharacterController.ts
import { Request, Response } from 'express';


class NetworkController {
// Get all specialCharacters
public async getAllStopDistances(req: Request, res: Response) {
  try {
    const stopDistances = await StopDistance.findAll({
      include: [
        { model: Stop, as: 'originStop' }, // Include the origin stop
        { model: Stop, as: 'destinationStop' } // Include the destination stop
      ]
    });
    return res.status(200).json(stopDistances);
  } catch (error) {
    console.error('Error fetching stopDistances:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

  public async createStopDistance(req: Request, res: Response) {

    try {
      const newStopDistance = await StopDistance.upsert(req.body);

      return res.status(201).json(newStopDistance);
    } catch (error) {
      console.error('Error creating stopDistance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public async updateStopDistance(req: Request, res: Response) {
    const originId = req.params.origin_stop_id;
    const destinationId = req.params.destination_stop_id;
    const { distance } = req.body;

    try {
      const stopDistance = await StopDistance.findOne({ where: {"origin_stop_id": originId, "destination_stop_id": destinationId}})


      if (!stopDistance) {
        return res.status(404).json({ message: 'StopDistance not found' });
      }

      // Update specialCharacter properties
      stopDistance.distance = distance;

      await stopDistance.save();

      return res.status(200).json(stopDistance);
    } catch (error) {
      console.error('Error updating stopDistance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
// Other CRUD operations can be added as needed
}
export { NetworkController };
