import { Route } from "./route.model"

export class RecLid {
  // VDV 452 Keys & Attributes (Strict)
  BASIS_VERSION!: number; // PK
  LI_NR!: number;         // PK
  STR_LID!: string;       // VDV: LI_KUERZEL
  STR_LI_VAR!: string;    // VDV: PK Variant


  ROUTEN_NR?: number;
  LI_RI_NR?: number;
  BEREICH_NR?: number;
  LI_KUERZEL?: string;    // VDV: Short Line Name (was STR_LID)
  LIN_NAME?: string;

  LINIEN_CODE?: number;
  LIDNAME?: string;       // VDV: Name of Line/Variant


  // Additional/Legacy properties (mapped or kept for UI)
  LIN_FARBE: string = '#00ff00';      // UI specific
  LIN_TEXT_FARBE: string = '#000000'; // UI specific

  // Aliases/Getters for convenience (aligning with previous RecLid if needed)
  get LID_NR(): number { return this.LI_NR; }
  set LID_NR(v: number) { this.LI_NR = v; }

  // Removed Aliases for STR_LID and LIN_NAME as they are now the primary fields


  // Helpers
  get displayName(): string {
    return `${this.STR_LI_VAR} (${this.LIDNAME || 'Standard'})`;
  }

  // Relations
  routes: Route[] = [] // Note: Route type might need update too
}
