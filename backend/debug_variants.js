const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: '../data/timetable.sqlite3', logging: false });
const RecOrt = sequelize.define('RecOrt', {
    ORT_NR: { type: DataTypes.INTEGER, primaryKey: true },
    ORT_NAME: { type: DataTypes.STRING }
}, { tableName: 'REC_ORT', timestamps: false });
const LidVerlauf = sequelize.define('LidVerlauf', {
    LI_NR: { type: DataTypes.INTEGER, primaryKey: true },
    STR_LI_VAR: { type: DataTypes.STRING, primaryKey: true },
    LI_LFD_NR: { type: DataTypes.INTEGER, primaryKey: true },
    ORT_NR: { type: DataTypes.INTEGER },
}, { tableName: 'LID_VERLAUF', timestamps: false });

async function check() {
    const lohs = await RecOrt.findAll({ where: { ORT_NAME: { [Op.like]: '%Lohmannshof%' } } });
    if (!lohs.length) { console.log('No Lohmannshof found'); return; }

    const ids = lohs.map(l => l.ORT_NR);
    console.log('Lohmannshof IDs:', ids);

    const variants = await LidVerlauf.findAll({
        attributes: ['LI_NR', 'STR_LI_VAR'],
        where: { ORT_NR: ids, LI_NR: 4 },
        group: ['LI_NR', 'STR_LI_VAR']
    });
    console.log('Variants going to ANY Lohmannshof:', variants.map(v => v.STR_LI_VAR));
}
check();
