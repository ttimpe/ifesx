"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const StopDistance_1 = require("../models/StopDistance");
const RecHp_1 = require("../models/VDV/RecHp");
const RecSel_1 = require("../models/VDV/RecSel");
const RecOrt_1 = require("../models/VDV/RecOrt");
const BasisVersion_1 = require("../models/VDV/BasisVersion");
const Stop_1 = require("../models/Stop");
const StopInformation_1 = require("../models/StopInformation");
const Announcement_1 = require("../models/Announcement");
const RouteStop_1 = require("../models/RouteStop");
const Route_1 = require("../models/Route");
const Line_1 = require("../models/Line");
const Trip_1 = require("../models/Trip");
const Destination_1 = require("../models/Destination");
const VehicleSchedule_1 = require("../models/VehicleSchedule");
const StopTime_1 = require("../models/StopTime");
const SpecialCharacter_1 = require("../models/SpecialCharacter");
const RecLid_1 = require("../models/VDV/RecLid");
const RecLidVerlauf_1 = require("../models/VDV/RecLidVerlauf");
const RecZnr_1 = require("../models/VDV/RecZnr");
const Tagesart_1 = require("../models/VDV/Tagesart");
const Betriebstag_1 = require("../models/VDV/Betriebstag");
const BasisVersionGueltigkeit_1 = require("../models/VDV/BasisVersionGueltigkeit");
const RecAnr_1 = require("../models/VDV/RecAnr");
const LidVerlauf_1 = require("../models/VDV/LidVerlauf");
const RecUeb_1 = require("../models/VDV/RecUeb");
const UebFzt_1 = require("../models/VDV/UebFzt");
const RecUmlauf_1 = require("../models/VDV/RecUmlauf");
const RecFrt_1 = require("../models/VDV/RecFrt");
const RecUms_1 = require("../models/VDV/RecUms");
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: 'test.sqlite3', // Matches app.ts
    models: [
        Line_1.Line, Route_1.Route, Stop_1.Stop, StopTime_1.StopTime, Trip_1.Trip, VehicleSchedule_1.VehicleSchedule, RouteStop_1.RouteStop, Announcement_1.Announcement, Destination_1.Destination, SpecialCharacter_1.SpecialCharacter, StopInformation_1.StopInformation,
        RecLid_1.RecLid, RecLidVerlauf_1.RecLidVerlauf, RecZnr_1.RecZnr, BasisVersion_1.BasisVersion, Tagesart_1.Tagesart, Betriebstag_1.Betriebstag, BasisVersionGueltigkeit_1.BasisVersionGueltigkeit, RecAnr_1.RecAnr, RecOrt_1.RecOrt, RecHp_1.RecHp,
        LidVerlauf_1.LidVerlauf, RecUeb_1.RecUeb, UebFzt_1.UebFzt, RecUmlauf_1.RecUmlauf, RecFrt_1.RecFrt, RecUms_1.RecUms, RecSel_1.RecSel, StopDistance_1.StopDistance
    ],
    logging: false
});
async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        // Sync RecSel to ensure table exists
        await RecSel_1.RecSel.sync();
        console.log('Starting Migration: StopDistances -> RecSel');
        const distances = await StopDistance_1.StopDistance.findAll();
        let count = 0;
        let skipped = 0;
        for (const dist of distances) {
            // 1. Resolve Origin DHID -> ORT_NR
            const originHp = await RecHp_1.RecHp.findOne({ where: { DHID: dist.origin_stop_id } });
            // 2. Resolve Dest DHID -> ORT_NR
            const destHp = await RecHp_1.RecHp.findOne({ where: { DHID: dist.destination_stop_id } });
            if (originHp && destHp) {
                // Check if exists
                const exists = await RecSel_1.RecSel.findOne({
                    where: {
                        ORT_NR: originHp.ORT_NR,
                        SEL_ZIEL: destHp.ORT_NR,
                        ONR_TYP_NR: originHp.ONR_TYP_NR,
                        SEL_ZIEL_TYP: destHp.ONR_TYP_NR,
                        BASIS_VERSION: 1
                    }
                });
                if (!exists) {
                    await RecSel_1.RecSel.create({
                        BASIS_VERSION: 1,
                        BEREICH_NR: 1, // Default Area
                        ONR_TYP_NR: originHp.ONR_TYP_NR,
                        ORT_NR: originHp.ORT_NR,
                        SEL_ZIEL: destHp.ORT_NR,
                        SEL_ZIEL_TYP: destHp.ONR_TYP_NR,
                        SEL_LAENGE: Math.round(dist.distance),
                        SEL_FZEIT: dist.time || 0,
                        FGR_NR: 1 // Default Group
                    });
                    console.log(`Migrated: ${dist.origin_stop_id} -> ${dist.destination_stop_id}`);
                    count++;
                }
                else {
                    // Update?
                    exists.SEL_LAENGE = Math.round(dist.distance);
                    if (dist.time)
                        exists.SEL_FZT = dist.time;
                    await exists.save();
                    console.log(`Updated: ${dist.origin_stop_id} -> ${dist.destination_stop_id}`);
                    count++;
                }
            }
            else {
                console.warn(`Skipping distance ${dist.origin_stop_id} -> ${dist.destination_stop_id}: DHID lookup failed (Origin: ${!!originHp}, Dest: ${!!destHp})`);
                skipped++;
            }
        }
        console.log(`Migration completed. Processed: ${count}, Skipped: ${skipped}`);
    }
    catch (e) {
        console.error('Migration Error:', e);
    }
}
migrate();
