import { Sequelize } from "sequelize-typescript";
import { QueryTypes } from "sequelize";
import { RecOrt } from "../models/VDV/RecOrt";
import { RecHp } from "../models/VDV/RecHp";
import { Stop } from "../models/Stop";
import { StopInformation } from "../models/StopInformation";
import { RouteStop } from "../models/RouteStop";
import { StopTime } from "../models/StopTime";
import { Trip } from "../models/Trip";
import { Route } from "../models/Route";
import { Line } from "../models/Line";
import { Announcement } from "../models/Announcement";
import { Destination } from "../models/Destination";
import { BasisVersion } from "../models/VDV/BasisVersion";
import { RecAnr } from "../models/VDV/RecAnr";
import { RecZnr } from "../models/VDV/RecZnr";
import { RecLid } from "../models/VDV/RecLid";
import { VehicleSchedule } from "../models/VehicleSchedule";
import { StopDistance } from "../models/StopDistance";
import { SpecialCharacter } from "../models/SpecialCharacter";

import { LidVerlauf } from "../models/VDV/LidVerlauf";
import { RecUeb } from "../models/VDV/RecUeb";
import { UebFzt } from "../models/VDV/UebFzt";
import { RecUmlauf } from "../models/VDV/RecUmlauf";
import { RecFrt } from "../models/VDV/RecFrt";
import { RecUms } from "../models/VDV/RecUms";
import { RecSel } from "../models/VDV/RecSel";
import { RecOm } from "../models/VDV/RecOm";
import { MengeBereich } from "../models/VDV/MengeBereich";
import { RecSelFztFeld } from "../models/VDV/RecSelFztFeld";
import { RecFzgTyp } from "../models/VDV/RecFzgTyp";
import { RecFzg } from "../models/VDV/RecFzg";
import { BasisVersionGueltigkeit } from "../models/VDV/BasisVersionGueltigkeit";
import { Tagesart } from "../models/VDV/Tagesart";
import { Betriebstag } from "../models/VDV/Betriebstag";
import { StopInformation as StopInfoModel } from "../models/StopInformation"; // Alias to avoid confusion if needed, but imported above

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './test.sqlite3',
    models: [
        RecOrt, RecHp, Stop, StopInformation, RouteStop, StopTime, Trip, Route, Line,
        Announcement, Destination, BasisVersion, RecAnr, RecZnr, RecLid, VehicleSchedule,
        StopDistance, SpecialCharacter, LidVerlauf, RecUeb, UebFzt, RecUmlauf,
        RecFrt, RecUms, RecSel, RecOm, MengeBereich, RecSelFztFeld, RecFzgTyp, RecFzg,
        BasisVersionGueltigkeit, Tagesart, Betriebstag
    ],
    logging: false
});

async function migrateVDVHierarchy() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // 0. Ensure tables exist & Clear
        await RecOrt.sync({ force: true });
        await RecHp.sync({ force: true });

        console.log("Fetching Stops and Info...");
        const stops = await sequelize.query("SELECT * FROM stops", { type: QueryTypes.SELECT });
        const stopInfos = await sequelize.query("SELECT stop_id, code FROM stop_information", { type: QueryTypes.SELECT });

        const codeMap = new Map<string, string>();
        stopInfos.forEach((info: any) => {
            if (info.stop_id && info.code) {
                codeMap.set(info.stop_id, info.code);
            }
        });

        console.log(`Processing ${stops.length} stops...`);

        const parentMap = new Map<number, any>();
        const subPlaceMap = new Map<string, any>();
        const channelMap = new Map<string, number>();

        for (const stop of (stops as any[])) {
            const parts = (stop.id as string).split(':');
            if (parts.length < 3) continue;

            const placeId = parseInt(parts[2]);
            // Handle LocID
            let locId = (parts.length > 3 && parts[3] !== '') ? parseInt(parts[3]) : 0;
            if (isNaN(locId)) locId = 0;
            // Handle MastID
            let mastId = (parts.length > 4 && parts[4] !== '') ? parseInt(parts[4]) : (locId > 0 ? locId : 1);
            if (isNaN(mastId)) mastId = 1;

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
                if (locId > 0) channelMap.set(`${placeId}:${locId}`, subPlaceNr);
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
        await RecOrt.bulkCreate(Array.from(parentMap.values()));
        await RecOrt.bulkCreate(Array.from(subPlaceMap.values()));
        console.log(`Migrated ${parentMap.size} Parents and ${subPlaceMap.size} Sub-Places.`);

        // RecHp Creation
        const hpSet = new Set<string>();
        const hpList: any[] = [];

        for (const stop of (stops as any[])) {
            const parts = (stop.id as string).split(':');
            if (parts.length < 3) continue;
            const placeId = parseInt(parts[2]);
            if (isNaN(placeId)) continue;
            let locId = (parts.length > 3 && parts[3] !== '') ? parseInt(parts[3]) : 0;
            if (isNaN(locId)) locId = 0;
            let mastId = (parts.length > 4 && parts[4] !== '') ? parseInt(parts[4]) : (locId > 0 ? locId : 1);
            if (isNaN(mastId)) mastId = 1;

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

        await RecHp.bulkCreate(hpList);
        console.log(`Migrated ${hpList.length} Stop Points.`);

        // Phase 3: Update LidVerlauf
        console.log("Updating LidVerlauf relations...");
        const lidItems = await sequelize.query("SELECT * FROM LID_VERLAUF", { type: QueryTypes.SELECT });

        let updatedLidCount = 0;
        let missingLinks = 0;

        for (const item of (lidItems as any[])) {
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
                    await sequelize.query(
                        `UPDATE LID_VERLAUF SET ORT_NR = ${newOrt}, HALTEPUNKT_NR = ${newMastId} WHERE LI_NR = ${lidNr} AND LI_LFD_NR = ${lidLfdNr} AND STR_LI_VAR = '${strLiVar}'`
                    );
                    updatedLidCount++;
                } else {
                    // Already correct
                }
            } else {
                missingLinks++;
            }
        }

        console.log(`Updated ${updatedLidCount} LidVerlauf rows. Missing mappings: ${missingLinks}.`);

        // ========================================
        // 4. UPDATE REC_SEL: Parent IDs → SubPlace IDs
        // ========================================
        console.log("\n=== Phase 4: Updating REC_SEL with SubPlace IDs ===");

        const recSelEntries: any[] = await sequelize.query("SELECT * FROM REC_SEL", { type: QueryTypes.SELECT });
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
            const subPlacePairs: any[] = await sequelize.query(`
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
            `, { type: QueryTypes.SELECT });

            if (subPlacePairs.length > 0) {
                const bestPair = subPlacePairs[0];
                await sequelize.query(`
                    UPDATE REC_SEL 
                    SET ORT_NR = ${bestPair.source_subplace}, 
                        SEL_ZIEL = ${bestPair.target_subplace}
                    WHERE ORT_NR = ${parentSource} 
                      AND SEL_ZIEL = ${parentTarget}
                      AND BASIS_VERSION = ${entry.BASIS_VERSION}
                `, { type: QueryTypes.UPDATE });

                console.log(`  Updated: ${parentSource}→${parentTarget} to ${bestPair.source_subplace}→${bestPair.target_subplace} (used ${bestPair.usage_count} times)`);
                updatedRecSelCount++;
            } else {
                console.log(`  ⚠️  No SubPlace pair found for ${parentSource}→${parentTarget}, keeping as-is`);
                skippedRecSelCount++;
            }
        }

        console.log(`\nREC_SEL Migration Complete:`);
        console.log(`  - Updated: ${updatedRecSelCount} entries`);
        console.log(`  - Skipped (already SubPlace or no mapping): ${skippedRecSelCount}`);

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await sequelize.close();
    }
}

migrateVDVHierarchy();
