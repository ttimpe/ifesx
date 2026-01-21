
import { Sequelize } from 'sequelize-typescript';
import { RecLid } from './src/models/VDV/RecLid';
import { BasisVersion } from './src/models/VDV/BasisVersion';
import { RecZnr } from './src/models/VDV/RecZnr';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'test.sqlite3',
    models: [RecLid, BasisVersion, RecZnr],
    logging: console.log
});

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Syncing RecLid...');
        await RecLid.sync({ force: true });
        console.log('RecLid synced.');
    } catch (e) {
        console.error('Error syncing RecLid:', e);
    }
}

run();
