
import { RecOrt } from './src/models/VDV/RecOrt';
import { BasisVersion } from './src/models/VDV/BasisVersion';
import { RecHp } from './src/models/VDV/RecHp';
import { Sequelize } from 'sequelize-typescript';

// Adjust path to models if needed. Run with ts-node.

// Initialize Sequelize (mock or real connection needed)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './data/timetable.sqlite3', // Correct path
    models: [RecOrt, BasisVersion, RecHp]
});

async function check() {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        const ort = await RecOrt.findOne({
            where: {
                ORT_NR: 1066,
                // ONR_TYP_NR: 1, // Default in model, but good to be explicit
                // BASIS_VERSION: 1 // Default
            }
        });

        if (ort) {
            console.log("FOUND DUPLICATE:", JSON.stringify(ort.toJSON(), null, 2));
        } else {
            console.log("No duplicate found for ORT_NR 1066.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

check();
