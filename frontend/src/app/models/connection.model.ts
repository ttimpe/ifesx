import { RecOrt } from "./rec-ort.model";

export interface RecUms {
    BASIS_VERSION: number;
    EINAN_NR?: number;
    TAGESART_NR: number;
    UMS_BEGINN: number;
    UMS_ENDE: number;
    UMS_MIN: number;
    UMS_MAX: number;
    MAX_VERZ_MAN?: number;
    MAX_VERZ_AUTO?: number;
}

export interface Einzelanschluss {
    BASIS_VERSION: number;
    EINAN_NR?: number; // Optional on create
    ANSCHLUSS_NAME?: string;
    ANSCHLUSS_GRUPPE?: string;
    LEITSTELLENKENNUNG: number; // Def 0

    // Zubringer
    ZUB_LI_NR: number;
    ZUB_LI_RI_NR: number;
    ZUB_ORT_REF_ORT: number;
    ZUB_ONR_TYP_NR?: number;
    ZUB_ORT_NR?: number;
    VON_ORT_REF_ORT?: number;

    // Abbringer
    ABB_LI_NR: number;
    ABB_LI_RI_NR: number;
    ABB_ORT_REF_ORT: number;
    ABB_ONR_TYP_NR?: number;
    ABB_ORT_NR?: number;
    NACH_ORT_REF_ORT?: number;

    ASBID?: string;

    // Relations
    recUms?: RecUms[];

    // UI Helpers (optional, for displaying names manually joined)
    zubStopName?: string;
    abbStopName?: string;

    zubLineName?: string;
    abbLineName?: string;
}
