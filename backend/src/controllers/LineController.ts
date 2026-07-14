
import { Request, Response } from 'express';
import { RecLid } from '../models/VDV/RecLid';
import { BasisVersion } from '../models/VDV/BasisVersion';
import { LidVerlauf } from '../models/VDV/LidVerlauf';
import { RecHp } from '../models/VDV/RecHp';
import { RecOrt } from '../models/VDV/RecOrt';
import { RecFrt } from '../models/VDV/RecFrt';
import { RecUms } from '../models/VDV/RecUms';
import { sequelize } from '../config/database';

export class LineController {

  /**
   * PUT /lines/:oldId/change-id
   * Cascading update of LI_NR across all dependent tables
   */
  public async updateLineIdCascade(req: Request, res: Response) {
    const oldId = parseInt(req.params.oldId);
    const newId = parseInt(req.body.newId);
    const basisVersion = req.body.basisVersion || 1;

    if (!newId || oldId === newId) {
      return res.status(400).json({ error: 'Invalid new ID' });
    }

    try {
      // Check if new ID already exists
      const existingLine = await RecLid.findOne({
        where: { LI_NR: newId, BASIS_VERSION: basisVersion }
      });

      if (existingLine) {
        return res.status(409).json({ error: `Line ID ${newId} already exists` });
      }

      // Perform cascading update in transaction
      await sequelize.transaction(async (t) => {
        // 1. Update all line variants/records (REC_LID)
        await RecLid.update(
          { LI_NR: newId },
          {
            where: { LI_NR: oldId, BASIS_VERSION: basisVersion },
            transaction: t
          }
        );

        // 2. Update line route details (LID_VERLAUF)
        await LidVerlauf.update(
          { LI_NR: newId },
          {
            where: { LI_NR: oldId, BASIS_VERSION: basisVersion },
            transaction: t
          }
        );

        // 3. Update trips (REC_FRT)
        await RecFrt.update(
          { LI_NR: newId },
          {
            where: { LI_NR: oldId, BASIS_VERSION: basisVersion },
            transaction: t
          }
        );

        // 4. Update route changes (REC_UMS)  
        await RecUms.update(
          { LI_NR: newId },
          {
            where: { LI_NR: oldId, BASIS_VERSION: basisVersion },
            transaction: t
          }
        );
      });

      res.json({
        success: true,
        message: `Line ID updated from ${oldId} to ${newId}`,
        oldId,
        newId
      });

    } catch (error: any) {
      console.error('Error in cascading LI_NR update:', error);
      res.status(500).json({
        error: 'Failed to update line ID',
        details: error.message
      });
    }
  }


  // GET /lines
  public async getAllLines(req: Request, res: Response) {
    try {
      const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : 1;
      const allRecs = await RecLid.findAll({
        where: { BASIS_VERSION: basisVersion },
        order: [['LI_NR', 'ASC'], ['STR_LI_VAR', 'ASC']]
      });

      // Deduplicate to logical lines by LI_NR
      // Sorted by STR_LI_VAR, so the first occurrence is always the same variant
      const logicalLinesMap = new Map<number, any>();
      for (const rec of allRecs) {
        if (!logicalLinesMap.has(rec.LI_NR)) {
          logicalLinesMap.set(rec.LI_NR, rec);
        }
      }

      const logicalLines = Array.from(logicalLinesMap.values());
      res.json(logicalLines);
    } catch (error) {
      console.error('Error getting lines:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /lines/:id
  public async getLineById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : 1;

      // Representative variant = lowest STR_LI_VAR, so the line form always shows the same one
      const line = await RecLid.findOne({
        where: {
          LI_NR: id,
          BASIS_VERSION: basisVersion
        },
        order: [['STR_LI_VAR', 'ASC']]
      });

      if (line) {
        res.json(line);
      } else {
        res.status(404).json({ error: 'Line not found' });
      }
    } catch (error) {
      console.error('Error getting line:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // POST /lines
  public async createLine(req: Request, res: Response) {
    try {
      const basisVersion = req.body.BASIS_VERSION || 1;

      // Calculate next ID if not provided
      let liNr = req.body.LI_NR;
      if (!liNr) {
        const maxId = await RecLid.max('LI_NR', { where: { BASIS_VERSION: basisVersion } }) as number || 0;
        liNr = maxId + 1;
      }

      const newLine = await RecLid.create({
        BASIS_VERSION: basisVersion,
        LI_NR: liNr,
        STR_LI_VAR: req.body.STR_LI_VAR || 'STD', // Default
        LI_KUERZEL: req.body.LI_KUERZEL || req.body.STR_LID || 'NEW', // Map Frontend STR_LID -> LI_KUERZEL
        LIDNAME: req.body.LIDNAME || req.body.LIN_NAME || 'New Line' // Map Frontend LIN_NAME -> LIDNAME
      });
      res.status(201).json(newLine);
    } catch (error) {
      console.error('Error creating line:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // PUT /lines/:id
  public async updateLine(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const id = parseInt(req.params.id);
      const basisVersion = req.body.BASIS_VERSION || 1;

      // STR_LI_VAR identifies WHICH Fahrweg is being edited - it is a filter, never an update value.
      // Writing it would collapse all variants of the line onto the same primary key.
      const strLiVar: string | undefined = req.body.STR_LI_VAR;
      const kuerzel = req.body.LI_KUERZEL ?? req.body.STR_LID;
      const lidName = req.body.LIDNAME ?? req.body.LIN_NAME;
      // Colors ignored as they are not in VDV

      const exists = await RecLid.findOne({
        where: { LI_NR: id, BASIS_VERSION: basisVersion },
        transaction: t
      });
      if (!exists) {
        await t.rollback();
        return res.status(404).json({ error: 'Line not found' });
      }

      // LI_KUERZEL (line number) is a line-level attribute -> applies to every Fahrweg of the line
      if (kuerzel !== undefined && kuerzel !== null) {
        await RecLid.update(
          { LI_KUERZEL: kuerzel },
          { where: { LI_NR: id, BASIS_VERSION: basisVersion }, transaction: t }
        );
      }

      // LIDNAME is per-Fahrweg -> only ever touch the one row the form is editing
      if (lidName !== undefined && lidName !== null && strLiVar) {
        await RecLid.update(
          { LIDNAME: lidName },
          { where: { LI_NR: id, BASIS_VERSION: basisVersion, STR_LI_VAR: strLiVar }, transaction: t }
        );
      }

      await t.commit();

      const updatedLine = await RecLid.findOne({
        where: { LI_NR: id, BASIS_VERSION: basisVersion },
        order: [['STR_LI_VAR', 'ASC']]
      });
      res.json(updatedLine);
    } catch (error) {
      await t.rollback();
      console.error('Error updating line:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // DELETE /lines/:id
  public async deleteLine(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : 1;

      const deleted = await RecLid.destroy({
        where: {
          LI_NR: id,
          BASIS_VERSION: basisVersion
        }
      });

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Line not found' });
      }
    } catch (error) {
      console.error('Error deleting line:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /lines/variants
  // Get all variants (REC_LID) for a line or global
  public async getLineVariants(req: Request, res: Response) {
    try {
      const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : 1;
      const liNr = req.query.liNr ? parseInt(req.query.liNr as string) : undefined;

      const whereClause: any = { BASIS_VERSION: basisVersion };
      if (liNr) {
        whereClause.LI_NR = liNr;
      }

      // Variants are now stored in REC_LID with STR_LI_VAR
      const variants = await RecLid.findAll({
        where: whereClause,
        order: [['STR_LI_VAR', 'ASC']]
      });

      res.json(variants);
    } catch (error) {
      console.error('Error getting variants:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // GET /lines/variant-stops
  // Get stops (LID_VERLAUF) for a specific variant
  public async getVariantStops(req: Request, res: Response) {
    try {
      const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : 1;
      const liNr = parseInt(req.query.liNr as string);
      const strLiVar = req.query.strLiVar as string;

      if (!liNr || !strLiVar) {
        res.status(400).json({ error: 'Missing liNr or strLiVar' });
        return;
      }

      const stops = await LidVerlauf.findAll({
        where: {
          BASIS_VERSION: basisVersion,
          LI_NR: liNr,
          STR_LI_VAR: strLiVar
        },
        include: [
          { model: RecOrt, as: 'ort', required: false }
        ],
        order: [['LI_LFD_NR', 'ASC']]
      });

      res.json(stops);
    } catch (error) {
      console.error('Error getting variant stops:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // POST /lines/variants
  public async createVariant(req: Request, res: Response) {
    try {
      const basisVersion = req.body.BASIS_VERSION || 1;

      // LI_KUERZEL is line-level: inherit it from the existing line instead of inventing 'VAR'
      let kuerzel = req.body.LI_KUERZEL;
      if (!kuerzel) {
        const sibling = await RecLid.findOne({
          where: { BASIS_VERSION: basisVersion, LI_NR: req.body.LI_NR },
          order: [['STR_LI_VAR', 'ASC']]
        });
        kuerzel = sibling?.LI_KUERZEL || 'VAR';
      }

      // Map incoming fields to REC_LID
      const variant = await RecLid.create({
        BASIS_VERSION: basisVersion,
        LI_NR: req.body.LI_NR,
        STR_LI_VAR: req.body.STR_LI_VAR, // e.g. "V01"
        LI_KUERZEL: kuerzel,
        LIDNAME: req.body.LIDNAME || req.body.VERLAUF_NAME, // Map VERLAUF_NAME to LIDNAME
        LI_RI_NR: req.body.LI_RI_NR,
        ROUTEN_NR: req.body.ROUTEN_NR
      });
      res.status(201).json(variant);
    } catch (error) {
      console.error('Error creating variant:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // POST /lines/variants/duplicate
  // Copies a Fahrweg (REC_LID) including its complete stop sequence (LID_VERLAUF)
  public async duplicateVariant(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const basisVersion = req.body.BASIS_VERSION || 1;
      const liNr = parseInt(req.body.LI_NR);
      const strLiVar = req.body.STR_LI_VAR as string;

      if (!liNr || !strLiVar) {
        await t.rollback();
        return res.status(400).json({ error: 'Missing LI_NR or STR_LI_VAR' });
      }

      const source = await RecLid.findOne({
        where: { BASIS_VERSION: basisVersion, LI_NR: liNr, STR_LI_VAR: strLiVar },
        transaction: t
      });
      if (!source) {
        await t.rollback();
        return res.status(404).json({ error: 'Variant not found' });
      }

      const siblings = await RecLid.findAll({
        where: { BASIS_VERSION: basisVersion, LI_NR: liNr },
        attributes: ['STR_LI_VAR'],
        transaction: t
      });
      const taken = new Set(siblings.map(s => s.STR_LI_VAR));

      const newStrLiVar = LineController.nextFreeStrLiVar(strLiVar, taken);
      if (!newStrLiVar) {
        await t.rollback();
        return res.status(409).json({ error: `Kein freier Fahrweg-Code auf Basis von ${strLiVar} gefunden.` });
      }

      const copyData = source.toJSON();
      copyData.STR_LI_VAR = newStrLiVar;
      copyData.LIDNAME = `${source.LIDNAME || strLiVar} (Kopie)`.substring(0, 100);
      const copy = await RecLid.create(copyData, { transaction: t });

      // Copy the stop sequence - without it the duplicate would be an empty Fahrweg
      const stops = await LidVerlauf.findAll({
        where: { BASIS_VERSION: basisVersion, LI_NR: liNr, STR_LI_VAR: strLiVar },
        order: [['LI_LFD_NR', 'ASC']],
        transaction: t
      });
      if (stops.length > 0) {
        await LidVerlauf.bulkCreate(
          stops.map(s => ({ ...s.toJSON(), STR_LI_VAR: newStrLiVar })),
          { transaction: t }
        );
      }

      await t.commit();
      res.status(201).json(copy);
    } catch (error) {
      await t.rollback();
      console.error('Error duplicating variant:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Derives a free STR_LI_VAR for a copy of `source` by incrementing its numeric suffix
   * ("V01" -> "V02", "V03", ...). Column is STRING(6), so candidates must stay within 6 chars.
   */
  private static nextFreeStrLiVar(source: string, taken: Set<string>): string | undefined {
    const match = source.match(/^(.*?)(\d+)$/);
    const prefix = match ? match[1] : source;
    const width = match ? match[2].length : 1;
    const start = match ? parseInt(match[2], 10) + 1 : 2;

    for (let n = start; n < start + 1000; n++) {
      const padded = String(n).padStart(width, '0');
      let candidate = prefix + padded;
      if (candidate.length > 6) {
        // Trim the prefix so the counter still fits into the column
        candidate = prefix.substring(0, Math.max(0, 6 - padded.length)) + padded;
      }
      if (candidate.length <= 6 && candidate.length > 0 && !taken.has(candidate)) {
        return candidate;
      }
    }
    return undefined;
  }

  // PUT /lines/variants
  public async updateVariant(req: Request, res: Response) {
    try {
      const basisVersion = req.body.BASIS_VERSION || 1;
      const { LI_NR, STR_LI_VAR } = req.body;
      const oldStrLiVar = req.query.oldStrLiVar as string; // Optional: if renaming

      if (oldStrLiVar && oldStrLiVar !== STR_LI_VAR) {
        // Renaming: PK Change -> Manual Copy-Move-Delete or Cascade
        // 1. Check if new ID exists
        const exists = await RecLid.findOne({ where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR } });
        if (exists) {
          return res.status(409).json({ error: `Variant ${STR_LI_VAR} already exists.` });
        }

        // 2. Find Old
        const oldVariant = await RecLid.findOne({ where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR: oldStrLiVar } });
        if (!oldVariant) {
          return res.status(404).json({ error: 'Original variant not found.' });
        }

        // 3. Create New
        const newVariantData = oldVariant.toJSON();
        newVariantData.STR_LI_VAR = STR_LI_VAR;
        Object.assign(newVariantData, req.body); // Apply other updates
        await RecLid.create(newVariantData);

        // 4. Move Children (LidVerlauf)
        // We can use simple Update here because we just change the STR_LI_VAR column
        await LidVerlauf.update(
          { STR_LI_VAR: STR_LI_VAR },
          { where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR: oldStrLiVar } }
        );

        // 5. Delete Old
        await RecLid.destroy({ where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR: oldStrLiVar } });

        res.json({ success: true, newStrLiVar: STR_LI_VAR });

      } else {
        // Normal Update
        await RecLid.update(req.body, {
          where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR }
        });
        res.json({ success: true });
      }

    } catch (error) {
      console.error('Error updating variant:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // DELETE /lines/variants
  public async deleteVariant(req: Request, res: Response) {
    try {
      const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : 1;
      const liNr = parseInt(req.query.liNr as string);
      const strLiVar = req.query.strLiVar as string;

      // Delete stops first
      await LidVerlauf.destroy({
        where: { BASIS_VERSION: basisVersion, LI_NR: liNr, STR_LI_VAR: strLiVar }
      });

      // Delete header (RecLid)
      await RecLid.destroy({
        where: { BASIS_VERSION: basisVersion, LI_NR: liNr, STR_LI_VAR: strLiVar }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting variant:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }


  // POST /lines/variant-stops
  // Add a stop to the END of the sequence
  public async addVariantStop(req: Request, res: Response) {
    try {
      const { BASIS_VERSION, LI_NR, STR_LI_VAR, ORT_NR, ONR_TYP_NR, HALTEPUNKT_NR } = req.body;
      const basisVersion = BASIS_VERSION || 1;

      // Find max LI_LFD_NR
      const maxLfd = await LidVerlauf.max('LI_LFD_NR', {
        where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR }
      }) as number || 0;

      const newStop = await LidVerlauf.create({
        BASIS_VERSION: basisVersion,
        LI_NR,
        STR_LI_VAR,
        LI_LFD_NR: maxLfd + 1,
        ORT_NR,
        ONR_TYP_NR, // Assuming mapping exists
        HALTEPUNKT_NR: HALTEPUNKT_NR || 0, // Fallback if needed
        EINSTEIGEVERBOT: false, // Default
        AUSSTEIGEVERBOT: false
      });
      res.status(201).json(newStop);
    } catch (error) {
      console.error('Error adding variant stop:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // DELETE /lines/variant-stops?liNr=X&strLiVar=Y&liLfdNr=Z
  public async removeVariantStop(req: Request, res: Response) {
    try {
      const basisVersion = req.query.basisVersion ? parseInt(req.query.basisVersion as string) : 1;
      const liNr = parseInt(req.query.liNr as string);
      const strLiVar = req.query.strLiVar as string;
      const liLfdNr = parseInt(req.query.liLfdNr as string);

      await LidVerlauf.destroy({
        where: { BASIS_VERSION: basisVersion, LI_NR: liNr, STR_LI_VAR: strLiVar, LI_LFD_NR: liLfdNr }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error removing variant stop:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // PUT /lines/variant-stops?liNr=X&strLiVar=Y&liLfdNr=Z
  public async updateVariantStop(req: Request, res: Response) {
    try {
      const { liNr, strLiVar, liLfdNr } = req.query;
      const updates = req.body;

      await LidVerlauf.update(updates, {
        where: {
          LI_NR: liNr,
          STR_LI_VAR: strLiVar,
          LI_LFD_NR: liLfdNr
        }
      });

      const updated = await LidVerlauf.findOne({
        where: {
          LI_NR: liNr,
          STR_LI_VAR: strLiVar,
          LI_LFD_NR: liLfdNr
        },
        include: [{ model: RecOrt, as: 'ort' }]
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST /lines/variant-stops/swap
  public async swapVariantStops(req: Request, res: Response) {
    try {
      const { LI_NR, STR_LI_VAR, BASIS_VERSION, INDEX_1, INDEX_2 } = req.body;
      const basisVersion = BASIS_VERSION || 1;

      if (!LI_NR || !STR_LI_VAR || !INDEX_1 || !INDEX_2) {
        return res.status(400).json({ error: 'Missing parameters' });
      }

      await sequelize.transaction(async (t) => {
        // Safe Swap using a temp placeholder
        // 1. Move Index 1 to Temp (-1)
        await LidVerlauf.update(
          { LI_LFD_NR: -1 },
          {
            where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR, LI_LFD_NR: INDEX_1 },
            transaction: t
          }
        );

        // 2. Move Index 2 to Index 1
        await LidVerlauf.update(
          { LI_LFD_NR: INDEX_1 },
          {
            where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR, LI_LFD_NR: INDEX_2 },
            transaction: t
          }
        );

        // 3. Move Temp (-1) to Index 2
        await LidVerlauf.update(
          { LI_LFD_NR: INDEX_2 },
          {
            where: { BASIS_VERSION: basisVersion, LI_NR, STR_LI_VAR, LI_LFD_NR: -1 },
            transaction: t
          }
        );
      });

      res.json({ success: true });

    } catch (error: any) {
      console.error('Swap Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
