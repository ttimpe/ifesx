// VDV 452 - REC_SEL (Netzrelation / Selektion)
export class RecSel {
    // VDV 452 Keys & Attributes
    BASIS_VERSION!: number;
    BEREICH_NR!: number; // e.g. Domain/Area ID

    ONR_TYP_NR!: number; // Start Type
    ORT_NR!: number;     // Start ID

    SEL_ZIEL!: number;     // Target ID (ORT_NR)
    SEL_ZIEL_TYP!: number; // Target Type (ONR_TYP_NR)

    SEL_LAENGE?: number; // Distance in meters
    SEL_FZT?: number;    // Travel time

    FGR_NR?: number;     // Fahrtgruppe

    // Enriched from Backend (names from REC_ORT join)
    ORT_NAME?: string;
    SEL_ZIEL_NAME?: string;
}

