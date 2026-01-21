"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// importController.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const Stop_1 = require("./models/Stop");
const parse_1 = require("@fast-csv/parse");
const Line_1 = require("./models/Line");
const importRouter = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
importRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const zip = new adm_zip_1.default(req.file.buffer);
        const gtfsFiles = zip.getEntries();
        // Process GTFS files as needed
        for (const file of gtfsFiles) {
            const content = zip.readAsText(file);
            // Add logic to parse and process GTFS data
            console.log(`Processing GTFS file ${file.entryName}`);
            if (file.entryName == 'stops.txt') {
                await parseStops(content);
            }
            if (file.entryName == 'routes.txt') {
                console.log('parsing lines');
                await parseLines(content);
            }
        }
        // Example: Insert data into the database (using Sequelize)
        //await sequelize.sync(); // Ensure tables are created
        // Example: Insert a stop into the Stop table
        //    await Stop.create({ id: '123', name: 'Example Stop' });
        return res.status(200).json({ message: 'GTFS data imported successfully' });
    }
    catch (error) {
        console.error('Error processing GTFS data:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
async function parseStops(content) {
    return new Promise((resolve, reject) => {
        const stopsToCreate = [];
        const parentStops = [];
        const stream = (0, parse_1.parse)({ headers: true })
            .on('data', (row) => {
            // Add each row to the array to be bulk created
            if (row['parent_station'] != '') {
                stopsToCreate.push({
                    id: row['stop_id'],
                    name: row['stop_name'],
                    longitude: row['stop_lon'],
                    latitude: row['stop_lat'],
                    parent_id: row['parent_station']
                    // Add other attributes as needed
                });
            }
            else {
                parentStops.push({
                    id: row['stop_id'],
                    name: row['stop_name'],
                    longitude: row['stop_lon'],
                    latitude: row['stop_lat']
                });
            }
        })
            .on('end', async () => {
            try {
                // Use bulkCreate to insert multiple records at once
                console.log('trying to create ', stopsToCreate.length, ' stops');
                await Stop_1.Stop.bulkCreate(parentStops, { ignoreDuplicates: true });
                await Stop_1.Stop.bulkCreate(stopsToCreate, { ignoreDuplicates: true });
                resolve();
            }
            catch (error) {
                reject(error);
            }
        })
            .on('error', (err) => {
            reject(err);
        });
        stream.write(content);
        stream.end();
    });
}
async function parseLines(content) {
    return new Promise((resolve, reject) => {
        const linesToCreate = [];
        const stream = (0, parse_1.parse)({ headers: true })
            .on('data', (row) => {
            // Add each row to the array to be bulk created
            // Check if moBiel
            if (row['agency_id'] == 'owl-14') {
                linesToCreate.push({
                    id: row['route_id'],
                    number: row['route_short_name'],
                    type: parseInt(row['route_type'])
                    // Add other attributes as needed
                });
            }
        })
            .on('end', async () => {
            try {
                // Use bulkCreate to insert multiple records at once
                console.log('trying to create ', linesToCreate.length, ' lines');
                await Line_1.Line.bulkCreate(linesToCreate, { ignoreDuplicates: true });
                resolve();
            }
            catch (error) {
                reject(error);
            }
        })
            .on('error', (err) => {
            reject(err);
        });
        stream.write(content);
        stream.end();
    });
}
exports.default = importRouter;
