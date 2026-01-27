
import { initDB } from './config/database';
import { RecFrt } from './models/VDV/RecFrt';
import { RecLid } from './models/VDV/RecLid';
import { Op } from 'sequelize';
import path from 'path';

// Fix DB Path
process.env.DB_FILE = path.resolve(__dirname, '../../data/timetable.sqlite3');

const run = async () => {
    try {
        await initDB();

        console.log('Checking RecLid for LI_NR=1...');
        const lids = await RecLid.findAll({ where: { LI_NR: 1 } });
        console.log(`Found ${lids.length} variants for Line 1.`);
        lids.forEach(l => console.log(`- Var ${l.STR_LI_VAR}: ${l.LIDNAME}`));

        console.log('Searching for ALL trips for Line 1...');

        const trips = await RecFrt.findAll({
            where: {
                LI_NR: 1
            },
            order: [['FRT_START', 'ASC']]
        });

        console.log(`Found ${trips.length} trips for Line 1.`);

        const totalTrips = await RecFrt.count();
        console.log(`Total Trips in DB: ${totalTrips}`);

        if (trips.length > 0) {
            console.log('--- First 10 Trips ---');
            for (const t of trips.slice(0, 10)) {
                printTrip(t);
            }

            console.log('--- Last 5 Trips ---');
            for (const t of trips.slice(-5)) {
                printTrip(t);
            }

            // Check specifically for 4:19 (15540) or 28:19 (101940)
            const targetTime = 15540;
            const secondaryTarget = 101940;

            const match = trips.find(t => Math.abs((t.FRT_START || 0) - targetTime) < 300);
            if (match) {
                console.log('FOUND close match for 4:19:');
                printTrip(match);
            } else {
                console.log('NO match found close to 4:19 (approx 15540s).');
            }

            const match2 = trips.find(t => Math.abs((t.FRT_START || 0) - secondaryTarget) < 300);
            if (match2) {
                console.log('FOUND close match for 28:19:');
                printTrip(match2);
            }
        }

    } catch (e) {
        console.error(e);
    }
};

async function printTrip(t: RecFrt) {
    const start = t.FRT_START || 0;
    const h = Math.floor(start / 3600);
    const m = Math.floor((start % 3600) / 60);
    const s = start % 60;
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    // Fetch variant name
    const lid = await RecLid.findOne({
        where: {
            LI_NR: t.LI_NR,
            STR_LI_VAR: t.STR_LI_VAR,
            BASIS_VERSION: t.BASIS_VERSION
        }
    });

    console.log(`FID: ${t.FRT_FID} | Time: ${timeStr} (${start}) | Var: ${t.STR_LI_VAR} | Name: ${lid?.LIDNAME || '?'} | Tagesart: ${t.TAGESART_NR} | UM_UID: ${t.UM_UID}`);
}

run();
