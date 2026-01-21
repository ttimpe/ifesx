import { RouteStop } from "./route-stop.model"

// VDV 452 - REC_FRT_HZT (Fahrt-Haltestellen-Zeit)
export class StopTime {
  // UUID for internal use
  id?: number;

  // VDV 452 Keys & Attributes
  // VDV 452 - REC_FRT_HZT
  FRT_FID!: number;
  ORT_NR!: number;
  ANKUNFT!: number; // Seconds from day start
  ABFAHRT!: number; // Seconds from day start

  // Relations
  stop?: RouteStop; // Helper relation to display stop name in UI
  // Aliases
  get arrivalTime(): string { return this.secondsToTime(this.ANKUNFT); }
  set arrivalTime(v: string | number) { this.ANKUNFT = this.timeToSeconds(v); }

  get departureTime(): string { return this.secondsToTime(this.ABFAHRT); }
  set departureTime(v: string | number) { this.ABFAHRT = this.timeToSeconds(v); }

  get route_stop_id(): number { return this.ORT_NR; } // Approximation

  private secondsToTime(secs: number): string {
    if (secs === undefined || secs === null || isNaN(secs)) return '';
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private timeToSeconds(v: string | number): number {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    const parts = v.split(':');
    return (+parts[0]) * 3600 + (+parts[1]) * 60;
  }
}
