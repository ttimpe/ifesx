"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const sequelize_1 = require("sequelize");
const RecOrt_1 = require("../models/VDV/RecOrt");
const RecHp_1 = require("../models/VDV/RecHp");
const Stop_1 = require("../models/Stop");
const StopInformation_1 = require("../models/StopInformation");
const RouteStop_1 = require("../models/RouteStop");
const StopTime_1 = require("../models/StopTime");
const Trip_1 = require("../models/Trip");
const Route_1 = require("../models/Route");
const Line_1 = require("../models/Line");
const Announcement_1 = require("../models/Announcement");
const Destination_1 = require("../models/Destination");
const BasisVersion_1 = require("../models/VDV/BasisVersion");
const RecAnr_1 = require("../models/VDV/RecAnr");
const RecZnr_1 = require("../models/VDV/RecZnr");
const RecLid_1 = require("../models/VDV/RecLid");
const VehicleSchedule_1 = require("../models/VehicleSchedule");
const StopDistance_1 = require("../models/StopDistance");
const SpecialCharacter_1 = require("../models/SpecialCharacter");
const RecLidVerlauf_1 = require("../models/VDV/RecLidVerlauf");
const LidVerlauf_1 = require("../models/VDV/LidVerlauf");
const RecUeb_1 = require("../models/VDV/RecUeb");
const UebFzt_1 = require("../models/VDV/UebFzt");
const RecUmlauf_1 = require("../models/VDV/RecUmlauf");
const RecFrt_1 = require("../models/VDV/RecFrt");
const RecUms_1 = require("../models/VDV/RecUms");
const RecSel_1 = require("../models/VDV/RecSel");
const RecOm_1 = require("../models/VDV/RecOm");
const MengeBereich_1 = require("../models/VDV/MengeBereich");
const RecSelFztFeld_1 = require("../models/VDV/RecSelFztFeld");
const RecFzgTyp_1 = require("../models/VDV/RecFzgTyp");
const RecFzg_1 = require("../models/VDV/RecFzg");
const BasisVersionGueltigkeit_1 = require("../models/VDV/BasisVersionGueltigkeit");
const Tagesart_1 = require("../models/VDV/Tagesart");
const Betriebstag_1 = require("../models/VDV/Betriebstag");
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'sqlite',
    storage: './test.sqlite3',
    models: [
        RecOrt_1.RecOrt, RecHp_1.RecHp, Stop_1.Stop, StopInformation_1.StopInformation, RouteStop_1.RouteStop, StopTime_1.StopTime, Trip_1.Trip, Route_1.Route, Line_1.Line,
        Announcement_1.Announcement, Destination_1.Destination, BasisVersion_1.BasisVersion, RecAnr_1.RecAnr, RecZnr_1.RecZnr, RecLid_1.RecLid, VehicleSchedule_1.VehicleSchedule,
        StopDistance_1.StopDistance, SpecialCharacter_1.SpecialCharacter, RecLidVerlauf_1.RecLidVerlauf, LidVerlauf_1.LidVerlauf, RecUeb_1.RecUeb, UebFzt_1.UebFzt, RecUmlauf_1.RecUmlauf,
        RecFrt_1.RecFrt, RecUms_1.RecUms, RecSel_1.RecSel, RecOm_1.RecOm, MengeBereich_1.MengeBereich, RecSelFztFeld_1.RecSelFztFeld, RecFzgTyp_1.RecFzgTyp, RecFzg_1.RecFzg,
        BasisVersionGueltigkeit_1.BasisVersionGueltigkeit, Tagesart_1.Tagesart, Betriebstag_1.Betriebstag
    ],
    logging: false
});
async function migrateVDVHierarchy() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        // 0. Ensure tables exist & Clear
        await RecOrt_1.RecOrt.sync({ force: true });
        await RecHp_1.RecHp.sync({ force: true });
        console.log("Fetching Stops and Info...");
        const stops = await sequelize.query("SELECT * FROM stops", { type: sequelize_1.QueryTypes.SELECT });
        const stopInfos = await sequelize.query("SELECT stop_id, code FROM stop_information", { type: sequelize_1.QueryTypes.SELECT });
        const codeMap = new Map();
        stopInfos.forEach((info) => {
            if (info.stop_id && info.code) {
                codeMap.set(info.stop_id, info.code);
            }
        });
        console.log(`Processing ${stops.length} stops...`);
        const parentMap = new Map();
        const subPlaceMap = new Map();
        const channelMap = new Map();
        for (const stop of stops) {
            const parts = stop.id.split(':');
            if (parts.length < 3)
                continue;
            const placeId = parseInt(parts[2]);
            // Handle LocID
            let locId = (parts.length > 3 && parts[3] !== '') ? parseInt(parts[3]) : 0;
            if (isNaN(locId))
                locId = 0;
            // Handle MastID
            let mastId = (parts.length > 4 && parts[4] !== '') ? parseInt(parts[4]) : (locId > 0 ? locId : 1);
            if (isNaN(mastId))
                mastId = 1;
            const regionId = parseInt(parts[1]) || 0;
            const lat = Math.round(stop.latitude * 10000000);
            const lon = Math.round(stop.longitude * 10000000);
            const kuerzel = codeMap.get(stop.id) || null;
            // 1. Parent Place (RecOrt)
            if (!parentMap.has(placeId)) {
                parentMap.set(placeId, {
                    ORT_NR: placeId,
                    ORT_NAME: (stop.name.includes(',') ? stop.name.split(',').slice(1).join(',').trim() : stop.name),
                    ORT_REF_ORT_KUERZEL: kuerzel,
                    ONR_TYP_NR: 1,
                    BASIS_VERSION: 1,
                    ORT_POS_BREITE: lat,
                    ORT_POS_LAENGE: lon,
                    ZONE_WABE_NR: regionId,
                    HAST_NR_LOKAL: placeId
                });
            }
            // 2. Sub-Place (RecOrt)
            // Generate ID: PlaceID * 10000 + MastID
            const subPlaceNr = placeId * 10000 + mastId;
            const subKey = `${placeId}:${subPlaceNr}`;
            if (!subPlaceMap.has(subKey)) {
                subPlaceMap.set(subKey, {
                    ORT_NR: subPlaceNr,
                    ORT_NAME: stop.name,
                    ORT_REF_ORT: placeId,
                    ORT_REF_ORT_KUERZEL: kuerzel,
                    ONR_TYP_NR: 1,
                    BASIS_VERSION: 1,
                    ORT_POS_BREITE: lat,
                    ORT_POS_LAENGE: lon,
                    HAST_NR_LOKAL: placeId
                });
                // Map "Parent:Mast" -> SubPlaceNr for LidVerlauf
                channelMap.set(`${placeId}:${mastId}`, subPlaceNr);
                // Also map legacy "Parent:Loc" if Mast not available? 
                if (locId > 0)
                    channelMap.set(`${placeId}:${locId}`, subPlaceNr);
            }
        }
        // Remove SubPlaces that collide with Parent IDs
        const parentIds = new Set(parentMap.keys());
        for (const [key, sub] of subPlaceMap.entries()) {
            if (parentIds.has(sub.ORT_NR)) {
                console.warn(`Collision detected: SubPlace ${sub.ORT_NR} clashes with Parent Place. Skipping SubPlace generation.`);
                subPlaceMap.delete(key);
            }
        }
        // Phase 2: Insert Data
        await RecOrt_1.RecOrt.bulkCreate(Array.from(parentMap.values()));
        await RecOrt_1.RecOrt.bulkCreate(Array.from(subPlaceMap.values()));
        console.log(`Migrated ${parentMap.size} Parents and ${subPlaceMap.size} Sub-Places.`);
        // RecHp Creation
        const hpSet = new Set();
        const hpList = [];
        for (const stop of stops) {
            const parts = stop.id.split(':');
            if (parts.length < 3)
                continue;
            const placeId = parseInt(parts[2]);
            if (isNaN(placeId))
                continue;
            let locId = (parts.length > 3 && parts[3] !== '') ? parseInt(parts[3]) : 0;
            if (isNaN(locId))
                locId = 0;
            let mastId = (parts.length > 4 && parts[4] !== '') ? parseInt(parts[4]) : (locId > 0 ? locId : 1);
            if (isNaN(mastId))
                mastId = 1;
            const subPlaceNr = placeId * 10000 + mastId;
            const uniqueHpKey = `${subPlaceNr}:${mastId}`;
            if (!hpSet.has(uniqueHpKey)) {
                hpSet.add(uniqueHpKey);
                hpList.push({
                    ORT_NR: subPlaceNr, // Links to Sub-Place
                    HALTEPUNKT_NR: mastId,
                    ONR_TYP_NR: 1,
                    DHID: stop.id,
                    BASIS_VERSION: 1,
                    ZUSATZ_INFO: parts.slice(4).join(':')
                });
            }
        }
        await RecHp_1.RecHp.bulkCreate(hpList);
        console.log(`Migrated ${hpList.length} Stop Points.`);
        // Phase 3: Update LidVerlauf
        console.log("Updating LidVerlauf relations...");
        const lidItems = await sequelize.query("SELECT * FROM LID_VERLAUF", { type: sequelize_1.QueryTypes.SELECT });
        let updatedLidCount = 0;
        let missingLinks = 0;
        for (const item of lidItems) {
            const oldOrt = item.ORT_NR;
            const oldHp = item.HALTEPUNKT_NR;
            const lidNr = item.LI_NR;
            const lidLfdNr = item.LI_LFD_NR;
            const strLiVar = item.STR_LI_VAR;
            let lookupOrt = oldOrt;
            if (oldOrt > 1000000) {
                lookupOrt = Math.floor(oldOrt / 10000);
            }
            const newOrt = channelMap.get(`${lookupOrt}:${oldHp}`);
            if (newOrt) {
                const newMastId = newOrt % 10000;
                // Update if ORT_NR changed OR if HALTEPUNKT_NR is mismatched/stale
                if (newOrt !== oldOrt || oldHp !== newMastId) {
                    await sequelize.query(`UPDATE LID_VERLAUF SET ORT_NR = ${newOrt}, HALTEPUNKT_NR = ${newMastId} WHERE LI_NR = ${lidNr} AND LI_LFD_NR = ${lidLfdNr} AND STR_LI_VAR = '${strLiVar}'`);
                    updatedLidCount++;
                }
                else {
                    // Already correct
                }
            }
            else {
                missingLinks++;
            }
        }
        console.log(`Updated ${updatedLidCount} LidVerlauf rows. Missing mappings: ${missingLinks}.`);
        // ========================================
        // 4. UPDATE REC_SEL: Parent IDs → SubPlace IDs
        // ========================================
        console.log("\n=== Phase 4: Updating REC_SEL with SubPlace IDs ===");
        const recSelEntries = await sequelize.query("SELECT * FROM REC_SEL", { type: sequelize_1.QueryTypes.SELECT });
        console.log(`Found ${recSelEntries.length} REC_SEL entries to process.`);
        let updatedRecSelCount = 0;
        let skippedRecSelCount = 0;
        for (const entry of recSelEntries) {
            const parentSource = entry.ORT_NR;
            const parentTarget = entry.SEL_ZIEL;
            // Both are already SubPlace IDs (>100000), skip
            if (parentSource > 100000 && parentTarget > 100000) {
                skippedRecSelCount++;
                continue;
            }
            // Find most commonly used SubPlace pair in LidVerlauf for this Parent relation
            // Strategy: Find consecutive stops in LidVerlauf where Parent IDs match
            const subPlacePairs = await sequelize.query(`
                SELECT 
                    curr.ORT_NR as source_subplace,
                    next.ORT_NR as target_subplace,
                    COUNT(*) as usage_count
                FROM LID_VERLAUF curr
                JOIN LID_VERLAUF next 
                    ON curr.LI_NR = next.LI_NR 
                    AND curr.STR_LI_VAR = next.STR_LI_VAR
                    AND curr.LI_LFD_NR + 1 = next.LI_LFD_NR
                WHERE 
                    (curr.ORT_NR >= ${parentSource} * 10000 AND curr.ORT_NR < (${parentSource} + 1) * 10000)
                    AND (next.ORT_NR >= ${parentTarget} * 10000 AND next.ORT_NR < (${parentTarget} + 1) * 10000)
                GROUP BY source_subplace, target_subplace
                ORDER BY usage_count DESC
                LIMIT 1
            `, { type: sequelize_1.QueryTypes.SELECT });
            if (subPlacePairs.length > 0) {
                const bestPair = subPlacePairs[0];
                await sequelize.query(`
                    UPDATE REC_SEL 
                    SET ORT_NR = ${bestPair.source_subplace}, 
                        SEL_ZIEL = ${bestPair.target_subplace}
                    WHERE ORT_NR = ${parentSource} 
                      AND SEL_ZIEL = ${parentTarget}
                      AND BASIS_VERSION = ${entry.BASIS_VERSION}
                `, { type: sequelize_1.QueryTypes.UPDATE });
                console.log(`  Updated: ${parentSource}→${parentTarget} to ${bestPair.source_subplace}→${bestPair.target_subplace} (used ${bestPair.usage_count} times)`);
                updatedRecSelCount++;
            }
            else {
                console.log(`  ⚠️  No SubPlace pair found for ${parentSource}→${parentTarget}, keeping as-is`);
                skippedRecSelCount++;
            }
        }
        console.log(`\nREC_SEL Migration Complete:`);
        console.log(`  - Updated: ${updatedRecSelCount} entries`);
        console.log(`  - Skipped (already SubPlace or no mapping): ${skippedRecSelCount}`);
    }
    catch (error) {
        console.error("Migration failed:", error);
    }
    finally {
        await sequelize.close();
    }
}
migrateVDVHierarchy();
