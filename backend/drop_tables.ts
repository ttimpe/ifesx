
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'test.sqlite3',
    logging: false
});

async function drop() {
    try {
        await sequelize.authenticate();
        console.log('Dropping tables...');
        await sequelize.query('DROP TABLE IF EXISTS REC_LID_VERLAUF');
        await sequelize.query('DROP TABLE IF EXISTS LID_VERLAUF'); // Drop old one too if exists
        await sequelize.query('DROP TABLE IF EXISTS REC_LID');
        console.log('Tables dropped.');
    } catch (e) {
        console.error('Error:', e);
    }
}

drop();
