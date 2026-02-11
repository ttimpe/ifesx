import { Sequelize } from 'sequelize-typescript';
import { RecLid } from '../models/VDV/RecLid';
import { RecSelZp } from '../models/VDV/RecSelZp';
import { RecZnr } from '../models/VDV/RecZnr';
import { BasisVersion } from '../models/VDV/BasisVersion';
import { Tagesart } from '../models/VDV/Tagesart';
import { Betriebstag } from '../models/VDV/Betriebstag';
import { BasisVersionGueltigkeit } from '../models/VDV/BasisVersionGueltigkeit';
import { RecAnr } from '../models/VDV/RecAnr';
import { RecOrt } from '../models/VDV/RecOrt';
import { RecHp } from '../models/VDV/RecHp';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecUeb } from '../models/VDV/RecUeb';
import { UebFzt } from '../models/VDV/UebFzt';
import { RecUmlauf } from '../models/VDV/RecUmlauf';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecUms } from '../models/VDV/RecUms';
import { RecSel } from '../models/VDV/RecSel';
import { MengeFzgTyp } from '../models/VDV/MengeFzgTyp';
import { Fahrzeug } from '../models/VDV/Fahrzeug';
import { RecOm } from '../models/VDV/RecOm';
import { MengeBereich } from '../models/VDV/MengeBereich';
import { MengeFgr } from '../models/VDV/MengeFgr';
import { MengeFahrtart } from '../models/VDV/MengeFahrtart';
import { MengeBhof } from '../models/VDV/MengeBhof';
import { RecSelFztFeld } from '../models/VDV/RecSelFztFeld';
import { Einzelanschluss } from '../models/VDV/Einzelanschluss';
import { MengeDienststueckart } from '../models/VDV/MengeDienststueckart';
import { RecDienststueck } from '../models/VDV/RecDienststueck';
import { RecEinzeldienst } from '../models/VDV/RecEinzeldienst';
import { MengeDienstart } from '../models/VDV/MengeDienstart';

import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_FILE || 'data/timetable.sqlite3';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    console.log(`[Database] Directory ${dbDir} does not exist. Creating...`);
    fs.mkdirSync(dbDir, { recursive: true });
}

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    models: [
        RecLid, RecZnr, BasisVersion, Tagesart, Betriebstag,
        BasisVersionGueltigkeit, RecAnr, RecOrt, RecHp, LidVerlauf, RecUeb,
        UebFzt, RecUmlauf, RecFrt, RecUms, RecSel, MengeFzgTyp, Fahrzeug, RecOm,
        MengeBereich, MengeFgr, MengeFahrtart, MengeBhof, RecSelFztFeld, Einzelanschluss,
        MengeDienststueckart, RecDienststueck, RecEinzeldienst, MengeDienstart, RecSelZp
    ],
    logging: console.log
});

export const initDB = async () => {
    await sequelize.sync({
        alter: {
            drop: false
        }
    });
};
