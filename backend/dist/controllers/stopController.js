"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopController = void 0;
// import { Stop } from '../models/Stop';
// import { StopInformation } from '../models/StopInformation';
const RecOrt_1 = require("../models/VDV/RecOrt");
const RecHp_1 = require("../models/VDV/RecHp");
const sequelize_1 = require("sequelize");
class StopController {
    constructor() {
        // VDV 452 - RecOrt Endpoints
        this.getAllRecOrts = async (req, res) => {
            const query = req.params.query || req.query.query;
            const basisVersion = req.query.basisVersion || req.query.basis_version; // Support both cases
            const whereClause = {};
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }
            if (query) {
                whereClause.ORT_NAME = { [sequelize_1.Op.like]: `%${query}%` };
            }
            try {
                // If no specific filtering, return ALL REC_ORTs (including sub-orte)
                const allOrte = await RecOrt_1.RecOrt.findAll({
                    where: whereClause,
                    include: [{
                            model: RecOrt_1.RecOrt,
                            as: 'parentOrt',
                            required: false,
                            attributes: ['ORT_NR', 'ORT_NAME']
                        }],
                    order: [['ORT_NAME', 'ASC']]
                });
                // Enrich with parent information for sub-orte
                const result = allOrte.map(ort => {
                    const json = ort.toJSON();
                    if (json.parentOrt) {
                        json.ORT_REF_ORT_NAME = json.parentOrt.ORT_NAME;
                    }
                    return json;
                });
                return res.json(result);
            }
            catch (e) {
                console.error("Error fetching RecOrts:", e);
                return res.status(500).json({ error: 'Failed to fetch RecOrts' });
            }
        };
        this.getRecOrtById = async (req, res) => {
            const ortNr = req.params.ortNr;
            const basisVersion = req.query.basisVersion || req.query.basis_version;
            const whereClause = {
                ORT_NR: ortNr
            };
            if (basisVersion) {
                whereClause.BASIS_VERSION = basisVersion;
            }
            try {
                const recOrt = await RecOrt_1.RecOrt.findOne({
                    where: whereClause,
                    include: [
                        {
                            model: RecHp_1.RecHp,
                            as: 'recHps',
                            required: false, // Left join to allow parents without children (though unusual if requested)
                            where: basisVersion ? { BASIS_VERSION: basisVersion } : {}
                        },
                        {
                            model: RecOrt_1.RecOrt,
                            as: 'subOrts',
                            required: false,
                            where: basisVersion ? { BASIS_VERSION: basisVersion } : {},
                            include: [{
                                    model: RecHp_1.RecHp,
                                    as: 'recHps',
                                    required: false,
                                    where: basisVersion ? { BASIS_VERSION: basisVersion } : {}
                                }]
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
                return res.json(recOrt);
            }
            catch (e) {
                console.error("Error fetching RecOrt:", e);
                return res.status(500).json({ error: 'Failed to fetch RecOrt' });
            }
        };
        this.createRecOrt = async (req, res) => {
            const data = req.body;
            try {
                const basisVersion = data.BASIS_VERSION || 1;
                const onrTypNr = data.ONR_TYP_NR || 1;
                // Logic Branch 1: Specific ID provided (> 0)
                if (data.ORT_NR && data.ORT_NR > 0) {
                    const existing = await RecOrt_1.RecOrt.findOne({
                        where: {
                            ORT_NR: data.ORT_NR,
                            ONR_TYP_NR: onrTypNr,
                            BASIS_VERSION: basisVersion
                        }
                    });
                    if (existing) {
                        return res.status(409).json({
                            error: `Stop with ID ${data.ORT_NR} already exists`,
                            details: 'Duplicate Key'
                        });
                    }
                }
                else {
                    // Logic Branch 2: No ID or 0 provided -> Auto Increment
                    const maxOrt = await RecOrt_1.RecOrt.findOne({
                        where: { BASIS_VERSION: basisVersion }, // Global max or per ONR_TYP? Usually global namespace for ORT_NR
                        order: [['ORT_NR', 'DESC']]
                    });
                    const nextId = maxOrt ? (maxOrt.ORT_NR + 1) : 1;
                    data.ORT_NR = nextId;
                }
                // Create new RecOrt
                const newRecOrt = await RecOrt_1.RecOrt.create(data);
                // Reload to include any default values and relations
                await newRecOrt.reload({ include: [{ model: RecHp_1.RecHp, as: 'recHps' }] });
                res.status(201).json(newRecOrt);
            }
            catch (e) {
                console.error("Error creating RecOrt:", e);
                res.status(500).json({ error: 'Failed to create RecOrt', details: e.message });
            }
        };
        this.updateRecOrt = async (req, res) => {
            const ortNr = req.params.ortNr;
            const data = req.body;
            try {
                const recOrt = await RecOrt_1.RecOrt.findOne({
                    where: { ORT_NR: ortNr }
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
        this.deleteRecOrt = async (req, res) => {
            const ortNr = req.params.ortNr;
            try {
                // First delete all associated RecHps
                await RecHp_1.RecHp.destroy({ where: { ORT_NR: ortNr } });
                // Delete all sub-orte (if any)
                await RecOrt_1.RecOrt.destroy({ where: { ORT_REF_ORT: ortNr } });
                // Delete the RecOrt itself
                const deleted = await RecOrt_1.RecOrt.destroy({
                    where: { ORT_NR: ortNr }
                });
                if (deleted === 0) {
                    return res.status(404).json({ error: 'RecOrt not found' });
                }
                res.status(204).send(); // No content
            }
            catch (e) {
                console.error("Error deleting RecOrt:", e);
                res.status(500).json({ error: 'Failed to delete RecOrt', details: e.message });
            }
        };
        // Group Management Endpoints
        this.getGroupDetails = async (req, res) => {
            const refId = parseInt(req.params.refId, 10);
            const basisVersion = req.query.basisVersion || req.query.basis_version;
            const whereVersion = basisVersion ? { BASIS_VERSION: basisVersion } : {};
            try {
                // 1. Fetch all children belonging to this group
                const children = await RecOrt_1.RecOrt.findAll({
                    where: { ...whereVersion, ORT_REF_ORT: refId },
                    order: [['ORT_NAME', 'ASC']]
                });
                if (children.length === 0) {
                    // Check if it's a "Real" parent that currently has no children? 
                    // Or just doesn't exist.
                    // Try to find if RecOrt with such ID exists
                    const parentOrt = await RecOrt_1.RecOrt.findOne({ where: { ...whereVersion, ORT_NR: refId } });
                    if (parentOrt) {
                        return res.json({
                            parent: parentOrt,
                            children: []
                        });
                    }
                    return res.status(404).json({ error: 'Group not found' });
                }
                // 2. Identify Parent Info from children (assuming consistency)
                // Pick first child's info
                const first = children[0];
                // 3. Try to find if a Real Parent RecOrt exists matching the RefId
                // (This handles cases where Parent is also imported as a Stop)
                // BUT current logic separates them (Parent ID range 100000+ vs RecOrt range).
                // If RefId is > 100000, it's likely virtual.
                let parentOrt = await RecOrt_1.RecOrt.findOne({ where: { ...whereVersion, ORT_NR: refId } });
                // Build "Virtual" parent object if not real
                if (!parentOrt) {
                    parentOrt = {
                        ORT_NR: refId,
                        ORT_NAME: first.ORT_REF_ORT_NAME || 'Unknown Group',
                        ORT_REF_ORT_LangNr: first.ORT_REF_ORT_LangNr || 0,
                        ORT_REF_ORT_KUERZEL: first.ORT_REF_ORT_KUERZEL,
                        BASIS_VERSION: first.BASIS_VERSION,
                        virtual: true
                    };
                }
                else {
                    parentOrt.setDataValue('virtual', false);
                }
                return res.json({
                    parent: parentOrt,
                    children: children
                });
            }
            catch (e) {
                console.error("Error fetching group:", e);
                res.status(500).json({ error: 'Failed to fetch group' });
            }
        };
        this.updateGroup = async (req, res) => {
            const refId = parseInt(req.params.refId, 10);
            const data = req.body; // Expect { ORT_REF_ORT_NAME, ORT_REF_ORT_LangNr, ... }
            const basisVersion = req.query.basisVersion || req.query.basis_version;
            const whereVersion = basisVersion ? { BASIS_VERSION: basisVersion } : {};
            try {
                // 1. Update ALL children
                await RecOrt_1.RecOrt.update({
                    ORT_REF_ORT_NAME: data.ORT_REF_ORT_NAME,
                    ORT_REF_ORT_LangNr: data.ORT_REF_ORT_LangNr,
                    ORT_REF_ORT_KUERZEL: data.ORT_REF_ORT_KUERZEL
                }, {
                    where: { ...whereVersion, ORT_REF_ORT: refId }
                });
                // 2. If a Real Parent exists, update it too?
                // Only if user explicitly wants to sync them.
                // For now, if RecOrt exists at ID refId, we update its OWN name/langNr too?
                // Usually ORT_NAME = ORT_REF_ORT_NAME of children.
                // But RecOrt table has ORT_NAME.
                const parentOrt = await RecOrt_1.RecOrt.findOne({ where: { ...whereVersion, ORT_NR: refId } });
                if (parentOrt) {
                    await parentOrt.update({
                        ORT_NAME: data.ORT_REF_ORT_NAME,
                        // Do we update ORT_REF_ORT fields of the PARENT itself?
                        // Usually Parent's parent is something else (Grandparent).
                        // So we strictly update ORT_NAME of the parent row.
                        // And maybe its code if mapping exists?
                    });
                }
                res.json({ success: true });
            }
            catch (e) {
                console.error("Error updating group:", e);
                res.status(500).json({ error: 'Failed to update group' });
            }
        };
    }
}
exports.StopController = StopController;
