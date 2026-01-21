// VDV 452 - LID_VERLAUF
import { Stop } from "./stop.model";

export class RouteStop {
  // UUID for internal use
  id!: number;

  // VDV 452 Keys & Attributes
  BASIS_VERSION!: number;
  LI_NR!: number;         // FK to RecLid
  STR_LI_VAR!: string;    // FK to RecLid
  LI_LFD_NR!: number;     // Sequence Number

  ONR_TYP_NR!: number;    // Location Type
  ORT_NR!: number;        // Location Number

  // Attributes
  LI_KNOTEN?: boolean;
  EINSTEIGEVERBOT?: boolean;
  AUSSTEIGEVERBOT?: boolean;

  // Relations
  stop?: Stop;

  // Aliases for backward compatibility
  get sequence_number(): number { return this.LI_LFD_NR; }
  set sequence_number(v: number) { this.LI_LFD_NR = v; }

  get stop_id(): string { return `${this.ONR_TYP_NR}:${this.ORT_NR}`; } // Heuristic: old ID was string
  // Note: stop_id setter might be complex if it tries to parse string. Ignoring for now or should implement parsing.

  get line_id(): number { return this.LI_NR; }
  set line_id(v: number) { this.LI_NR = v; }

  get time_relevant(): boolean { return this.LI_KNOTEN || false; }
  set time_relevant(v: boolean) { this.LI_KNOTEN = v; }
}
