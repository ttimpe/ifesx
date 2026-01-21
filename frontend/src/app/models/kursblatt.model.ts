export interface KursblattTrip {
    FRT_FID: number;
    LI_KU_NR: number;
    FGR_NR: number;
    START_TIME: string; // HH:MM
    DESTINATION: string;
    TIMES: (string | null)[]; // One time per stop in sequence
    WZ_A?: string;
    WZ_E?: string;
    ROUTE_A?: string;
    ROUTE_E?: string;
}

export interface KursblattVariant {
    LI_NR: number;
    LI_KU_NR: number; // For Header
    STR_LI_VAR: string;
    LINE_NAME: string;
    TRANSITION_TEXT: string; // "Weiter als..."
    STOPS: { name: string, abbr: string }[];
    TRIPS: KursblattTrip[];
}
