import express from 'express'
import bodyParser from 'body-parser'
import sqlite from 'sqlite'
import { sqlite3 } from 'sqlite3';
import cors from 'cors'
import { Sequelize } from 'sequelize-typescript';
import path from 'path';

import { RecAnrController } from './controllers/RecAnrController';
import { RecUebController } from './controllers/RecUebController';
import { RecUmlaufController } from './controllers/RecUmlaufController';
import { RecSelController } from './controllers/RecSelController';
import { RecOmController } from './controllers/RecOmController';
import { RecFrtController } from './controllers/RecFrtController';
import { MengeBereichController } from './controllers/MengeBereichController';

import { MengeFzgTyp } from './models/VDV/MengeFzgTyp';
import { Fahrzeug } from './models/VDV/Fahrzeug';
import { VehicleController } from './controllers/VehicleController';
import { StopController } from './controllers/stopController';
import { DestinationController } from './controllers/DestinationController';
import { LineController } from './controllers/LineController';
import { CalendarController } from './controllers/CalendarController';
import { Tagesart } from './models/VDV/Tagesart';
import { Betriebstag } from './models/VDV/Betriebstag';
import { BasisVersion } from './models/VDV/BasisVersion';
import { BasisVersionGueltigkeit } from './models/VDV/BasisVersionGueltigkeit';
import { RecZnr } from './models/VDV/RecZnr';
import { RecLid } from './models/VDV/RecLid';

import { RecAnr } from './models/VDV/RecAnr';
import { RecOrt } from './models/VDV/RecOrt';
import { RecHp } from './models/VDV/RecHp';
import { DataController } from './controllers/DataController';
import { LidVerlauf } from './models/VDV/LidVerlauf';
import { RecUeb } from './models/VDV/RecUeb';
import { UebFzt } from './models/VDV/UebFzt';
import { RecUmlauf } from './models/VDV/RecUmlauf';
import { RecFrt } from './models/VDV/RecFrt';
import { RecUms } from './models/VDV/RecUms';
import { RecSel } from './models/VDV/RecSel';
import { RecOm } from './models/VDV/RecOm';
import { MengeBereich } from './models/VDV/MengeBereich';
import { MengeFgr } from './models/VDV/MengeFgr';
import { MengeFahrtart } from './models/VDV/MengeFahrtart';
import { MengeBhof } from './models/VDV/MengeBhof';
import { RecSelFztFeld } from './models/VDV/RecSelFztFeld';
import { Einzelanschluss } from './models/VDV/Einzelanschluss';
import { ConnectionController } from './controllers/ConnectionController';
import { BhofController } from './controllers/BhofController';
import { VdvImportController } from './controllers/VdvImportController';
import { announcementUpload } from './controllers/RecAnrController';
import multer from 'multer';


import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const app = express();
const port = 3000;

// Multer for VDV file uploads
const vdvUpload = multer({ dest: 'uploads/' });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors()); // Enable CORS for all routes (still useful for dev)

const apiRouter = express.Router();

apiRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const stopRouter = express.Router();
const stopController = new StopController()



const vdvRouter = express.Router();
const recAnrController = new RecAnrController();
const vehicleController = new VehicleController();
const vdvImportController = new VdvImportController();

// VDV Import/Export Routes
vdvRouter.get('/tables', vdvImportController.getSupportedTables);
vdvRouter.post('/import-x10', vdvUpload.single('file'), vdvImportController.importX10);
vdvRouter.post('/analyze-x10', vdvUpload.single('file'), vdvImportController.analyzeX10);
vdvRouter.get('/export-x10/:tableName', vdvImportController.exportX10);

vdvRouter.get('/orte/groups/:refId', stopController.getGroupDetails);
vdvRouter.put('/orte/groups/:refId', stopController.updateGroup);

vdvRouter.get('/orte', stopController.getAllRecOrts);
vdvRouter.get('/orte/:ortNr', stopController.getRecOrtById);
vdvRouter.post('/orte', stopController.createRecOrt);
vdvRouter.put('/orte/:ortNr', stopController.updateRecOrt);
vdvRouter.delete('/orte/:ortNr', stopController.deleteRecOrt);

const recUebController = new RecUebController();
const recUmlaufController = new RecUmlaufController();
const recSelController = new RecSelController();
const recOmController = new RecOmController();
const recFrtController = new RecFrtController();
const mengeBereichController = new MengeBereichController();
const bhofController = new BhofController();

// RecAnr Routes (Ansagetexte)
vdvRouter.get('/rec-anr/files', recAnrController.getFiles);
vdvRouter.post('/rec-anr/upload', announcementUpload.single('file'), recAnrController.uploadFile);
vdvRouter.delete('/rec-anr/files/:filename', recAnrController.deleteFile);
vdvRouter.get('/rec-anr', recAnrController.getAll);
vdvRouter.get('/rec-anr/:id', recAnrController.getById);
vdvRouter.post('/rec-anr', recAnrController.create);
vdvRouter.put('/rec-anr/:id', recAnrController.update);
vdvRouter.delete('/rec-anr/:id', recAnrController.delete);

// RecUeb Routes
vdvRouter.get('/transfers', recUebController.getAll);
vdvRouter.get('/transfers/detail', recUebController.getOne);
vdvRouter.post('/transfers', recUebController.create);
vdvRouter.put('/transfers', recUebController.update);
vdvRouter.put('/transfers', recUebController.update);
vdvRouter.delete('/transfers', recUebController.delete);

// RecUmlauf Routes
vdvRouter.get('/blocks', recUmlaufController.getAll);
vdvRouter.get('/blocks/detail', recUmlaufController.getOne);
vdvRouter.post('/blocks', recUmlaufController.create);
vdvRouter.put('/blocks', recUmlaufController.update);
vdvRouter.post('/blocks/set-kurs', recUmlaufController.setKursNr);
vdvRouter.delete('/blocks', recUmlaufController.delete);

// RecUms Routes
vdvRouter.get('/block-pieces', recUmlaufController.getAllUms);

// RecFrt (Trips) Routes
vdvRouter.get('/rec-frt', recFrtController.getAll);
vdvRouter.get('/rec-frt/by-umlauf/:umUid', recFrtController.getByUmlauf);
vdvRouter.get('/rec-frt/next-fid/:basisVersion', recFrtController.getNextFrtFid);
vdvRouter.get('/rec-frt/orphans', (req, res) => recFrtController.getOrphanTrips(req, res));
vdvRouter.get('/rec-frt/:basisVersion/:frtFid', recFrtController.getByCompositeKey);
vdvRouter.post('/rec-frt', recFrtController.create);
vdvRouter.put('/rec-frt/:basisVersion/:frtFid', recFrtController.update);
vdvRouter.delete('/rec-frt/:basisVersion/:frtFid', recFrtController.delete);

// RecSel Routes
vdvRouter.get('/rec-sel', recSelController.getAll);
vdvRouter.post('/rec-sel', recSelController.create);
// vdvRouter.post('/rec-sel/migrate', recSelController.migrateStopDistances);
vdvRouter.get('/rec-sel/:ortNr/:selZiel', recSelController.getByCompositeKey);
vdvRouter.put('/rec-sel/:ortNr/:selZiel', recSelController.updateByCompositeKey);
vdvRouter.delete('/rec-sel/:ortNr/:selZiel', recSelController.deleteByCompositeKey);

// Travel Time Matrix (RecSelFztFeld)
vdvRouter.get('/rec-sel-fzt-feld/by-bereich/:bereichNr', recSelController.getFztByBereich);
vdvRouter.post('/rec-sel-fzt-feld', recSelController.updateFzt);

// Intermediate Points (RecSelZp)
import { RecSelZpController } from './controllers/RecSelZpController';
const recSelZpController = new RecSelZpController();
vdvRouter.get('/rec-sel-zp', recSelZpController.getAll);
vdvRouter.get('/rec-sel-zp/:ortNr/:selZiel', recSelZpController.getBySection);
vdvRouter.post('/rec-sel-zp', recSelZpController.create);
vdvRouter.put('/rec-sel-zp', recSelZpController.update);
vdvRouter.delete('/rec-sel-zp', recSelZpController.delete);

// Vehicles
vdvRouter.get('/rec-fzg-typ', vehicleController.getAllTypes);
vdvRouter.post('/rec-fzg-typ', vehicleController.createType);
vdvRouter.put('/rec-fzg-typ/:id', vehicleController.updateType);
vdvRouter.delete('/rec-fzg-typ/:id', vehicleController.deleteType);
vdvRouter.get('/rec-fzg', vehicleController.getAllVehicles);
vdvRouter.post('/rec-fzg', vehicleController.createVehicle);
vdvRouter.post('/rec-fzg/batch', vehicleController.batchCreateVehicles);
vdvRouter.get('/rec-fzg/:id', vehicleController.getVehicleById);
vdvRouter.put('/rec-fzg/:id', vehicleController.updateVehicle);
vdvRouter.delete('/rec-fzg/:id', vehicleController.deleteVehicle);

// RecOm (Ortsmarken) Routes
vdvRouter.get('/ortsmarken', recOmController.getAll);
vdvRouter.get('/ortsmarken/:id', recOmController.getById);
vdvRouter.post('/ortsmarken', recOmController.create);
vdvRouter.put('/ortsmarken/:id', recOmController.update);
vdvRouter.delete('/ortsmarken/:id', recOmController.delete);

// MengeBereich (Fahrzeitprofile)
vdvRouter.get('/menge-bereich', mengeBereichController.getAll);
vdvRouter.get('/menge-bereich/:id', mengeBereichController.getById);
vdvRouter.post('/menge-bereich', mengeBereichController.create);
vdvRouter.put('/menge-bereich/:id', mengeBereichController.update);
vdvRouter.delete('/menge-bereich/:id', mengeBereichController.delete);

// Betriebshöfe (MENGE_BHOF)
vdvRouter.get('/betriebshoefe', bhofController.getAll);
vdvRouter.get('/betriebshoefe/:bhofNr', bhofController.getById);
vdvRouter.post('/betriebshoefe', bhofController.create);
vdvRouter.put('/betriebshoefe/:bhofNr', bhofController.update);
vdvRouter.delete('/betriebshoefe/:bhofNr', bhofController.delete);


// Tagesart (MENGE_TAGESART)
import { TagesartController } from './controllers/TagesartController';
const tagesartController = new TagesartController();
vdvRouter.get('/tagesart', tagesartController.getAll);
vdvRouter.get('/tagesart/:id', tagesartController.getById);
vdvRouter.post('/tagesart/merge', tagesartController.mergeTagesart);

// MengeFgr (Fahrzeitgruppen)
import { MengeFgrController } from './controllers/MengeFgrController';
const mengeFgrController = new MengeFgrController();
vdvRouter.get('/menge-fgr', mengeFgrController.getAll);
vdvRouter.get('/menge-fgr/:id', mengeFgrController.getById);
vdvRouter.post('/menge-fgr', mengeFgrController.create);
vdvRouter.put('/menge-fgr/:id', mengeFgrController.update);
vdvRouter.delete('/menge-fgr/:id', mengeFgrController.delete);

// MengeFahrtart (Fahrtarten)
import { MengeFahrtartController } from './controllers/MengeFahrtartController';
const mengeFahrtartController = new MengeFahrtartController();
vdvRouter.get('/menge-fahrtart', mengeFahrtartController.getAll);
vdvRouter.get('/menge-fahrtart/:id', mengeFahrtartController.getById);
vdvRouter.post('/menge-fahrtart', mengeFahrtartController.create);
vdvRouter.put('/menge-fahrtart/:id', mengeFahrtartController.update);
vdvRouter.delete('/menge-fahrtart/:id', mengeFahrtartController.delete);

const connectionController = new ConnectionController();
vdvRouter.get('/connections', connectionController.getAll);
vdvRouter.post('/connections', connectionController.create);
vdvRouter.get('/connections/:einanNr', connectionController.getOne);
vdvRouter.put('/connections/:einanNr', connectionController.update);
vdvRouter.delete('/connections/:einanNr', connectionController.delete);
vdvRouter.post('/connections/ums', connectionController.addUms);
vdvRouter.delete('/connections/:einanNr/ums/:tagesartNr/:beginn/:ende', connectionController.deleteUms);

// Duty Roster (VDV 455)
import { DutyRosterController } from './controllers/DutyRosterController';
const dutyRosterController = new DutyRosterController();

// Piece Types
vdvRouter.get('/planning/piece-types', dutyRosterController.getAllPieceTypes);
vdvRouter.post('/planning/piece-types', dutyRosterController.createPieceType);
vdvRouter.put('/planning/piece-types/:basisVersion/:id', dutyRosterController.updatePieceType);
vdvRouter.delete('/planning/piece-types/:basisVersion/:id', dutyRosterController.deletePieceType);

// Duties
vdvRouter.get('/planning/duties', dutyRosterController.getAllDuties);
vdvRouter.post('/planning/duties', dutyRosterController.createDuty);

// Pieces
vdvRouter.get('/planning/pieces', dutyRosterController.getAllPieces);
vdvRouter.post('/planning/pieces', dutyRosterController.createPiece);

// MengeDienstart (Service Types)
import { MengeDienstartController } from './controllers/MengeDienstartController';
const mengeDienstartController = new MengeDienstartController();
vdvRouter.get('/planning/dienstart', mengeDienstartController.getAll);
vdvRouter.get('/planning/dienstart/:basisVersion/:id', mengeDienstartController.getById);
vdvRouter.post('/planning/dienstart', mengeDienstartController.create);
vdvRouter.put('/planning/dienstart/:basisVersion/:id', mengeDienstartController.update);
vdvRouter.delete('/planning/dienstart/:basisVersion/:id', mengeDienstartController.delete);

apiRouter.use('/vdv', vdvRouter);

// Initialize Sequelize
// Initialize Sequelize
import { initDB } from './config/database';

initDB();


const destinationRouter = express.Router()
const destinationController = new DestinationController()
destinationRouter.get('/', destinationController.getAllDestinations)
destinationRouter.get('/:id', destinationController.getDestinationById)
destinationRouter.put('/:id', destinationController.updateDestination)
destinationRouter.post('/migrate', destinationController.migrateDestinations)
destinationRouter.post('/', destinationController.createDestination)
destinationRouter.delete('/:id', destinationController.deleteDestination)
apiRouter.use('/destinations', destinationRouter)



const lineRouter = express.Router()
const lineController = new LineController()
lineRouter.get('/', lineController.getAllLines)
lineRouter.get('/variants', lineController.getLineVariants)
lineRouter.get('/variant-stops', lineController.getVariantStops)
lineRouter.post('/variant-stops', lineController.addVariantStop)
lineRouter.put('/variant-stops', lineController.updateVariantStop)
lineRouter.delete('/variant-stops', lineController.removeVariantStop)
lineRouter.post('/variant-stops/swap', lineController.swapVariantStops)
lineRouter.post('/variants', lineController.createVariant)
lineRouter.post('/variants/duplicate', lineController.duplicateVariant)
lineRouter.put('/variants', lineController.updateVariant)
lineRouter.delete('/variants', lineController.deleteVariant)
lineRouter.get('/:id', lineController.getLineById)
lineRouter.put('/:oldId/change-id', lineController.updateLineIdCascade)
lineRouter.put('/:id', lineController.updateLine)
lineRouter.delete('/:id', lineController.deleteLine)

apiRouter.use('/lines', lineRouter)



const calendarRouter = express.Router()

const calendarController = new CalendarController()

// Tagesarten routes
calendarRouter.get('/tagesarten', calendarController.getTagesarten)
calendarRouter.post('/tagesarten', calendarController.addTagesart)
calendarRouter.put('/tagesarten/:id', calendarController.editTagesart)
calendarRouter.delete('/tagesarten/:id', calendarController.deleteTagesart)

// Betriebstage routes
calendarRouter.get('/betriebstage', calendarController.getBetriebstage)
calendarRouter.post('/betriebstage', calendarController.addBetriebstag)
calendarRouter.put('/betriebstage/:id', calendarController.editBetriebstag)
calendarRouter.delete('/betriebstage/:id', calendarController.deleteBetriebstag)


apiRouter.use('/calendar', calendarRouter)



const versionRouter = express.Router()
const dataController = new DataController()

versionRouter.get('/versionen', dataController.getBasisVersionen);
versionRouter.post('/versionen', dataController.createBasisVersion)
versionRouter.put('/versionen/:id', dataController.editBasisVersion)
versionRouter.delete('/versionen/:id', dataController.deleteBasisVersion)

// Gueltigkeiten routes
versionRouter.get('/gueltigkeiten', dataController.getGueltigkeiten)
versionRouter.post('/gueltigkeiten', dataController.createGueltigkeit)
versionRouter.delete('/gueltigkeiten/:id', dataController.deleteGueltigkeit)


apiRouter.use('/basis', versionRouter)

import gtfsRouter from './controllers/GTFSController';
apiRouter.use('/gtfs', gtfsRouter);

import lioRouter from './controllers/LioImportController';
apiRouter.use('/lio', lioRouter);

import { KursblattController } from './controllers/KursblattController';
const kursblattController = new KursblattController();
// Prefix with /kursblatt inside apiRouter? No, user path was /kursblatt/:id/pdf.
// So now /api/kursblatt/:id/pdf
const kursblattRouter = express.Router();
kursblattRouter.get('/:id/pdf', (req, res) => kursblattController.generatePdf(req, res));
apiRouter.use('/kursblatt', kursblattRouter);

// Mount API
app.use('/api', apiRouter);

// Serve Frontend Static Support
// Assuming user will build frontend to 'public' folder in backend root.
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Catch-all route to return index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Connect to the SQLite database


async function open() {
  console.log('open called')

  /*
 db = await sqlite.open({ filename: './timetable.sqlite3' , driver: sqlite3.Database}, (err) => {
      console.log(err)
      })
  console.log(db)
*/
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
  open()
});
