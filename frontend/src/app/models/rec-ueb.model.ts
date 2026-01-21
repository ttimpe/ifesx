export class UebFzt {
    BASIS_VERSION!: number;
    BEREICH_NR!: number;
    FGR_NR!: number;
    TAGESART_NR!: number;
    ONR_TYP_NR!: number;
    ORT_NR!: number;
    UEB_ZIEL_TYP!: number;
    UEB_ZIEL!: number;
    UEB_FAHRZEIT!: number;
}

export class RecUeb {
    BASIS_VERSION!: number;
    BEREICH_NR!: number;
    ONR_TYP_NR!: number;
    ORT_NR!: number;
    UEB_ZIEL_TYP!: number;
    UEB_ZIEL!: number;
    UEB_LAENGE?: number;

    uebFzts?: UebFzt[];
}
