"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SpecialCharacter_1 = require("./models/SpecialCharacter");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const sequelize_typescript_1 = require("sequelize-typescript");
const Stop_1 = require("./models/Stop");
const Route_1 = require("./models/Route");
const RecFzgTyp_1 = require("./models/VDV/RecFzgTyp");
const RecFzg_1 = require("./models/VDV/RecFzg");
const VehicleController_1 = require("./controllers/VehicleController");
const Line_1 = require("./models/Line");
const RouteStop_1 = require("./models/RouteStop");
const Destination_1 = require("./models/Destination");
const importController_1 = __importDefault(require("./controllers/importController"));
const StopInformation_1 = require("./models/StopInformation");
const stopController_1 = require("./controllers/stopController");
const DestinationController_1 = require("./controllers/DestinationController");
const LineController_1 = require("./controllers/LineController");
const Announcement_1 = require("./models/Announcement");
const AnnouncementController_1 = require("./controllers/AnnouncementController");
const SpecialCharacterController_1 = require("./controllers/SpecialCharacterController");
const VehicleSchedule_1 = require("./models/VehicleSchedule");
const Trip_1 = require("./models/Trip");
const ScheduleController_1 = require("./controllers/ScheduleController");
const StopTime_1 = require("./models/StopTime");
const StopDistance_1 = require("./models/StopDistance");
const NetworkController_1 = require("./controllers/NetworkController");
const CalendarController_1 = require("./controllers/CalendarController");
const Tagesart_1 = require("./models/VDV/Tagesart");
const Betriebstag_1 = require("./models/VDV/Betriebstag");
const BasisVersion_1 = require("./models/VDV/BasisVersion");
const BasisVersionGueltigkeit_1 = require("./models/VDV/BasisVersionGueltigkeit");
const RecZnr_1 = require("./models/VDV/RecZnr");
const RecLid_1 = require("./models/VDV/RecLid");
const RecLidVerlauf_1 = require("./models/VDV/RecLidVerlauf");
const RecAnr_1 = require("./models/VDV/RecAnr");
const RecOrt_1 = require("./models/VDV/RecOrt");
const RecHp_1 = require("./models/VDV/RecHp");
const DataController_1 = require("./controllers/DataController");
const LidVerlauf_1 = require("./models/VDV/LidVerlauf");
const RecUeb_1 = require("./models/VDV/RecUeb");
const UebFzt_1 = require("./models/VDV/UebFzt");
const RecUmlauf_1 = require("./models/VDV/RecUmlauf");
const RecFrt_1 = require("./models/VDV/RecFrt");
const RecUms_1 = require("./models/VDV/RecUms");
const RecSel_1 = require("./models/VDV/RecSel");
const RecOm_1 = require("./models/VDV/RecOm");
const MengeBereich_1 = require("./models/VDV/MengeBereich");
const RecSelFztFeld_1 = require("./models/VDV/RecSelFztFeld");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const app = (0, express_1.default)();
const port = 3000;
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)()); // Enable CORS for all routes
app.use('/import', importController_1.default);
const stopRouter = express_1.default.Router();
const stopController = new stopController_1.StopController();
stopRouter.post('/migrate', stopController.migrateStops);
stopRouter.put('/:id', stopController.updateStop);
stopRouter.get('/', stopController.getStops);
stopRouter.get('/:id', stopController.getStopById);
stopRouter.get('/search/:query', stopController.getStopsByCode);
stopRouter.get('/find/:query', stopController.searchStopsByName);
app.use('/stops', stopRouter);
const RecAnrController_1 = require("./controllers/RecAnrController");
const RecUebController_1 = require("./controllers/RecUebController");
const RecUmlaufController_1 = require("./controllers/RecUmlaufController");
const RecSelController_1 = require("./controllers/RecSelController");
const RecOmController_1 = require("./controllers/RecOmController");
const RecFrtController_1 = require("./controllers/RecFrtController");
const MengeBereichController_1 = require("./controllers/MengeBereichController");
const vdvRouter = express_1.default.Router();
const recAnrController = new RecAnrController_1.RecAnrController();
const vehicleController = new VehicleController_1.VehicleController();
vdvRouter.get('/orte', stopController.getAllRecOrts);
vdvRouter.get('/orte/:ortNr', stopController.getRecOrtById);
vdvRouter.put('/orte/:ortNr', stopController.updateRecOrt);
const recUebController = new RecUebController_1.RecUebController();
const recUmlaufController = new RecUmlaufController_1.RecUmlaufController();
const recSelController = new RecSelController_1.RecSelController();
const recOmController = new RecOmController_1.RecOmController();
const recFrtController = new RecFrtController_1.RecFrtController();
const mengeBereichController = new MengeBereichController_1.MengeBereichController();
// RecAnr Routes
vdvRouter.get('/anschluss', recAnrController.getAll);
vdvRouter.get('/anschluss/:id', recAnrController.getById);
vdvRouter.post('/anschluss', recAnrController.create);
vdvRouter.put('/anschluss/:id', recAnrController.update);
vdvRouter.delete('/anschluss/:id', recAnrController.delete);
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
// RecUms Routes
vdvRouter.get('/block-pieces', recUmlaufController.getAllUms);
// RecFrt (Trips) Routes
vdvRouter.get('/rec-frt', recFrtController.getAll);
vdvRouter.get('/rec-frt/by-umlauf/:umUid', recFrtController.getByUmlauf);
vdvRouter.get('/rec-frt/next-fid/:basisVersion', recFrtController.getNextFrtFid);
vdvRouter.get('/rec-frt/:basisVersion/:frtFid', recFrtController.getByCompositeKey);
vdvRouter.post('/rec-frt', recFrtController.create);
vdvRouter.put('/rec-frt/:basisVersion/:frtFid', recFrtController.update);
vdvRouter.delete('/rec-frt/:basisVersion/:frtFid', recFrtController.delete);
// RecSel Routes
vdvRouter.get('/rec-sel', recSelController.getAll);
vdvRouter.post('/rec-sel', recSelController.create);
vdvRouter.post('/rec-sel/migrate', recSelController.migrateStopDistances);
vdvRouter.get('/rec-sel/:ortNr/:selZiel', recSelController.getByCompositeKey);
vdvRouter.put('/rec-sel/:ortNr/:selZiel', recSelController.updateByCompositeKey);
vdvRouter.delete('/rec-sel/:ortNr/:selZiel', recSelController.deleteByCompositeKey);
// Travel Time Matrix (RecSelFztFeld)
vdvRouter.get('/rec-sel-fzt-feld/by-bereich/:bereichNr', recSelController.getFztByBereich);
vdvRouter.post('/rec-sel-fzt-feld', recSelController.updateFzt);
// Vehicles
vdvRouter.get('/rec-fzg-typ', vehicleController.getAllTypes);
vdvRouter.post('/rec-fzg-typ', vehicleController.createType);
vdvRouter.get('/rec-fzg', vehicleController.getAllVehicles);
vdvRouter.post('/rec-fzg', vehicleController.createVehicle);
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
// Tagesart (MENGE_TAGESART)
const TagesartController_1 = require("./controllers/TagesartController");
const tagesartController = new TagesartController_1.TagesartController();
vdvRouter.get('/tagesart', tagesartController.getAll);
vdvRouter.get('/tagesart/:id', tagesartController.getById);
app.use('/vdv', vdvRouter);
// Initialize Sequelize
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: 'test.sqlite3',
    models: [Line_1.Line, Route_1.Route, Stop_1.Stop, StopTime_1.StopTime, Trip_1.Trip, VehicleSchedule_1.VehicleSchedule, RouteStop_1.RouteStop, Announcement_1.Announcement, Destination_1.Destination, SpecialCharacter_1.SpecialCharacter, StopInformation_1.StopInformation, RecLid_1.RecLid, RecLidVerlauf_1.RecLidVerlauf, RecZnr_1.RecZnr, BasisVersion_1.BasisVersion, Tagesart_1.Tagesart, Betriebstag_1.Betriebstag, BasisVersionGueltigkeit_1.BasisVersionGueltigkeit, RecAnr_1.RecAnr, RecOrt_1.RecOrt, RecHp_1.RecHp, LidVerlauf_1.LidVerlauf, RecUeb_1.RecUeb, UebFzt_1.UebFzt, RecUmlauf_1.RecUmlauf, RecFrt_1.RecFrt, RecUms_1.RecUms, RecSel_1.RecSel, RecFzgTyp_1.RecFzgTyp, RecFzg_1.RecFzg, RecOm_1.RecOm, MengeBereich_1.MengeBereich, RecSelFztFeld_1.RecSelFztFeld, StopDistance_1.StopDistance],
    logging: console.log
});
/*
Route.addHook('beforeUpdate', async (route: Route, options) => {
  console.log('beforeUpdate hook called')
  if (route.stops) {
    console.log('i got stops')
    const existingStops = await RouteStop.findAll({ where: { route_id: route.id} });
    const existingStopIds = existingStops.map((stop: RouteStop) => stop.id);
    const updatedStopIds = route.stops.map((stop: RouteStop) => stop.id);
    console.log('existing rs ids', existingStopIds)
    console.log('updated rs ids', updatedStopIds)
    const stopsToRemove = existingStopIds.filter(id => !updatedStopIds.includes(id));

    if (stopsToRemove.length > 0) {
      console.log('got stops to remove')
      await RouteStop.destroy({
        where: {
          id: stopsToRemove
        },
        transaction: options.transaction
      });
    }
  }
});
*/
sequelize.sync({
    alter: {
        drop: false
    }
});
const destinationRouter = express_1.default.Router();
const destinationController = new DestinationController_1.DestinationController();
destinationRouter.get('/', destinationController.getAllDestinations);
destinationRouter.get('/:id', destinationController.getDestinationById);
destinationRouter.put('/:id', destinationController.updateDestination);
destinationRouter.post('/migrate', destinationController.migrateDestinations);
destinationRouter.post('/', destinationController.createDestination);
app.use('/destinations', destinationRouter);
const lineRouter = express_1.default.Router();
const lineController = new LineController_1.LineController();
lineRouter.get('/', lineController.getAllLines);
lineRouter.get('/variants', lineController.getLineVariants);
lineRouter.get('/variant-stops', lineController.getVariantStops); // New Route
lineRouter.post('/migrate', lineController.migrateNetwork);
lineRouter.post('/cleanup', lineController.cleanupStops);
lineRouter.get('/:id', lineController.getLineById);
lineRouter.put('/:id', lineController.updateLine);
lineRouter.post('/:lineId/routes', lineController.createRoute);
lineRouter.put('/:lineId/routes/:routeId', lineController.updateRoute);
lineRouter.delete('/:lineId/routes/:routeId', lineController.deleteRoute);
lineRouter.get('/:lineId/routes', lineController.getRoutesByLine);
lineRouter.get('/:lineId/routes/:routeId', lineController.getRoute);
app.use('/lines', lineRouter);
const announcementRouter = express_1.default.Router();
const announcementController = new AnnouncementController_1.AnnouncementController();
announcementRouter.get('/', announcementController.getAllAnnoucements);
announcementRouter.post('/migrate', announcementController.migrateAnnouncements);
announcementRouter.get('/files', announcementController.getAllAnnouncementFiles);
announcementRouter.get('/:id', announcementController.getAnnouncementById);
announcementRouter.put('/:id', announcementController.updateAnnouncement);
announcementRouter.post('/', announcementController.createAnnouncement);
announcementRouter.delete('/:id', announcementController.deleteAnnouncement);
app.use('/announcements', announcementRouter);
const specialCharacterRouter = express_1.default.Router();
const specialCharacterController = new SpecialCharacterController_1.SpecialCharacterController();
specialCharacterRouter.get('/', specialCharacterController.getAllSpecialCharacters);
specialCharacterRouter.get('/:id', specialCharacterController.getSpecialCharacterById);
specialCharacterRouter.put('/:id', specialCharacterController.updateSpecialCharacter);
specialCharacterRouter.post('/', specialCharacterController.createSpecialCharacter);
app.use('/specialCharacters', specialCharacterRouter);
const scheduleRouter = express_1.default.Router();
const scheduleController = new ScheduleController_1.ScheduleController(sequelize);
scheduleRouter.get('/', scheduleController.getAllSchedules);
scheduleRouter.get('/:id', scheduleController.getScheduleById);
scheduleRouter.put('/:id', (req, res) => {
    return scheduleController.updateSchedule(req, res);
});
scheduleRouter.post('/', scheduleController.createSchedule);
scheduleRouter.get('/:scheduleId/trips', scheduleController.getTripsForSchedule);
scheduleRouter.post('/:id/trips', scheduleController.createTripForSchedule);
scheduleRouter.put('/:scheduleId/trips/:tripId', scheduleController.updateTripForSchedule);
scheduleRouter.get('/:scheduleId/trips/:tripId', scheduleController.getTripById);
scheduleRouter.delete('/:scheduleId/trips/:tripId', scheduleController.deleteTripForSchedule);
scheduleRouter.get('/:scheduleId/printout', scheduleController.getPrintout);
app.use('/schedules', scheduleRouter);
const networkRouter = express_1.default.Router();
const networkController = new NetworkController_1.NetworkController();
networkRouter.get('/distances', networkController.getAllStopDistances);
networkRouter.put('/distances', networkController.updateStopDistance);
networkRouter.post('/distances', networkController.createStopDistance);
app.use('/network', networkRouter);
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
app.use('/calendar', calendarRouter);
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
app.use('/basis', versionRouter);
const KursblattController_1 = require("./controllers/KursblattController");
const kursblattController = new KursblattController_1.KursblattController();
app.get('/kursblatt/:id/pdf', (req, res) => kursblattController.generatePdf(req, res));
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
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    open();
});
