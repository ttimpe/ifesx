import { RecFrt } from './rec-frt.model';

export class RecUmlauf {
    BASIS_VERSION!: number;
    TAGESART_NR!: number;
    UM_UID!: number;
    ANF_ORT?: number;
    ANF_ONR_TYP?: number;
    END_ORT?: number;
    END_ONR_TYP?: number;
    FZG_TYP_NR?: number;

    trips?: RecFrt[];
}
