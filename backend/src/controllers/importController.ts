// importController.ts
import express, { Request, Response } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { Stop } from '../models/Stop';
import { Sequelize } from 'sequelize-typescript';
import { parse } from '@fast-csv/parse';
import { Line } from '../models/Line';
import { Op } from 'sequelize';
import { StopInformation } from '../models/StopInformation';


const importRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

importRouter.post('/gtfs', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const zip = new AdmZip(req.file.buffer);

    const gtfsFiles = zip.getEntries()
    // Process GTFS files as needed
    for (const file of gtfsFiles) {
      const content = zip.readAsText(file);
      // Add logic to parse and process GTFS data
      console.log(`Processing GTFS file ${file.entryName}`);
      if (file.entryName == 'stops.txt') {

        await parseStops(content);

      }
      if (file.entryName == 'routes.txt') {
        console.log('parsing lines')
        await parseLines(content);

      }
    }

    // Example: Insert data into the database (using Sequelize)
    //await sequelize.sync(); // Ensure tables are created

    // Example: Insert a stop into the Stop table
    //    await Stop.create({ id: '123', name: 'Example Stop' });

    return res.status(200).json({ message: 'GTFS data imported successfully' });
  } catch (error) {
    console.error('Error processing GTFS data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

importRouter.post('/stopInfo', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileData = req.file.buffer.toString('utf-8')
    await parseStopInfo(fileData)
    // Example: Insert data into the database (using Sequelize)
    //await sequelize.sync(); // Ensure tables are created

    // Example: Insert a stop into the Stop table
    //    await Stop.create({ id: '123', name: 'Example Stop' });

    return res.status(200).json({ message: 'Stop info imported successfully' });
  } catch (error) {
    console.error('Error processing stop info:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


async function parseStops(content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const stopsToCreate: any[] = [];
    const parentStops: any[] = []
    const stream = parse({ headers: true })
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
        } else {
          parentStops.push({
            id: row['stop_id'],
            name: row['stop_name'],
            longitude: row['stop_lon'],
            latitude: row['stop_lat']
          })
        }
      })
      .on('end', async () => {
        try {
          // Use bulkCreate to insert multiple records at once
          console.log('trying to create ', stopsToCreate.length, ' stops')
          await Stop.bulkCreate(parentStops, { ignoreDuplicates: true });
          await Stop.bulkCreate(stopsToCreate, { ignoreDuplicates: true });
          resolve();
        } catch (error) {
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

async function parseStopInfo(content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const stopInfosToCreate: any[] = [];
    const stream = parse({ headers: true })
      .on('data', (row) => {
        // Add each row to the array to be bulk created

        if (row['ID'] != '') {

          stopInfosToCreate.push({
            stop_id: row['ID'],
            code: row['Abkürzung'],
            short_name: row['Name']
            // Add other attributes as needed
          });
        }
      })


      .on('end', async () => {
        try {

          // find stop where id begins with id, set info, save

          stopInfosToCreate.forEach(async stopInfo => {
            let stopsWithId = await Stop.findAll({
              where: {
                id: {
                  [Op.like]: stopInfo.stop_id + '%'
                }
              },
              include: [StopInformation]
            })

            stopsWithId.forEach(async stopWithId => {
              if (!stopWithId.stopInformation) {
                stopWithId.stopInformation = new StopInformation()
              }
              console.log('setting code of stop ', stopWithId.name, ' to ', stopInfo.code)
              stopWithId.stopInformation!.code = stopInfo.code
              stopWithId.stopInformation!.shortName = stopInfo.short_name
              stopWithId.stopInformation!.stop_id = stopWithId.id

              await stopWithId.stopInformation!.save()
              await stopWithId.save()
            });

          })
          console.log('updated stop infos')
          resolve();
        } catch (error) {
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

async function parseLines(content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const linesToCreate: any[] = [];
    const stream = parse({ headers: true })
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
          console.log('trying to create ', linesToCreate.length, ' lines')
          await Line.bulkCreate(linesToCreate, { ignoreDuplicates: true });
          resolve();
        } catch (error) {
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

export default importRouter;
