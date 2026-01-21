import { RecLid } from "./line.model"
import { Route } from "./route.model"
import { StopTime } from "./stop-time.model"

// VDV 452 - REC_FRT (Fahrt)
export class Trip {
  // UUID for internal use/legacy
  id?: number; // Might map to FRT_FID if unique integer

  // VDV 452 Keys & Attributes
  BASIS_VERSION!: number;
  FRT_FID!: number;       // Fahrt-ID
  FRT_START!: number;     // Abfahrtszeit in Sekunden ab Tagesbeginn

  LI_NR!: number;         // Reference to RecLid
  STR_LI_VAR!: string;    // Reference to RecLid variant
  TAGESART_NR!: number;   // Reference to Tagesart

  FAHRTART_NR?: number;
  FGR_NR?: number;        // Fahrtgruppen-Nr
  UM_UID?: number;        // Umlauf-ID
  ZUGNR?: number;         // Zug-Nr / Kurs-Nr ?

  // Relations
  stopTimes: StopTime[] = []; // Will be RecFrtHzt[]
  route?: Route; // Helper for UI selection

  // Legacy/UI helpers
  turnaroundTime: number = 0; // Wendezeit in min?

  // Aliases for backward compatibility
  get courseNumber(): number { return this.ZUGNR || 0; }
  set courseNumber(v: number) { this.ZUGNR = v; }

  get routeId(): number | undefined { return this.FRT_FID; } // Approx mapping

  get route_id(): number | undefined { return this.FRT_FID; }
  set route_id(v: number | undefined) { if (v) this.FRT_FID = v; }

  // Note: departureTime/arrivalTime are usually derived from stopTimes or FRT_START
  get departureTime(): number | undefined { return this.FRT_START; }
  set departureTime(v: number | undefined) { this.FRT_START = v || 0; }
}
