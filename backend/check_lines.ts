
import { Sequelize } from 'sequelize-typescript';
import { RecLid } from './src/models/VDV/RecLid';
import { BasisVersion } from './src/models/VDV/BasisVersion';
import { RecZnr } from './src/models/VDV/RecZnr';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'test.sqlite3',
    models: [RecLid, BasisVersion, RecZnr],
    logging: false
});

async function check() {
    try {
        await sequelize.authenticate();
        const count = await RecLid.count();
        console.log(`RecLid Count: ${count}`);
        const rows = await RecLid.findAll();
        rows.forEach(r => console.log(JSON.stringify(r.toJSON())));
    } catch (e) {
        console.error(e);
    }
}

check();
