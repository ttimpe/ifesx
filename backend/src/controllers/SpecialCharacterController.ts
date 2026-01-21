// specialCharacterController.ts
import { Request, Response } from 'express';
import { SpecialCharacter } from '../models/SpecialCharacter';


class SpecialCharacterController {
// Get all specialCharacters
public async getAllSpecialCharacters(req: Request, res: Response) {
  try {
    const specialCharacters = await SpecialCharacter.findAll();
    return res.status(200).json(specialCharacters);
  } catch (error) {
    console.error('Error fetching specialCharacters:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
public async getSpecialCharacterById(req: Request, res: Response) {
    const specialCharacterId = req.params.id;

    try {
      const specialCharacter = await SpecialCharacter.findByPk(specialCharacterId);

      if (!specialCharacter) {
        return res.status(404).json({ message: 'SpecialCharacter not found' });
      }

      return res.status(200).json(specialCharacter);
    } catch (error) {
      console.error('Error fetching specialCharacter:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public async createSpecialCharacter(req: Request, res: Response) {
    const { number, stringValue } = req.body;

    try {
      const newSpecialCharacter = await SpecialCharacter.create({ number, stringValue });

      return res.status(201).json(newSpecialCharacter);
    } catch (error) {
      console.error('Error creating specialCharacter:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public async updateSpecialCharacter(req: Request, res: Response) {
    const specialCharacterId = req.params.id;
    const { number, stringValue } = req.body;

    try {
      const specialCharacter = await SpecialCharacter.findByPk(specialCharacterId);

      if (!specialCharacter) {
        return res.status(404).json({ message: 'SpecialCharacter not found' });
      }

      // Update specialCharacter properties
      specialCharacter.number = number;
      specialCharacter.stringValue = stringValue

      await specialCharacter.save();

      return res.status(200).json(specialCharacter);
    } catch (error) {
      console.error('Error updating specialCharacter:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
// Other CRUD operations can be added as needed
}
export { SpecialCharacterController };
