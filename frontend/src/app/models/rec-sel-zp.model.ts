export class RecSelZp {
    BASIS_VERSION!: number;
    BEREICH_NR!: number;
    ONR_TYP_NR!: number;
    ORT_NR!: number;
    SEL_ZIEL!: number;
    SEL_ZIEL_TYP!: number;
    ZP_ONR!: number;
    ZP_TYP!: number;
    SEL_ZP_LAENGE?: number;
    ZP_LFD_NR?: number;

    // Virtual
    zpOrt?: any; // RecOrt
}
