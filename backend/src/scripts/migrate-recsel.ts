import { Sequelize } from 'sequelize-typescript';
import { StopDistance } from '../models/StopDistance';
import { RecHp } from '../models/VDV/RecHp';
import { RecSel } from '../models/VDV/RecSel';
import { RecOrt } from '../models/VDV/RecOrt';
import { BasisVersion } from '../models/VDV/BasisVersion';
import { Stop } from '../models/Stop';
import { StopInformation } from '../models/StopInformation';
import { Announcement } from '../models/Announcement';
import { RouteStop } from '../models/RouteStop';
import { Route } from '../models/Route';
import { Line } from '../models/Line';
import { Trip } from '../models/Trip';
import { Destination } from '../models/Destination';
import { VehicleSchedule } from '../models/VehicleSchedule';
import { StopTime } from '../models/StopTime';
import { SpecialCharacter } from '../models/SpecialCharacter';
import { RecLid } from '../models/VDV/RecLid';

import { RecZnr } from '../models/VDV/RecZnr';
import { Tagesart } from '../models/VDV/Tagesart';
import { Betriebstag } from '../models/VDV/Betriebstag';
import { BasisVersionGueltigkeit } from '../models/VDV/BasisVersionGueltigkeit';
import { RecAnr } from '../models/VDV/RecAnr';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecUeb } from '../models/VDV/RecUeb';
import { UebFzt } from '../models/VDV/UebFzt';
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecUms } from '../models/VDV/RecUms';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'test.sqlite3', // Matches app.ts
    models: [
        Line, Route, Stop, StopTime, Trip, VehicleSchedule, RouteStop, Announcement, Destination, SpecialCharacter, StopInformation,
        RecLid, RecZnr, BasisVersion, Tagesart, Betriebstag, BasisVersionGueltigkeit, RecAnr, RecOrt, RecHp,
        LidVerlauf, RecUeb, UebFzt, RecUmlauf, RecFrt, RecUms, RecSel, StopDistance
    ],
    logging: false
});

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync RecSel to ensure table exists
        await RecSel.sync();

        console.log('Starting Migration: StopDistances -> RecSel');
        const distances = await StopDistance.findAll();
        let count = 0;
        let skipped = 0;

        for (const dist of distances) {
            // 1. Resolve Origin DHID -> ORT_NR
            const originHp = await RecHp.findOne({ where: { DHID: dist.origin_stop_id } });
            // 2. Resolve Dest DHID -> ORT_NR
            const destHp = await RecHp.findOne({ where: { DHID: dist.destination_stop_id } });

            if (originHp && destHp) {
                // Check if exists
                const exists = await RecSel.findOne({
                    where: {
                        ORT_NR: originHp.ORT_NR,
                        SEL_ZIEL: destHp.ORT_NR,
                        ONR_TYP_NR: originHp.ONR_TYP_NR,
                        SEL_ZIEL_TYP: destHp.ONR_TYP_NR,
                        BASIS_VERSION: 1
                    }
                });

                if (!exists) {
                    await RecSel.create({
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
                } else {
                    // Update?
                    exists.SEL_LAENGE = Math.round(dist.distance);
                    if (dist.time) exists.SEL_FZT = dist.time;
                    await exists.save();
                    console.log(`Updated: ${dist.origin_stop_id} -> ${dist.destination_stop_id}`);
                    count++;
                }
            } else {
                console.warn(`Skipping distance ${dist.origin_stop_id} -> ${dist.destination_stop_id}: DHID lookup failed (Origin: ${!!originHp}, Dest: ${!!destHp})`);
                skipped++;
            }
        }

        console.log(`Migration completed. Processed: ${count}, Skipped: ${skipped}`);

    } catch (e) {
        console.error('Migration Error:', e);
    }
}

migrate();
