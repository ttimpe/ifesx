
import { Sequelize, Table, Column, Model, DataType, PrimaryKey, ForeignKey } from 'sequelize-typescript';
import { Op } from 'sequelize';

// Define minimal models for the script
@Table({ tableName: 'stop_information', timestamps: false })
class StopInformation extends Model {
    @Column(DataType.STRING)
    stop_id!: string;

    @Column(DataType.STRING)
    code!: string;
}

@Table({ tableName: 'REC_ORT', timestamps: false })
class RecOrt extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
    ORT_NR!: number;

    @PrimaryKey
    @Column(DataType.INTEGER)
    ONR_TYP_NR!: number;

    @Column(DataType.STRING)
    ORT_REF_ORT_KUERZEL?: string;

    @PrimaryKey
    @Column(DataType.INTEGER)
    BASIS_VERSION!: number;
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'test.sqlite3',
    models: [StopInformation, RecOrt],
    logging: false
});

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const stopInfos = await StopInformation.findAll();
        console.log(`Found ${stopInfos.length} stop infos.`);

        let updated = 0;

        for (const info of stopInfos) {
            if (!info.code) continue;

            // Extract ORT_NR from stop_id (de:GKZ:ORT_NR...)
            const parts = info.stop_id.split(':');
            if (parts.length < 3) continue;

            const ortNrStr = parts[2].replace(/_Parent$/, ''); // Handle _Parent suffix if present in parts (though usually split handles it if delimiter is used correctly, but regex safety helps)
            // Actually split(':') on "de:05711:5052_Parent" -> [de, 05711, 5052_Parent]
            // parseFloat/Int handles '5052_Parent' -> 5052

            const ortNr = parseInt(parts[2], 10);
            if (isNaN(ortNr)) continue;

            // Update RecOrt
            const recOrt = await RecOrt.findOne({ where: { ORT_NR: ortNr, ONR_TYP_NR: 1 } });
            if (recOrt) {
                if (recOrt.ORT_REF_ORT_KUERZEL !== info.code) {
                    recOrt.ORT_REF_ORT_KUERZEL = info.code;
                    // Ensure it is not overwritten by GKZ or number.
                    // User reported numbers. If I see number, I overwrite.
                    await recOrt.save();
                    updated++;
                }
            }
        }

        console.log(`Updated ${updated} RecOrt entries.`);

    } catch (error) {
        console.error(error);
    }
}

run();
