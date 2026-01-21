import { RecHp } from "./rec-hp.model";

export class RecOrt {
    ORT_NR!: number;
    ONR_TYP_NR!: number;
    ORT_NAME!: string;
    ORT_REF_ORT?: number;
    ORT_REF_ORT_TYP?: number;
    ORT_REF_ORT_LangNr?: number;
    ORT_REF_ORT_KUERZEL?: string;
    ORT_REF_ORT_NAME?: string;
    ZONE_WABE_NR?: number;
    ORT_POS_LAENGE?: number;
    ORT_POS_BREITE?: number;
    ORT_POS_HOEHE?: number;
    ORT_RICHTUNG?: number;
    HAST_NR_LOKAL?: number;
    HST_NR_NATIONAL?: number;
    HST_NR_INTERNATIONAL?: string;
    BASIS_VERSION!: number;

    // Associations
    recHps?: RecHp[];
    subOrts?: RecOrt[];
    parentOrt?: RecOrt;
    subOrtCount?: number; // Virtual field from backend
}
