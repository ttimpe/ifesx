import { RecOrt } from "./rec-ort.model";

// VDV 452 - REC_OM (Ortsmarke)
export class RecOm {
    id?: number; // Backend ID

    // VDV 452 Keys & Attributes
    BASIS_VERSION!: number;
    OM_NR!: number; // Added missing VDV Key
    ONR_TYP_NR!: number;
    ORT_NR!: number; // FK to RecOrt

    ORM_KUERZEL?: string;
    ORMACODE?: number;
    ORM_TEXT?: string;

    // Helper Relation
    ort?: RecOrt;
}
