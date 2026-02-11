import { Request, Response } from 'express';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecLid } from '../models/VDV/RecLid';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecOrt } from '../models/VDV/RecOrt';
import { RecSel } from '../models/VDV/RecSel';
import { Op } from 'sequelize';

/**
 * Controller for REC_FRT (Fahrten / Trips)
 * VDV 452 compliant
 */
export class RecFrtController {

    // Helper: Enrich trips with Line Names, Start/End Stops (Name + IDs) and Arrival Time
    private async enrichTrips(trips: RecFrt[], basisVersion: number): Promise<any[]> {
        if (!trips.length) return [];

        // 1. Extract Unique Line/Variant keys and Areas (Bereich)
        const variantKeys = new Set<string>();
        const bereichNrs = new Set<number>();
        trips.forEach(t => {
            if (t.LI_NR && t.STR_LI_VAR) {
                variantKeys.add(`${t.LI_NR}|${t.STR_LI_VAR}`);
            }
            if (t.BEREICH_NR) bereichNrs.add(t.BEREICH_NR);
        });
        if (bereichNrs.size === 0) bereichNrs.add(1); // Default

        const uniqueKeys = Array.from(variantKeys);
        if (uniqueKeys.length === 0) return trips;

        const orCondition = uniqueKeys.map(k => {
            const [li, varId] = k.split('|');
            return { LI_NR: parseInt(li, 10), STR_LI_VAR: varId };
        });

        // 2. Fetch RecLid for Line Names
        const lids = await RecLid.findAll({
            where: {
                BASIS_VERSION: basisVersion,
                [Op.or]: orCondition
            }
        });

        // 3. Fetch Stops for Logic (End)
        const allVariantStops = await LidVerlauf.findAll({
            attributes: ['LI_NR', 'STR_LI_VAR', 'LI_LFD_NR', 'ORT_NR', 'AUSSTEIGEVERBOT'],
            where: {
                BASIS_VERSION: basisVersion,
                [Op.or]: orCondition,
            },
            order: [['LI_LFD_NR', 'ASC']] // Sort ASC for segment iteration
        });

        // Group Stops by Variant
        const groupedStops = new Map<string, LidVerlauf[]>();
        const allOrtNrs = new Set<number>();

        allVariantStops.forEach(s => {
            const key = `${s.LI_NR}|${s.STR_LI_VAR}`;
            if (!groupedStops.has(key)) groupedStops.set(key, []);
            groupedStops.get(key)!.push(s);
            allOrtNrs.add(s.ORT_NR);
        });

        // 4. Fetch RecSel (Travel Times) for relevant Areas and Stops
        const sels = await RecSel.findAll({
            attributes: ['BEREICH_NR', 'ORT_NR', 'SEL_ZIEL', 'SEL_FZT'],
            where: {
                BASIS_VERSION: basisVersion,
                BEREICH_NR: Array.from(bereichNrs),
                ORT_NR: Array.from(allOrtNrs),
                SEL_ZIEL: Array.from(allOrtNrs)
            }
        });

        // Map: BEREICH|FROM|TO -> Time
        const selMap = new Map<string, number>();
        sels.forEach(s => {
            const key = `${s.BEREICH_NR}|${s.ORT_NR}|${s.SEL_ZIEL}`;
            selMap.set(key, s.SEL_FZT || 0);
        });

        // Calculate Duration per (Variant + Bereich)
        const variantDurationMap = new Map<string, number>(); // KEY: LI|VAR|BEREICH

        // Check if we have any travel time data
        const hasRecSelData = selMap.size > 0;
        const AVG_SECONDS_PER_STOP = 90; // Fallback: average 1.5 min per stop

        groupedStops.forEach((stops, varKey) => {
            // stops is sorted ASC
            for (const bNr of bereichNrs) {
                let totalTime = 0;

                if (hasRecSelData) {
                    // Use actual RecSel data
                    for (let i = 0; i < stops.length - 1; i++) {
                        const from = stops[i].ORT_NR;
                        const to = stops[i + 1].ORT_NR;
                        const segKey = `${bNr}|${from}|${to}`;
                        totalTime += selMap.get(segKey) || AVG_SECONDS_PER_STOP; // Fallback per segment
                    }
                } else {
                    // No RecSel data - estimate based on stop count
                    totalTime = (stops.length - 1) * AVG_SECONDS_PER_STOP;
                }

                variantDurationMap.set(`${varKey}|${bNr}`, totalTime);
            }

            // Note: RecSel might store aggregated times or single hops? 
            // VDV: REC_SEL is per hop (Ort -> Ort_Z).
        });


        // 5. Ends Map (Physical/Revenue)
        const endsMap = new Map<string, { physical: LidVerlauf, revenue: LidVerlauf }>();

        groupedStops.forEach((stops, key) => {
            // stops is ASC, so last is last
            const physical = stops[stops.length - 1];
            let revenue = physical;
            // Search backwards for AUSSTEIGEVERBOT
            for (let i = stops.length - 1; i >= 0; i--) {
                if (!stops[i].AUSSTEIGEVERBOT) {
                    revenue = stops[i];
                    break;
                }
            }
            endsMap.set(key, { physical, revenue });
        });

        // 6. Gather all OrtNrs to fetch Names (Fetch ALL to find correct destination match)
        const allOrtNrsSet = new Set<number>();
        groupedStops.forEach(stops => {
            stops.forEach(s => allOrtNrsSet.add(s.ORT_NR));
        });
        // Add from endsMap just in case (though they should be in groupedStops)
        endsMap.forEach(e => {
            allOrtNrsSet.add(e.physical.ORT_NR);
            allOrtNrsSet.add(e.revenue.ORT_NR);
        });

        const orts = await RecOrt.findAll({
            where: {
                BASIS_VERSION: basisVersion,
                ORT_NR: Array.from(allOrtNrsSet)
            }
        });

        const ortMap = new Map<number, RecOrt>();
        orts.forEach(o => ortMap.set(o.ORT_NR, o));

        const lidMap = new Map<string, RecLid>();
        lids.forEach(l => lidMap.set(`${l.LI_NR}|${l.STR_LI_VAR}`, l));


        // 7. Attach to result
        return trips.map(t => {
            const key = `${t.LI_NR}|${t.STR_LI_VAR}`;
            const stops = groupedStops.get(key);
            const lid = lidMap.get(key);
            const endInfo = endsMap.get(key);

            const startOrtNr = stops && stops.length ? stops[0].ORT_NR : undefined;
            const startOrt = startOrtNr ? ortMap.get(startOrtNr) : undefined;

            const destOrtNr = endInfo ? endInfo.physical.ORT_NR : undefined;
            const destOrt = destOrtNr ? ortMap.get(destOrtNr) : undefined;

            const revenueDestOrtNr = endInfo ? endInfo.revenue.ORT_NR : undefined;
            const revenueDestOrt = revenueDestOrtNr ? ortMap.get(revenueDestOrtNr) : undefined;

            // Intelligent Display Destination Logic
            // Support both standard hyphen and en-dash (used in VDV)
            let displayDestName = revenueDestOrt ? revenueDestOrt.ORT_NAME : (destOrt ? destOrt.ORT_NAME : undefined);
            let displayDestOrtNr = revenueDestOrtNr || destOrtNr;

            if (lid && lid.LIDNAME && stops) {
                // Split by any common separator: " – " (en-dash), " — " (em-dash), " - " (hyphen-space)
                const parts = lid.LIDNAME.split(/\s*[\u2013\u2014-]\s*/);
                if (parts.length > 1) {
                    const targetName = parts[parts.length - 1].trim().toLowerCase();

                    // Search stops for the BEST match (closest to the end of the route)
                    for (let i = stops.length - 1; i >= 0; i--) {
                        const stopOrt = ortMap.get(stops[i].ORT_NR);
                        if (stopOrt && stopOrt.ORT_NAME.toLowerCase().includes(targetName)) {
                            displayDestName = stopOrt.ORT_NAME;
                            displayDestOrtNr = stops[i].ORT_NR;
                            break;
                        }
                    }
                }
            }

            // Arrival
            const bereich = t.BEREICH_NR || 1;
            const durKey = `${key}|${bereich}`;
            const duration = variantDurationMap.get(durKey) || 0;
            const arrival = (t.FRT_START || 0) + duration;

            const plain = t.get({ plain: true });

            return {
                ...plain,
                LIN_NAME: lid ? lid.LIDNAME : undefined,
                LI_KUERZEL: lid ? lid.LI_KUERZEL : undefined,

                START_STOP_NAME: startOrt ? startOrt.ORT_NAME : undefined,
                START_ORT_NR: startOrtNr,
                START_REF_ORT_NR: startOrt ? startOrt.ORT_REF_ORT : undefined,

                DEST_STOP_NAME: destOrt ? destOrt.ORT_NAME : undefined,
                DEST_ORT_NR: destOrtNr,
                DEST_REF_ORT_NR: destOrt ? destOrt.ORT_REF_ORT : undefined,

                DISPLAY_DEST_STOP_NAME: displayDestName || (destOrt ? destOrt.ORT_NAME : undefined),
                DISPLAY_DEST_ORT_NR: displayDestOrtNr,

                FRT_ANKUNFT: arrival
            };
        });
    }

    // Get all trips
    getAll = async (req: Request, res: Response) => {
        try {
            const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : undefined;

            const where: any = {};
            if (basisVersion) where.BASIS_VERSION = basisVersion;

            const trips = await RecFrt.findAll({
                where,
                order: [['FRT_START', 'ASC']],
                limit: 1000 // Limit for performance
            });

            if (trips.length > 0) {
                // Group by BASIS_VERSION and enrich each group
                const byVersion = new Map<number, RecFrt[]>();
                trips.forEach(t => {
                    const ver = t.BASIS_VERSION;
                    if (!byVersion.has(ver)) byVersion.set(ver, []);
                    byVersion.get(ver)!.push(t);
                });

                const enrichedAll: any[] = [];
                for (const [ver, verTrips] of byVersion) {
                    const enriched = await this.enrichTrips(verTrips, ver);
                    enrichedAll.push(...enriched);
                }

                // Re-sort after merging
                enrichedAll.sort((a, b) => (a.FRT_START || 0) - (b.FRT_START || 0));
                res.json(enrichedAll);
            } else {
                res.json([]);
            }
        } catch (error) {
            console.error('Error fetching trips:', error);
            res.status(500).json({ error: 'Failed to fetch trips' });
        }
    }

    // Get trips by Umlauf (UM_UID)
    getByUmlauf = async (req: Request, res: Response) => {
        try {
            const umUid = parseInt(req.params.umUid);
            const tagesartNr = req.query.tagesartNr ? parseInt(req.query.tagesartNr as string) : undefined;

            // Need basisVersion? It's not in params for this route probably, but should be derived or passed.
            // RecFrt has composite key, finding by Uid might return mix of basisVersions? 
            // Usually Umlauf is specific to valid period. 
            // Let's grab the first one to determine basis version or just assume we need to enrich all.
            // But my enrichTrips takes basisVersion.

            const where: any = { UM_UID: umUid };
            if (tagesartNr) where.TAGESART_NR = tagesartNr;

            const trips = await RecFrt.findAll({
                where,
                order: [['FRT_START', 'ASC']]
            });

            if (trips.length > 0) {
                // Assuming all trips in one umlauf belong to same basis version generally, 
                // but safely: group by version? 
                // Simple approach: Use version of first trip.
                const version = trips[0].BASIS_VERSION;
                const enriched = await this.enrichTrips(trips, version);
                res.json(enriched);
            } else {
                res.json([]);
            }
        } catch (error: any) {
            console.error('Error fetching trips by umlauf:', error);
            res.status(500).json({ error: `Failed to fetch trips: ${error.message}` });
        }
    }

    // Get orphan trips (UM_UID is null)
    getOrphanTrips = async (req: Request, res: Response) => {
        try {
            const basisVersion = parseInt(req.query.basisVersion as string);
            if (!basisVersion) {
                return res.status(400).json({ error: 'basisVersion required' });
            }

            const where: any = {
                BASIS_VERSION: basisVersion,
                [Op.or]: [
                    { UM_UID: null },
                    { UM_UID: 0 }
                ]
            };

            if (req.query.liNr) where.LI_NR = parseInt(req.query.liNr as string);
            if (req.query.tagesartNr) where.TAGESART_NR = parseInt(req.query.tagesartNr as string);

            const trips = await RecFrt.findAll({
                where,
                order: [['FRT_START', 'ASC']]
            });

            const enriched = await this.enrichTrips(trips, basisVersion);
            res.json(enriched);
        } catch (error) {
            console.error('Error fetching orphan trips:', error);
            res.status(500).json({ error: 'Failed to fetch orphan trips' });
        }
    }

    // Get single trip by composite key
    getByCompositeKey = async (req: Request, res: Response) => {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);

            const trip = await RecFrt.findOne({
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });

            if (!trip) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.json(trip);
        } catch (error) {
            console.error('Error fetching trip:', error);
            res.status(500).json({ error: 'Failed to fetch trip' });
        }
    }

    // Create new trip
    create = async (req: Request, res: Response) => {
        try {
            const trip = await RecFrt.create(req.body);
            res.status(201).json(trip);
        } catch (error) {
            console.error('Error creating trip:', error);
            res.status(500).json({ error: 'Failed to create trip' });
        }
    }

    // Update trip by composite key
    update = async (req: Request, res: Response) => {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);

            const [updated] = await RecFrt.update(req.body, {
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });

            if (!updated) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.json({ message: 'Trip updated' });
        } catch (error) {
            console.error('Error updating trip:', error);
            res.status(500).json({ error: 'Failed to update trip' });
        }
    }

    // Delete trip by composite key
    delete = async (req: Request, res: Response) => {
        try {
            const basisVersion = parseInt(req.params.basisVersion);
            const frtFid = parseInt(req.params.frtFid);

            const deleted = await RecFrt.destroy({
                where: { BASIS_VERSION: basisVersion, FRT_FID: frtFid }
            });

            if (!deleted) {
                return res.status(404).json({ error: 'Trip not found' });
            }
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting trip:', error);
            res.status(500).json({ error: 'Failed to delete trip' });
        }
    }

    // Get next available FRT_FID for a given BASIS_VERSION
    getNextFrtFid = async (req: Request, res: Response) => {
        try {
            const basisVersion = parseInt(req.params.basisVersion || '1');

            const maxFrt = await RecFrt.findOne({
                where: { BASIS_VERSION: basisVersion },
                order: [['FRT_FID', 'DESC']]
            });

            const nextFid = maxFrt ? (maxFrt.FRT_FID || 0) + 1 : 1;
            res.json({ nextFrtFid: nextFid });
        } catch (error) {
            console.error('Error getting next FRT_FID:', error);
            res.status(500).json({ error: 'Failed to get next FRT_FID' });
        }
    }
}
