
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { LidVerlauf } from './models/VDV/LidVerlauf';
import { RecOrt } from './models/VDV/RecOrt';
import { RecLid } from './models/VDV/RecLid';
import { RecHp } from './models/VDV/RecHp';
import { BasisVersion } from './models/VDV/BasisVersion';
import path from 'path';

// Adjust path to your DB
const storage = path.resolve(__dirname, '../../data/timetable.sqlite3');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storage,
    logging: false,
    models: [LidVerlauf, RecOrt, RecLid, BasisVersion, RecHp]
});

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');


        // Debug Line 1
        const lids = await RecLid.findAll({
            where: {
                LI_NR: 1
            }
        });

        console.log(`Line 1 has ${lids.length} variants.`);
        lids.forEach(l => console.log(` - Var ${l.STR_LI_VAR}: ${l.LIDNAME}`));

        const targetVar = '003';
        console.log(`\nAnalyzing Variant ${targetVar}...`);

        const stops = await LidVerlauf.findAll({
            where: {
                LI_NR: 1,
                STR_LI_VAR: targetVar
            },
            include: [RecOrt],
            order: [['LI_LFD_NR', 'ASC']] // ASC order
        });

        console.log(`Found ${stops.length} stops for Var ${targetVar}.`);
        for (const s of stops) {
            const name = s.ort ? s.ort.ORT_NAME : 'Unknown';
            const extra = s.ort ? s.ort.ORT_REF_ORT_NAME : '';
            console.log(`Seq: ${s.LI_LFD_NR}, OrtNr: ${s.ORT_NR}, Name: ${name} (${extra}), Entry: ${!s.EINSTEIGEVERBOT}, Exit: ${!s.AUSSTEIGEVERBOT}`);
        }


    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

run();
