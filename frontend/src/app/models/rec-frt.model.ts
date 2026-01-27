export class RecFrt {
    BASIS_VERSION!: number;
    FRT_FID!: number;
    FRT_START?: number;
    LI_NR?: number;
    UM_UID?: number;
    FAHRTART_NR?: number;
    TAGESART_NR?: number;
    FGR_NR?: number;
    STR_LI_VAR?: string;
    ZUGNR?: number;
    LI_KU_NR?: number; // Linienkursnummer
    BEREICH_NR?: number; // Fahrzeitgruppe
    FRT_ANKUNFT?: number; // Calculated Arrival Time

    // Enriched fields from backend
    LIN_NAME?: string;
    LI_KUERZEL?: string;

    START_STOP_NAME?: string;
    START_ORT_NR?: number;
    START_REF_ORT_NR?: number; // Parent station

    DEST_STOP_NAME?: string;
    DEST_ORT_NR?: number;
    DEST_REF_ORT_NR?: number; // Added for Orphan Logic

    // Display fields (Revenue End vs Technical End)
    DISPLAY_DEST_STOP_NAME?: string;
    DISPLAY_DEST_ORT_NR?: number;
}
