// destinationController.ts
import { Request, Response } from 'express';

import { RecZnr } from '../models/VDV/RecZnr';

class DestinationController {
  // Get all destinations
  public async getAllDestinations(req: Request, res: Response) {
    try {
      const basisVersion = req.query.basis_version || req.query.basisVersion;
      const whereClause: any = {};
      if (basisVersion) {
        whereClause.BASIS_VERSION = basisVersion;
      }

      const destinations = await RecZnr.findAll({
        where: whereClause
      });
      const mappedDestinations = destinations.map(d => ({
        ...d.toJSON(),
        id: d.ZNR_NR,
        number: d.ZNR_NR,
        name: d.ZNR_TEXT,
        sign_text: d.ZNR_TEXT
      }));
      return res.status(200).json(mappedDestinations);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getDestinationById(req: Request, res: Response) {
    const destinationId = req.params.id;
    try {
      const destination = await RecZnr.findByPk(destinationId);
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }
      return res.status(200).json({
        ...destination.toJSON(),
        id: destination.ZNR_NR,
        number: destination.ZNR_NR,
        name: destination.ZNR_TEXT,
        sign_text: destination.ZNR_TEXT
      });
    } catch (error) {
      console.error('Error fetching destination:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async createDestination(req: Request, res: Response) {
    // Frontend sends: { ZNR_NR, ZNR_TEXT }
    const { ZNR_NR, ZNR_TEXT, number, name, short_name, sign_text } = req.body;

    // Use VDV fields if present, else fall back to legacy
    const nr = ZNR_NR || number;
    const text = ZNR_TEXT || name || sign_text || short_name;

    if (!nr || !text) {
      return res.status(400).json({ message: 'ZNR_NR and ZNR_TEXT are required' });
    }

    try {
      const newDestination = await RecZnr.create({
        ZNR_NR: nr,
        ZNR_TEXT: text,
        BASIS_VERSION: 1 // Default or from body
      });
      return res.status(201).json(newDestination);
    } catch (error) {
      console.error('Error creating destination:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async updateDestination(req: Request, res: Response) {
    const destinationId = req.params.id;
    const { number, name, short_name, sign_text } = req.body;

    try {
      const destination = await RecZnr.findByPk(destinationId);
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }

      // Update destination properties
      if (number) destination.ZNR_NR = number;
      if (name || sign_text) destination.ZNR_TEXT = name || sign_text || '';

      await destination.save();
      return res.status(200).json({
        ...destination.toJSON(),
        id: destination.ZNR_NR,
        number: destination.ZNR_NR,
        name: destination.ZNR_TEXT,
        sign_text: destination.ZNR_TEXT
      });
    } catch (error) {
      console.error('Error updating destination:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async migrateDestinations(req: Request, res: Response) {
    // Migration from legacy model disabled
    return res.status(501).json({ message: 'Migration not available' });
  }
}
export { DestinationController };
