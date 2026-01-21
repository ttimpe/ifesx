import { StopInformation } from "./stop-information.model"

// VDV 452 - REC_HP (Haltepunkt) & REC_ORT (Ort) Aggregation
export class Stop {
  // Internal ID
  id!: string;

  // VDV 452 Keys
  BASIS_VERSION!: number;
  ONR_TYP_NR!: number;
  ORT_NR!: number;
  HALTEPUNKT_NR?: number; // Optional, defaults to 0 or 1 if just Ort

  // Attributes from REC_ORT
  ORT_NAME!: string;
  ORT_REF_ORT_KUERZEL?: string;

  // Visual/Geo
  longitude!: number;
  latitude!: number;

  information!: StopInformation;

  // Aliases
  get name(): string { return this.ORT_NAME; }
  set name(v: string) { this.ORT_NAME = v; }

  // Logic to parse stopType from ONR_TYP_NR or similar?
  get stopType(): number {
    return this.ONR_TYP_NR || 0;
  }
}
