"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopController = void 0;
const Stop_1 = require("../models/Stop");
const StopInformation_1 = require("../models/StopInformation");
const RecOrt_1 = require("../models/VDV/RecOrt");
const RecHp_1 = require("../models/VDV/RecHp");
const sequelize_1 = require("sequelize");
class StopController {
    constructor() {
        // Migration Endpoint
        this.migrateStops = async (req, res) => {
            try {
                const stops = await Stop_1.Stop.findAll({
                    include: [StopInformation_1.StopInformation] // Include detailed info
                });
                console.log(`Found ${stops.length} stops to migrate.`);
                let migratedCount = 0;
                // GKZ to City Map (Simple hardcoded for now, or could use external service/DB)
                const gkzMap = {
                    '03251': 'Lemförde',
                    '05711': 'Bielefeld',
                    '03252': 'Stemwede' // Derived from data
                };
                for (const stop of stops) {
                    try {
                        if (!stop.id)
                            continue;
                        // Parse DHID for IDs
                        // VDV 432: de:GKZ:OrtNr:HpNr
                        const dhidParts = stop.id.split(':');
                        if (dhidParts.length < 3) {
                            // console.warn(`Skipping invalid DHID: ${stop.id}`);
                            continue;
                        }
                        const country = dhidParts[0];
                        const gkz = dhidParts[1];
                        const stopId = parseInt(dhidParts[2]);
                        // Parsing HP_NR
                        let hpId = 0;
                        if (dhidParts.length >= 4) {
                            // Use the last part as HP_NR (Quay ID)
                            const lastPart = dhidParts[dhidParts.length - 1];
                            const parsedHp = parseInt(lastPart);
                            if (!isNaN(parsedHp))
                                hpId = parsedHp;
                        }
                        if (isNaN(stopId))
                            continue; // Must have OrtNr
                        // Determine Name
                        let stopName = "Unbekannt";
                        if (stop.stopInformation && stop.stopInformation.shortName) {
                            stopName = stop.stopInformation.shortName;
                        }
                        else if (stop.name) {
                            if (stop.name.includes(',')) {
                                const parts = stop.name.split(',');
                                const cityName = parts[0].trim();
                                stopName = parts.slice(1).join(',').trim();
                            }
                            else {
                                stopName = stop.name;
                            }
                        }
                        // 2. Manage Place (Ort) - Table 253/911
                        let existingOrt = await RecOrt_1.RecOrt.findOne({ where: { ORT_NR: stopId, ONR_TYP_NR: 1 } });
                        // Prepare VDV Coordinates
                        const vdvLaenge = this.toVdvCoordinate(stop.longitude);
                        const vdvBreite = this.toVdvCoordinate(stop.latitude);
                        if (!existingOrt) {
                            // Create New Ort
                            await RecOrt_1.RecOrt.create({
                                ORT_NR: stopId,
                                ORT_NAME: stopName,
                                ONR_TYP_NR: 1,
                                ORT_REF_ORT_KUERZEL: (stop.stopInformation && stop.stopInformation.code) ? stop.stopInformation.code : '',
                                ORT_REF_ORT: 0,
                                ORT_POS_LAENGE: vdvLaenge,
                                ORT_POS_BREITE: vdvBreite,
                                HAST_NR_LOKAL: stopId,
                                // HST_NR_NATIONAL: 0, // Cannot hold DHID string
                                HST_NR_INTERNATIONAL: stop.id,
                                BASIS_VERSION: 1
                            });
                        }
                        else {
                            let changed = false;
                            if (existingOrt.ORT_NAME === 'Unbekannt' && stopName !== 'Unbekannt') {
                                existingOrt.ORT_NAME = stopName;
                                changed = true;
                            }
                            // Update Coordinates
                            // Check if different to avoid redundant saves (approximate check)
                            if (vdvLaenge !== 0 && existingOrt.ORT_POS_LAENGE !== vdvLaenge) {
                                existingOrt.ORT_POS_LAENGE = vdvLaenge;
                                changed = true;
                            }
                            if (vdvBreite !== 0 && existingOrt.ORT_POS_BREITE !== vdvBreite) {
                                existingOrt.ORT_POS_BREITE = vdvBreite;
                                changed = true;
                            }
                            // Update IDs if missing
                            if (!existingOrt.HAST_NR_LOKAL) {
                                existingOrt.HAST_NR_LOKAL = stopId;
                                changed = true;
                            }
                            if (!existingOrt.HST_NR_INTERNATIONAL) {
                                existingOrt.HST_NR_INTERNATIONAL = stop.id;
                                changed = true;
                            }
                            // Ensure Code is updated if missing or different (and available)
                            if (stop.stopInformation && stop.stopInformation.code && existingOrt.ORT_REF_ORT_KUERZEL !== stop.stopInformation.code) {
                                existingOrt.ORT_REF_ORT_KUERZEL = stop.stopInformation.code;
                                changed = true;
                            }
                            if (changed)
                                await existingOrt.save();
                        }
                        // 3. Create Stop Point (Haltepunkt) - Table 912
                        const exists = await RecHp_1.RecHp.findOne({ where: { ORT_NR: stopId, HALTEPUNKT_NR: hpId, ONR_TYP_NR: 1 } });
                        if (!exists) {
                            await RecHp_1.RecHp.create({
                                ORT_NR: stopId,
                                HALTEPUNKT_NR: hpId,
                                ONR_TYP_NR: 1, // Haltestelle
                                DHID: stop.id, // Keep DHID for reference
                                ZUSATZ_INFO: '',
                                BASIS_VERSION: 1
                            });
                            migratedCount++;
                        }
                    }
                    catch (innerError) {
                        console.error(`Failed to migrate stop ${stop.id}:`, innerError);
                    }
                }
                return res.status(200).json({ message: `Successfully migrated ${migratedCount} stops/points.` });
            }
            catch (error) {
                console.error('Stop migration error:', error);
                return res.status(500).json({ message: 'Migration failed', error });
            }
        };
        // VDV 452 - RecOrt Endpoints
        this.getAllRecOrts = async (req, res) => {
            const query = req.params.query || req.query.query;
            const basisVersion = req.query.basisVersion;
            const whereClause = {
                ONR_TYP_NR: 1
            };
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }
            if (query) {
                // If query is present, we might miss sub-places if we only filter by name here?
                // But usually sub-places have same name diff?
                // Safest: Fetch all to count, OR filter parents by name and fetch their subs?
                // Let's stick to memory method but apply name filter only to Parents later?
                // No, DB filter is better for performance if list is huge.
                whereClause.ORT_NAME = { [sequelize_1.Op.like]: `%${query}%` };
            }
            try {
                // Fetch ALL stops (Parents and SubPlaces) to count accurately
                // But if query is present, we only want matching Parents?
                // If we filter by Name in DB, we might lose SubPlaces if they don't match or if we only fetch match.
                // OPTIMIZED STRATEGY:
                // 1. Fetch only Parents (with Name filter).
                // 2. Fetch specific SubPlaces for those parents? Or simply count separately?
                //   -> SELECT ORT_REF_ORT, COUNT(*) FROM REC_ORT WHERE ORT_REF_ORT IN (...) GROUP BY ORT_REF_ORT
                // Step A: Fetch Parents
                const parentWhere = { ...whereClause, [sequelize_1.Op.or]: [{ ORT_REF_ORT: null }, { ORT_REF_ORT: 0 }] };
                const parents = await RecOrt_1.RecOrt.findAll({
                    where: parentWhere,
                    order: [['ORT_NAME', 'ASC']]
                });
                // Step B: Fetch Counts for these parents
                if (parents.length > 0) {
                    const parentIds = parents.map(p => p.ORT_NR);
                    const counts = await RecOrt_1.RecOrt.findAll({
                        attributes: ['ORT_REF_ORT', [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('ORT_NR')), 'count']],
                        where: {
                            ORT_REF_ORT: { [sequelize_1.Op.in]: parentIds }
                        },
                        group: ['ORT_REF_ORT'],
                        raw: true
                    });
                    // Map counts
                    const countMap = new Map();
                    counts.forEach((c) => {
                        countMap.set(c.ORT_REF_ORT, c.count);
                    });
                    // Attach to parents
                    const result = parents.map(p => {
                        const json = p.toJSON();
                        json.subOrtCount = countMap.get(p.ORT_NR) || 0;
                        return json;
                    });
                    res.json(result);
                }
                else {
                    res.json([]);
                }
            }
            catch (e) {
                console.error("Error fetching RecOrts:", e);
                res.status(500).json({ error: 'Failed to fetch RecOrts' });
            }
        };
        this.getRecOrtById = async (req, res) => {
            const ortNr = req.params.ortNr;
            const basisVersion = req.query.basisVersion;
            const whereClause = {
                ORT_NR: ortNr,
                ONR_TYP_NR: 1
            };
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }
            try {
                const recOrt = await RecOrt_1.RecOrt.findOne({
                    where: whereClause,
                    include: [
                        { model: RecHp_1.RecHp, as: 'recHps' },
                        {
                            model: RecOrt_1.RecOrt,
                            as: 'subOrts',
                            include: [{ model: RecHp_1.RecHp, as: 'recHps' }]
                        }
                    ],
                    order: [
                        [{ model: RecHp_1.RecHp, as: 'recHps' }, 'HALTEPUNKT_NR', 'ASC'],
                        [{ model: RecOrt_1.RecOrt, as: 'subOrts' }, 'ORT_NR', 'ASC'],
                        [{ model: RecOrt_1.RecOrt, as: 'subOrts' }, { model: RecHp_1.RecHp, as: 'recHps' }, 'HALTEPUNKT_NR', 'ASC']
                    ]
                });
                if (!recOrt)
                    return res.status(404).json({ error: 'RecOrt not found' });
                res.json(recOrt);
            }
            catch (e) {
                console.error("Error fetching RecOrt:", e);
                res.status(500).json({ error: 'Failed to fetch RecOrt' });
            }
        };
        this.updateRecOrt = async (req, res) => {
            const ortNr = req.params.ortNr;
            const data = req.body;
            try {
                const recOrt = await RecOrt_1.RecOrt.findOne({
                    where: { ORT_NR: ortNr, ONR_TYP_NR: 1 }
                });
                if (!recOrt)
                    return res.status(404).json({ error: 'RecOrt not found' });
                await recOrt.update(data);
                // Reload to include relations if needed
                await recOrt.reload({ include: [{ model: RecHp_1.RecHp, as: 'recHps' }] });
                res.json(recOrt);
            }
            catch (e) {
                console.error("Error updating RecOrt:", e);
                res.status(500).json({ error: 'Failed to update RecOrt' });
            }
        };
    }
    // Helper to convert Decimal Degrees to VDV gggmmssnnn
    toVdvCoordinate(decimal) {
        if (!decimal)
            return 0;
        const sign = decimal >= 0 ? 1 : -1;
        const absVal = Math.abs(decimal);
        const deg = Math.floor(absVal);
        const minDec = (absVal - deg) * 60;
        const min = Math.floor(minDec);
        const secDec = (minDec - min) * 60;
        const sec = Math.floor(secDec);
        const millis = Math.round((secDec - sec) * 1000);
        // Format: gggmmssnnn
        // ggg * 10000000 + mm * 100000 + ss * 1000 + nnn
        const vdvVal = (deg * 10000000) + (min * 100000) + (sec * 1000) + millis;
        return sign * vdvVal;
    }
    // Update a stop
    async updateStop(req, res) {
        const stopId = req.params.id;
        const updatedStopData = req.body;
        const updatedInformationData = req.body.information;
        try {
            // Find the stop and include related StopInformation
            const updatedStop = await Stop_1.Stop.findByPk(stopId, {
                include: [StopInformation_1.StopInformation],
            });
            if (!updatedStop) {
                return res.status(404).json({ message: 'Stop not found' });
            }
            // Check if related StopInformation exists
            let updatedInformation = updatedStop.stopInformation;
            if (!updatedInformation) {
                // If it doesn't exist, create a new instance
                updatedInformation = await StopInformation_1.StopInformation.create(updatedInformationData);
                updatedInformation.stop_id = updatedStop.id;
                await updatedInformation.save();
                // Associate the newly created StopInformation with the Stop
                updatedStop.stopInformation = updatedInformation;
                await updatedStop.save();
            }
            else {
                // Update related StopInformation properties
                await updatedInformation.update(updatedInformationData);
            }
            // Update main Stop properties
            await updatedStop.update(updatedStopData);
            // Handle VDV Stop Data (RecHp/RecOrt)
            const recHpData = req.body.recHp;
            if (recHpData) {
                // Find existing RecHp via DHID (updatedStop.id)
                // Note: RecHp table uses ORT_NR, HALTEPUNKT_NR, ONR_TYP_NR, BASIS_VERSION as PKs usually.
                // But here we rely on DHID which is unique.
                let recHp = await RecHp_1.RecHp.findOne({ where: { DHID: updatedStop.id } });
                if (recHp) {
                    await recHp.update(recHpData);
                    // Handle nested RecOrt
                    if (recHpData.recOrt) {
                        // Determine existing RecOrt
                        const recOrt = await RecOrt_1.RecOrt.findOne({
                            where: { ORT_NR: recHp.ORT_NR, ONR_TYP_NR: recHp.ONR_TYP_NR }
                        });
                        if (recOrt) {
                            await recOrt.update(recHpData.recOrt);
                        }
                    }
                }
            }
            // Reload the stop to include the updated related information in the response
            await updatedStop.reload();
            return res.status(200).json(updatedStop);
        }
        catch (error) {
            console.error('Error updating stop:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    // Get all tram stops
    async getStops(req, res) {
        const stops = await Stop_1.Stop.findAll({
            include: [
                {
                    model: StopInformation_1.StopInformation,
                    as: 'stopInformation' // Correct alias matching the model association
                },
                {
                    model: RecHp_1.RecHp,
                    include: [{ model: RecOrt_1.RecOrt, as: 'recOrt' }]
                }
            ]
        });
        res.json(stops);
    }
    async getStopById(req, res) {
        console.log('get stop by id called');
        const stop = await Stop_1.Stop.findOne({
            where: {
                id: req.params.id
            },
            include: [
                StopInformation_1.StopInformation,
                {
                    model: RecHp_1.RecHp,
                    include: [{ model: RecOrt_1.RecOrt, as: 'recOrt' }]
                }
            ]
        });
        res.json(stop);
    }
    async getStopsByCode(req, res) {
        console.log('Stops by code');
        const stopInfos = await Stop_1.Stop.findAll({
            where: {
                '$information.code$': req.params.query
            },
            include: [{
                    model: StopInformation_1.StopInformation,
                    as: 'stopInformation'
                }
            ]
        });
        res.json(stopInfos);
    }
    async searchStopsByName(req, res) {
        const query = req.params.query;
        try {
            const stops = await Stop_1.Stop.findAll({
                where: {
                    name: {
                        [sequelize_1.Op.like]: `%${query}%`
                    }
                },
                limit: 50,
                include: [
                    {
                        model: StopInformation_1.StopInformation,
                        as: 'stopInformation'
                    },
                    {
                        model: RecHp_1.RecHp,
                        include: [{ model: RecOrt_1.RecOrt, as: 'recOrt' }]
                    }
                ]
            });
            res.json(stops);
        }
        catch (error) {
            console.error('Error searching stops:', error);
            res.status(500).json({ message: 'Internal error' });
        }
    }
}
exports.StopController = StopController;
