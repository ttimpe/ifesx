// VDV 452 - Betriebstag, FIRMENKALENDER
import { Tagesart } from "./tagesart.model"

// VDV 452 - FIRMENKALENDER
export class Betriebstag {
  // UUID für DB Internal
  id!: string;

  // VDV 452 Keys
  BASIS_VERSION!: number;   // PK
  BETRIEBSTAG!: number;     // PK, Format: YYYYMMDD
  TAGESART_NR!: number;     // FK to Tagesart
  BETRIEBSTAG_TEXT?: string;

  // Aliases for backward compatibility
  get betriebstag(): number { return this.BETRIEBSTAG; }
  set betriebstag(value: number) { this.BETRIEBSTAG = value; }

  get text(): string | undefined { return this.BETRIEBSTAG_TEXT; }
  set text(value: string | undefined) { this.BETRIEBSTAG_TEXT = value; }

  get tagesart_nr(): number { return this.TAGESART_NR; }
  set tagesart_nr(value: number) { this.TAGESART_NR = value; }
}
