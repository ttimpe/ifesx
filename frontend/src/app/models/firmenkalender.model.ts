export class Firmenkalender {
    BASIS_VERSION!: number;   // PK
    BETRIEBSTAG!: number;     // PK, Format: YYYYMMDD
    TAGESART_NR!: number;     // FK to Tagesart
    BETRIEBSTAG_TEXT?: string;
}
