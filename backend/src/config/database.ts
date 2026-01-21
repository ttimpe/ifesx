import { Sequelize } from 'sequelize-typescript';
import { RecLid } from '../models/VDV/RecLid';
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

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_FILE || 'timetable.sqlite3',
    models: [
        RecLid, RecZnr, BasisVersion, Tagesart, Betriebstag,
        BasisVersionGueltigkeit, RecAnr, RecOrt, RecHp, LidVerlauf, RecUeb,
        UebFzt, RecUmlauf, RecFrt, RecUms, RecSel, MengeFzgTyp, Fahrzeug, RecOm,
        MengeBereich, MengeFgr, MengeFahrtart, MengeBhof, RecSelFztFeld, Einzelanschluss
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
