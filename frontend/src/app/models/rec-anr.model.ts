export class RecAnr {
    ANR_NR!: number; // PK
    ANR_TEXT!: string;
    ANR_KURZEL?: string;
    ANR_DATEI?: string;
    BASIS_VERSION!: number; // PK
    // Helper/Display
    selected?: boolean;
}
