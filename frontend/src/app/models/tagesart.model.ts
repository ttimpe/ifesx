// VDV 452 - Tagesart, MENGE_TAGESART (290)
export class Tagesart {
  // UUID für DB Internal
  id!: string;

  // VDV 452 Keys
  BASIS_VERSION!: number; // PK
  TAGESART_NR!: number;   // PK
  TAGESART_TEXT?: string;

  // Aliases for backward compatibility (Optional, can be removed after full migration)
  get tagesart_nr(): number { return this.TAGESART_NR; }
  set tagesart_nr(value: number) { this.TAGESART_NR = value; }

  get tagesart_text(): string | undefined { return this.TAGESART_TEXT; }
  set tagesart_text(value: string | undefined) { this.TAGESART_TEXT = value; }
}
