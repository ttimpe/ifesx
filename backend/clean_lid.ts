
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

async function clean() {
    try {
        await sequelize.authenticate();
        console.log('Truncating RecLid...');
        await RecLid.destroy({ where: {}, truncate: true });
        console.log('RecLid truncated.');
    } catch (e) {
        console.error('Error:', e);
    }
}

clean();
