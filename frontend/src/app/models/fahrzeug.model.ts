import { MengeFzgTyp } from "./menge-fzg-typ.model";

export interface Fahrzeug {
    BASIS_VERSION: number;
    FZG_NR: number;
    FZG_TYP_NR: number;
    UNTERNEHMEN?: number;
    FZG_TEXT?: string;
    POLKENN?: string;
    FIN?: string;

    // Relation
    type?: MengeFzgTyp;
}
