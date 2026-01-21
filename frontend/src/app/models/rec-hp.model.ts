import { RecOrt } from "./rec-ort.model";

export class RecHp {
    ORT_NR!: number;
    HALTEPUNKT_NR!: number;
    ONR_TYP_NR!: number;
    ZUSATZ_INFO?: string;
    DHID!: string;
    BASIS_VERSION!: number;

    recOrt?: RecOrt;
}
