import { RecHp } from "./rec-hp.model";

export class LidVerlauf {
    BASIS_VERSION!: number; // Primary key
    LI_LFD_NR!: number; // Primary key
    LI_NR!: number; // Primary key
    STR_LI_VAR!: string; // Primary key

    ONR_TYP_NR!: number;
    ORT_NR!: number;
    HALTEPUNKT_NR!: number;

    ZNR_NR?: number;
    ANR_NR?: number;

    // Flags
    EINFANGBEREICH?: number;
    LI_KNOTEN?: boolean;
    PRODUKTIV?: boolean;
    EINSTEIGEVERBOT?: boolean;
    AUSSTEIGEVERBOT?: boolean;
    INNERORTSVERBOT?: boolean;
    BEDARFSHALT?: boolean;

    // Joined data
    stop?: RecHp;
    ort?: any; // RecOrt
}
