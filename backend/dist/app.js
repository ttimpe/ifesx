"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const RecAnrController_1 = require("./controllers/RecAnrController");
const RecUebController_1 = require("./controllers/RecUebController");
const RecUmlaufController_1 = require("./controllers/RecUmlaufController");
const RecSelController_1 = require("./controllers/RecSelController");
const RecOmController_1 = require("./controllers/RecOmController");
const RecFrtController_1 = require("./controllers/RecFrtController");
const MengeBereichController_1 = require("./controllers/MengeBereichController");
const VehicleController_1 = require("./controllers/VehicleController");
const stopController_1 = require("./controllers/stopController");
const DestinationController_1 = require("./controllers/DestinationController");
const LineController_1 = require("./controllers/LineController");
const CalendarController_1 = require("./controllers/CalendarController");
const DataController_1 = require("./controllers/DataController");
const ConnectionController_1 = require("./controllers/ConnectionController");
const BhofController_1 = require("./controllers/BhofController");
const VdvImportController_1 = require("./controllers/VdvImportController");
const multer_1 = __importDefault(require("multer"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const app = (0, express_1.default)();
const port = 3000;
// Multer for VDV file uploads
const vdvUpload = (0, multer_1.default)({ dest: 'uploads/' });
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, cors_1.default)()); // Enable CORS for all routes (still useful for dev)
const apiRouter = express_1.default.Router();
apiRouter.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
const stopRouter = express_1.default.Router();
const stopController = new stopController_1.StopController();
const vdvRouter = express_1.default.Router();
const recAnrController = new RecAnrController_1.RecAnrController();
const vehicleController = new VehicleController_1.VehicleController();
const vdvImportController = new VdvImportController_1.VdvImportController();
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
const recUebController = new RecUebController_1.RecUebController();
const recUmlaufController = new RecUmlaufController_1.RecUmlaufController();
const recSelController = new RecSelController_1.RecSelController();
const recOmController = new RecOmController_1.RecOmController();
const recFrtController = new RecFrtController_1.RecFrtController();
const mengeBereichController = new MengeBereichController_1.MengeBereichController();
const bhofController = new BhofController_1.BhofController();
// RecAnr Routes (Ansagetexte)
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
const RecSelZpController_1 = require("./controllers/RecSelZpController");
const recSelZpController = new RecSelZpController_1.RecSelZpController();
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
const TagesartController_1 = require("./controllers/TagesartController");
const tagesartController = new TagesartController_1.TagesartController();
vdvRouter.get('/tagesart', tagesartController.getAll);
vdvRouter.get('/tagesart/:id', tagesartController.getById);
vdvRouter.post('/tagesart/merge', tagesartController.mergeTagesart);
// MengeFgr (Fahrzeitgruppen)
const MengeFgrController_1 = require("./controllers/MengeFgrController");
const mengeFgrController = new MengeFgrController_1.MengeFgrController();
vdvRouter.get('/menge-fgr', mengeFgrController.getAll);
vdvRouter.get('/menge-fgr/:id', mengeFgrController.getById);
vdvRouter.post('/menge-fgr', mengeFgrController.create);
vdvRouter.put('/menge-fgr/:id', mengeFgrController.update);
vdvRouter.delete('/menge-fgr/:id', mengeFgrController.delete);
// MengeFahrtart (Fahrtarten)
const MengeFahrtartController_1 = require("./controllers/MengeFahrtartController");
const mengeFahrtartController = new MengeFahrtartController_1.MengeFahrtartController();
vdvRouter.get('/menge-fahrtart', mengeFahrtartController.getAll);
vdvRouter.get('/menge-fahrtart/:id', mengeFahrtartController.getById);
vdvRouter.post('/menge-fahrtart', mengeFahrtartController.create);
vdvRouter.put('/menge-fahrtart/:id', mengeFahrtartController.update);
vdvRouter.delete('/menge-fahrtart/:id', mengeFahrtartController.delete);
const connectionController = new ConnectionController_1.ConnectionController();
vdvRouter.get('/connections', connectionController.getAll);
vdvRouter.post('/connections', connectionController.create);
vdvRouter.get('/connections/:einanNr', connectionController.getOne);
vdvRouter.put('/connections/:einanNr', connectionController.update);
vdvRouter.delete('/connections/:einanNr', connectionController.delete);
vdvRouter.post('/connections/ums', connectionController.addUms);
vdvRouter.delete('/connections/:einanNr/ums/:tagesartNr/:beginn/:ende', connectionController.deleteUms);
// Duty Roster (VDV 455)
const DutyRosterController_1 = require("./controllers/DutyRosterController");
const dutyRosterController = new DutyRosterController_1.DutyRosterController();
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
const MengeDienstartController_1 = require("./controllers/MengeDienstartController");
const mengeDienstartController = new MengeDienstartController_1.MengeDienstartController();
vdvRouter.get('/planning/dienstart', mengeDienstartController.getAll);
vdvRouter.get('/planning/dienstart/:basisVersion/:id', mengeDienstartController.getById);
vdvRouter.post('/planning/dienstart', mengeDienstartController.create);
vdvRouter.put('/planning/dienstart/:basisVersion/:id', mengeDienstartController.update);
vdvRouter.delete('/planning/dienstart/:basisVersion/:id', mengeDienstartController.delete);
apiRouter.use('/vdv', vdvRouter);
// Initialize Sequelize
// Initialize Sequelize
const database_1 = require("./config/database");
(0, database_1.initDB)();
const destinationRouter = express_1.default.Router();
const destinationController = new DestinationController_1.DestinationController();
destinationRouter.get('/', destinationController.getAllDestinations);
destinationRouter.get('/:id', destinationController.getDestinationById);
destinationRouter.put('/:id', destinationController.updateDestination);
destinationRouter.post('/migrate', destinationController.migrateDestinations);
destinationRouter.post('/', destinationController.createDestination);
apiRouter.use('/destinations', destinationRouter);
const lineRouter = express_1.default.Router();
const lineController = new LineController_1.LineController();
lineRouter.get('/', lineController.getAllLines);
lineRouter.get('/variants', lineController.getLineVariants);
lineRouter.get('/variant-stops', lineController.getVariantStops);
lineRouter.post('/variant-stops', lineController.addVariantStop);
lineRouter.put('/variant-stops', lineController.updateVariantStop);
lineRouter.delete('/variant-stops', lineController.removeVariantStop);
lineRouter.post('/variant-stops/swap', lineController.swapVariantStops);
lineRouter.post('/variants', lineController.createVariant);
lineRouter.put('/variants', lineController.updateVariant);
lineRouter.delete('/variants', lineController.deleteVariant);
lineRouter.get('/:id', lineController.getLineById);
lineRouter.put('/:oldId/change-id', lineController.updateLineIdCascade);
lineRouter.put('/:id', lineController.updateLine);
apiRouter.use('/lines', lineRouter);
const calendarRouter = express_1.default.Router();
const calendarController = new CalendarController_1.CalendarController();
// Tagesarten routes
calendarRouter.get('/tagesarten', calendarController.getTagesarten);
calendarRouter.post('/tagesarten', calendarController.addTagesart);
calendarRouter.put('/tagesarten/:id', calendarController.editTagesart);
calendarRouter.delete('/tagesarten/:id', calendarController.deleteTagesart);
// Betriebstage routes
calendarRouter.get('/betriebstage', calendarController.getBetriebstage);
calendarRouter.post('/betriebstage', calendarController.addBetriebstag);
calendarRouter.put('/betriebstage/:id', calendarController.editBetriebstag);
calendarRouter.delete('/betriebstage/:id', calendarController.deleteBetriebstag);
apiRouter.use('/calendar', calendarRouter);
const versionRouter = express_1.default.Router();
const dataController = new DataController_1.DataController();
versionRouter.get('/versionen', dataController.getBasisVersionen);
versionRouter.post('/versionen', dataController.createBasisVersion);
versionRouter.put('/versionen/:id', dataController.editBasisVersion);
versionRouter.delete('/versionen/:id', dataController.deleteBasisVersion);
// Gueltigkeiten routes
versionRouter.get('/gueltigkeiten', dataController.getGueltigkeiten);
versionRouter.post('/gueltigkeiten', dataController.createGueltigkeit);
versionRouter.delete('/gueltigkeiten/:id', dataController.deleteGueltigkeit);
apiRouter.use('/basis', versionRouter);
const GTFSController_1 = __importDefault(require("./controllers/GTFSController"));
apiRouter.use('/gtfs', GTFSController_1.default);
const KursblattController_1 = require("./controllers/KursblattController");
const kursblattController = new KursblattController_1.KursblattController();
// Prefix with /kursblatt inside apiRouter? No, user path was /kursblatt/:id/pdf.
// So now /api/kursblatt/:id/pdf
const kursblattRouter = express_1.default.Router();
kursblattRouter.get('/:id/pdf', (req, res) => kursblattController.generatePdf(req, res));
apiRouter.use('/kursblatt', kursblattRouter);
// Mount API
app.use('/api', apiRouter);
// Serve Frontend Static Support
// Assuming user will build frontend to 'public' folder in backend root.
const publicPath = path_1.default.join(__dirname, '../public');
app.use(express_1.default.static(publicPath));
// Catch-all route to return index.html for SPA
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(publicPath, 'index.html'));
});
// Connect to the SQLite database
async function open() {
    console.log('open called');
    /*
   db = await sqlite.open({ filename: './timetable.sqlite3' , driver: sqlite3.Database}, (err) => {
        console.log(err)
        })
    console.log(db)
  */
}
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
    open();
});
