"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialCharacterController = void 0;
const SpecialCharacter_1 = require("../models/SpecialCharacter");
class SpecialCharacterController {
    // Get all specialCharacters
    async getAllSpecialCharacters(req, res) {
        try {
            const specialCharacters = await SpecialCharacter_1.SpecialCharacter.findAll();
            return res.status(200).json(specialCharacters);
        }
        catch (error) {
            console.error('Error fetching specialCharacters:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getSpecialCharacterById(req, res) {
        const specialCharacterId = req.params.id;
        try {
            const specialCharacter = await SpecialCharacter_1.SpecialCharacter.findByPk(specialCharacterId);
            if (!specialCharacter) {
                return res.status(404).json({ message: 'SpecialCharacter not found' });
            }
            return res.status(200).json(specialCharacter);
        }
        catch (error) {
            console.error('Error fetching specialCharacter:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async createSpecialCharacter(req, res) {
        const { number, stringValue } = req.body;
        try {
            const newSpecialCharacter = await SpecialCharacter_1.SpecialCharacter.create({ number, stringValue });
            return res.status(201).json(newSpecialCharacter);
        }
        catch (error) {
            console.error('Error creating specialCharacter:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    async updateSpecialCharacter(req, res) {
        const specialCharacterId = req.params.id;
        const { number, stringValue } = req.body;
        try {
            const specialCharacter = await SpecialCharacter_1.SpecialCharacter.findByPk(specialCharacterId);
            if (!specialCharacter) {
                return res.status(404).json({ message: 'SpecialCharacter not found' });
            }
            // Update specialCharacter properties
            specialCharacter.number = number;
            specialCharacter.stringValue = stringValue;
            await specialCharacter.save();
            return res.status(200).json(specialCharacter);
        }
        catch (error) {
            console.error('Error updating specialCharacter:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
exports.SpecialCharacterController = SpecialCharacterController;
