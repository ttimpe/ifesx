"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/workers/gtfs-import.worker.ts
var import_adm_zip = __toESM(require("adm-zip"));
var import_path2 = __toESM(require("path"));
var import_fs2 = __toESM(require("fs"));
var import_parse = require("@fast-csv/parse");
var import_axios = __toESM(require("axios"));

// src/config/database.ts
var import_sequelize_typescript26 = require("sequelize-typescript");

// src/models/VDV/RecLid.ts
var import_sequelize_typescript2 = require("sequelize-typescript");

// src/models/VDV/BasisVersion.ts
var import_sequelize_typescript = require("sequelize-typescript");
var BasisVersion = class extends import_sequelize_typescript.Model {
};
__decorateClass([
  import_sequelize_typescript.PrimaryKey,
  (0, import_sequelize_typescript.Column)(import_sequelize_typescript.DataType.INTEGER)
], BasisVersion.prototype, "BASIS_VERSION", 2);
__decorateClass([
  (0, import_sequelize_typescript.Column)(import_sequelize_typescript.DataType.STRING)
], BasisVersion.prototype, "BASIS_VERSION_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript.Column)(import_sequelize_typescript.DataType.DATE)
], BasisVersion.prototype, "GUELTIG_AB", 2);
BasisVersion = __decorateClass([
  (0, import_sequelize_typescript.Table)({
    timestamps: false,
    tableName: "MENGE_BASIS_VERSIONEN"
  })
], BasisVersion);

// src/models/VDV/RecLid.ts
var RecLid = class extends import_sequelize_typescript2.Model {
};
__decorateClass([
  import_sequelize_typescript2.PrimaryKey,
  (0, import_sequelize_typescript2.Column)({
    type: import_sequelize_typescript2.DataType.INTEGER,
    defaultValue: 1
  })
], RecLid.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript2.PrimaryKey,
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.INTEGER)
], RecLid.prototype, "LI_NR", 2);
__decorateClass([
  import_sequelize_typescript2.PrimaryKey,
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.STRING(6))
], RecLid.prototype, "STR_LI_VAR", 2);
__decorateClass([
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.INTEGER)
], RecLid.prototype, "ROUTEN_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.INTEGER)
], RecLid.prototype, "LI_RI_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.INTEGER)
], RecLid.prototype, "BEREICH_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.STRING(6))
], RecLid.prototype, "LI_KUERZEL", 2);
__decorateClass([
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.STRING(100))
], RecLid.prototype, "LIDNAME", 2);
__decorateClass([
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.INTEGER)
], RecLid.prototype, "ROUTEN_ART", 2);
__decorateClass([
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.INTEGER)
], RecLid.prototype, "LINIEN_CODE", 2);
__decorateClass([
  (0, import_sequelize_typescript2.Column)(import_sequelize_typescript2.DataType.STRING(128))
], RecLid.prototype, "LinienID", 2);
__decorateClass([
  (0, import_sequelize_typescript2.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], RecLid.prototype, "basisVersion", 2);
RecLid = __decorateClass([
  (0, import_sequelize_typescript2.Table)({
    tableName: "REC_LID",
    timestamps: false
  })
], RecLid);

// src/models/VDV/RecZnr.ts
var import_sequelize_typescript3 = require("sequelize-typescript");
var RecZnr = class extends import_sequelize_typescript3.Model {
  // Backward compatibility getters
  // Note: 'id' getter removed to avoid conflict with Model.id. Use ZNR_NR explicitly or map in controller.
  get number() {
    return this.ZNR_NR;
  }
  get name() {
    return this.ZNR_TEXT;
  }
};
__decorateClass([
  import_sequelize_typescript3.PrimaryKey,
  (0, import_sequelize_typescript3.Column)(import_sequelize_typescript3.DataType.INTEGER)
], RecZnr.prototype, "ZNR_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript3.Column)(import_sequelize_typescript3.DataType.STRING(160))
], RecZnr.prototype, "ZNR_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript3.Column)(import_sequelize_typescript3.DataType.STRING(10))
], RecZnr.prototype, "ZNR_KUERZEL", 2);
__decorateClass([
  (0, import_sequelize_typescript3.Column)(import_sequelize_typescript3.DataType.STRING(44))
], RecZnr.prototype, "FAHRERKURZTEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript3.Column)(import_sequelize_typescript3.DataType.STRING(160))
], RecZnr.prototype, "SEITENTEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript3.Column)(import_sequelize_typescript3.DataType.STRING(68))
], RecZnr.prototype, "ZNR_CODE", 2);
__decorateClass([
  (0, import_sequelize_typescript3.Column)({
    type: import_sequelize_typescript3.DataType.INTEGER,
    defaultValue: 1
  })
], RecZnr.prototype, "BASIS_VERSION", 2);
__decorateClass([
  (0, import_sequelize_typescript3.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], RecZnr.prototype, "basisVersion", 2);
RecZnr = __decorateClass([
  (0, import_sequelize_typescript3.Table)({
    tableName: "REC_ZNR",
    timestamps: false
  })
], RecZnr);

// src/models/VDV/Tagesart.ts
var import_sequelize_typescript4 = require("sequelize-typescript");
var Tagesart = class extends import_sequelize_typescript4.Model {
};
__decorateClass([
  import_sequelize_typescript4.PrimaryKey,
  (0, import_sequelize_typescript4.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript4.Column)(import_sequelize_typescript4.DataType.INTEGER)
], Tagesart.prototype, "BASIS_VERSION", 2);
__decorateClass([
  (0, import_sequelize_typescript4.BelongsTo)(() => BasisVersion)
], Tagesart.prototype, "basisVersion", 2);
__decorateClass([
  import_sequelize_typescript4.PrimaryKey,
  (0, import_sequelize_typescript4.Column)(import_sequelize_typescript4.DataType.INTEGER)
], Tagesart.prototype, "TAGESART_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript4.Column)(import_sequelize_typescript4.DataType.STRING)
], Tagesart.prototype, "TAGESART_TEXT", 2);
Tagesart = __decorateClass([
  (0, import_sequelize_typescript4.Table)({
    timestamps: false,
    tableName: "MENGE_TAGESART"
  })
], Tagesart);

// src/models/VDV/Betriebstag.ts
var import_sequelize_typescript5 = require("sequelize-typescript");
var Betriebstag = class extends import_sequelize_typescript5.Model {
};
__decorateClass([
  import_sequelize_typescript5.PrimaryKey,
  (0, import_sequelize_typescript5.Column)(import_sequelize_typescript5.DataType.INTEGER)
], Betriebstag.prototype, "BASIS_VERSION", 2);
__decorateClass([
  (0, import_sequelize_typescript5.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION" })
], Betriebstag.prototype, "basisVersion", 2);
__decorateClass([
  import_sequelize_typescript5.PrimaryKey,
  (0, import_sequelize_typescript5.Column)(import_sequelize_typescript5.DataType.INTEGER)
], Betriebstag.prototype, "BETRIEBSTAG", 2);
__decorateClass([
  (0, import_sequelize_typescript5.Column)(import_sequelize_typescript5.DataType.STRING)
], Betriebstag.prototype, "BETRIEBSTAG_TEXT", 2);
__decorateClass([
  import_sequelize_typescript5.PrimaryKey,
  (0, import_sequelize_typescript5.Column)(import_sequelize_typescript5.DataType.INTEGER)
], Betriebstag.prototype, "TAGESART_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript5.BelongsTo)(() => Tagesart, { foreignKey: "TAGESART_NR", targetKey: "TAGESART_NR" })
], Betriebstag.prototype, "tagesart", 2);
Betriebstag = __decorateClass([
  (0, import_sequelize_typescript5.Table)({
    timestamps: false,
    tableName: "FIRMENKALENDER"
  })
], Betriebstag);

// src/models/VDV/BasisVersionGueltigkeit.ts
var import_sequelize_typescript6 = require("sequelize-typescript");
var BasisVersionGueltigkeit = class extends import_sequelize_typescript6.Model {
};
__decorateClass([
  import_sequelize_typescript6.PrimaryKey,
  (0, import_sequelize_typescript6.Column)(import_sequelize_typescript6.DataType.INTEGER)
], BasisVersionGueltigkeit.prototype, "VER_GUELTIGKEIT", 2);
__decorateClass([
  import_sequelize_typescript6.PrimaryKey,
  (0, import_sequelize_typescript6.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript6.Column)(import_sequelize_typescript6.DataType.INTEGER)
], BasisVersionGueltigkeit.prototype, "BASIS_VERSION", 2);
__decorateClass([
  (0, import_sequelize_typescript6.BelongsTo)(() => BasisVersion)
], BasisVersionGueltigkeit.prototype, "basisVersion", 2);
BasisVersionGueltigkeit = __decorateClass([
  (0, import_sequelize_typescript6.Table)({
    timestamps: false,
    tableName: "BASIS_VER_GUELTIGKEIT"
  })
], BasisVersionGueltigkeit);

// src/models/VDV/RecAnr.ts
var import_sequelize_typescript7 = require("sequelize-typescript");
var RecAnr = class extends import_sequelize_typescript7.Model {
};
__decorateClass([
  import_sequelize_typescript7.PrimaryKey,
  (0, import_sequelize_typescript7.Column)(import_sequelize_typescript7.DataType.INTEGER)
], RecAnr.prototype, "ANR_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript7.Column)(import_sequelize_typescript7.DataType.STRING(200))
], RecAnr.prototype, "ANR_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript7.Column)(import_sequelize_typescript7.DataType.STRING(255))
], RecAnr.prototype, "ANR_DATEI", 2);
__decorateClass([
  import_sequelize_typescript7.PrimaryKey,
  (0, import_sequelize_typescript7.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript7.Column)({
    type: import_sequelize_typescript7.DataType.INTEGER,
    defaultValue: 1
  })
], RecAnr.prototype, "BASIS_VERSION", 2);
__decorateClass([
  (0, import_sequelize_typescript7.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], RecAnr.prototype, "basisVersion", 2);
RecAnr = __decorateClass([
  (0, import_sequelize_typescript7.Table)({
    tableName: "REC_ANR",
    timestamps: false
  })
], RecAnr);

// src/models/VDV/RecOrt.ts
var import_sequelize_typescript9 = require("sequelize-typescript");

// src/models/VDV/RecHp.ts
var import_sequelize_typescript8 = require("sequelize-typescript");
var RecHp = class extends import_sequelize_typescript8.Model {
  // @BelongsTo(() => Stop, { foreignKey: 'DHID', targetKey: 'id' })
  // stop?: Stop;
};
__decorateClass([
  import_sequelize_typescript8.PrimaryKey,
  (0, import_sequelize_typescript8.ForeignKey)(() => RecOrt),
  (0, import_sequelize_typescript8.Column)(import_sequelize_typescript8.DataType.INTEGER)
], RecHp.prototype, "ORT_NR", 2);
__decorateClass([
  import_sequelize_typescript8.PrimaryKey,
  (0, import_sequelize_typescript8.Column)({
    type: import_sequelize_typescript8.DataType.INTEGER,
    defaultValue: 1
  })
], RecHp.prototype, "ONR_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript8.BelongsTo)(() => RecOrt, {
    foreignKey: "ORT_NR",
    targetKey: "ORT_NR",
    as: "recOrt"
    // Note: Sequelize composite key association might need 'ONR_TYP_NR' too,
    // but simplistic approach often works if ORT_NR is unique enough or we define constraints loosely.
  })
], RecHp.prototype, "recOrt", 2);
__decorateClass([
  import_sequelize_typescript8.PrimaryKey,
  (0, import_sequelize_typescript8.Column)(import_sequelize_typescript8.DataType.INTEGER)
], RecHp.prototype, "HALTEPUNKT_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript8.Column)(import_sequelize_typescript8.DataType.STRING(40))
], RecHp.prototype, "ZUSATZ_INFO", 2);
__decorateClass([
  (0, import_sequelize_typescript8.Column)(import_sequelize_typescript8.DataType.STRING(40))
], RecHp.prototype, "DHID", 2);
__decorateClass([
  import_sequelize_typescript8.PrimaryKey,
  (0, import_sequelize_typescript8.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript8.Column)({
    type: import_sequelize_typescript8.DataType.INTEGER,
    defaultValue: 1
  })
], RecHp.prototype, "BASIS_VERSION", 2);
__decorateClass([
  (0, import_sequelize_typescript8.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], RecHp.prototype, "basisVersion", 2);
RecHp = __decorateClass([
  (0, import_sequelize_typescript8.Table)({
    timestamps: false,
    tableName: "REC_HP"
  })
], RecHp);

// src/models/VDV/RecOrt.ts
var RecOrt = class extends import_sequelize_typescript9.Model {
};
__decorateClass([
  import_sequelize_typescript9.PrimaryKey,
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.INTEGER)
], RecOrt.prototype, "ORT_NR", 2);
__decorateClass([
  import_sequelize_typescript9.PrimaryKey,
  (0, import_sequelize_typescript9.Column)({
    type: import_sequelize_typescript9.DataType.INTEGER,
    defaultValue: 1
    // Default to 1 (Stop/Haltestelle)? Need to confirm typical value.
  })
], RecOrt.prototype, "ONR_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.STRING(40))
], RecOrt.prototype, "ORT_NAME", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.INTEGER)
], RecOrt.prototype, "ORT_REF_ORT", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.INTEGER)
], RecOrt.prototype, "ORT_REF_ORT_TYP", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.INTEGER)
], RecOrt.prototype, "ORT_REF_ORT_LangNr", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.STRING(8))
], RecOrt.prototype, "ORT_REF_ORT_KUERZEL", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.STRING(40))
], RecOrt.prototype, "ORT_REF_ORT_NAME", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.INTEGER)
], RecOrt.prototype, "ZONE_WABE_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.DECIMAL(10, 0))
], RecOrt.prototype, "ORT_POS_LAENGE", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.DECIMAL(10, 0))
], RecOrt.prototype, "ORT_POS_BREITE", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.DECIMAL(10, 0))
], RecOrt.prototype, "ORT_POS_HOEHE", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.INTEGER)
], RecOrt.prototype, "ORT_RICHTUNG", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.INTEGER)
], RecOrt.prototype, "HAST_NR_LOKAL", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.INTEGER)
], RecOrt.prototype, "HST_NR_NATIONAL", 2);
__decorateClass([
  (0, import_sequelize_typescript9.Column)(import_sequelize_typescript9.DataType.STRING(30))
], RecOrt.prototype, "HST_NR_INTERNATIONAL", 2);
__decorateClass([
  import_sequelize_typescript9.PrimaryKey,
  (0, import_sequelize_typescript9.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript9.Column)({
    type: import_sequelize_typescript9.DataType.INTEGER,
    defaultValue: 1
  })
], RecOrt.prototype, "BASIS_VERSION", 2);
__decorateClass([
  (0, import_sequelize_typescript9.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], RecOrt.prototype, "basisVersion", 2);
__decorateClass([
  (0, import_sequelize_typescript9.HasMany)(() => RecHp)
], RecOrt.prototype, "recHps", 2);
__decorateClass([
  (0, import_sequelize_typescript9.BelongsTo)(() => RecOrt, { foreignKey: "ORT_REF_ORT", targetKey: "ORT_NR", as: "parentOrt", constraints: false })
], RecOrt.prototype, "parentOrt", 2);
__decorateClass([
  (0, import_sequelize_typescript9.HasMany)(() => RecOrt, { foreignKey: "ORT_REF_ORT", sourceKey: "ORT_NR", as: "subOrts", constraints: false })
], RecOrt.prototype, "subOrts", 2);
RecOrt = __decorateClass([
  (0, import_sequelize_typescript9.Table)({
    tableName: "REC_ORT",
    timestamps: false
  })
], RecOrt);

// src/models/VDV/LidVerlauf.ts
var import_sequelize_typescript10 = require("sequelize-typescript");
var LidVerlauf = class extends import_sequelize_typescript10.Model {
};
__decorateClass([
  import_sequelize_typescript10.PrimaryKey,
  (0, import_sequelize_typescript10.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript10.Column)({
    type: import_sequelize_typescript10.DataType.INTEGER,
    defaultValue: 1
  })
], LidVerlauf.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript10.PrimaryKey,
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.INTEGER)
], LidVerlauf.prototype, "LI_LFD_NR", 2);
__decorateClass([
  import_sequelize_typescript10.PrimaryKey,
  (0, import_sequelize_typescript10.ForeignKey)(() => RecLid),
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.INTEGER)
], LidVerlauf.prototype, "LI_NR", 2);
__decorateClass([
  import_sequelize_typescript10.PrimaryKey,
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.STRING(6))
], LidVerlauf.prototype, "STR_LI_VAR", 2);
__decorateClass([
  (0, import_sequelize_typescript10.ForeignKey)(() => RecHp),
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.INTEGER)
], LidVerlauf.prototype, "ONR_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript10.ForeignKey)(() => RecHp),
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.INTEGER)
], LidVerlauf.prototype, "ORT_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.INTEGER)
], LidVerlauf.prototype, "ZNR_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.INTEGER)
], LidVerlauf.prototype, "ANR_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.INTEGER)
], LidVerlauf.prototype, "EINFANGBEREICH", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.BOOLEAN)
], LidVerlauf.prototype, "LI_KNOTEN", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.BOOLEAN)
], LidVerlauf.prototype, "PRODUKTIV", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.BOOLEAN)
], LidVerlauf.prototype, "EINSTEIGEVERBOT", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.BOOLEAN)
], LidVerlauf.prototype, "AUSSTEIGEVERBOT", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.BOOLEAN)
], LidVerlauf.prototype, "INNERORTSVERBOT", 2);
__decorateClass([
  (0, import_sequelize_typescript10.Column)(import_sequelize_typescript10.DataType.BOOLEAN)
], LidVerlauf.prototype, "BEDARFSHALT", 2);
__decorateClass([
  (0, import_sequelize_typescript10.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], LidVerlauf.prototype, "basisVersion", 2);
__decorateClass([
  (0, import_sequelize_typescript10.BelongsTo)(() => RecLid, { foreignKey: "LI_NR", targetKey: "LI_NR" })
], LidVerlauf.prototype, "line", 2);
__decorateClass([
  (0, import_sequelize_typescript10.BelongsTo)(() => RecOrt, { foreignKey: "ORT_NR", targetKey: "ORT_NR", as: "ort" })
], LidVerlauf.prototype, "ort", 2);
LidVerlauf = __decorateClass([
  (0, import_sequelize_typescript10.Table)({
    tableName: "LID_VERLAUF",
    timestamps: false
  })
], LidVerlauf);

// src/models/VDV/RecUeb.ts
var import_sequelize_typescript12 = require("sequelize-typescript");

// src/models/VDV/UebFzt.ts
var import_sequelize_typescript11 = require("sequelize-typescript");
var UebFzt = class extends import_sequelize_typescript11.Model {
};
__decorateClass([
  import_sequelize_typescript11.PrimaryKey,
  (0, import_sequelize_typescript11.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript11.Column)({
    type: import_sequelize_typescript11.DataType.INTEGER,
    defaultValue: 1
  })
], UebFzt.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript11.PrimaryKey,
  (0, import_sequelize_typescript11.ForeignKey)(() => RecUeb),
  (0, import_sequelize_typescript11.Column)(import_sequelize_typescript11.DataType.INTEGER)
], UebFzt.prototype, "BEREICH_NR", 2);
__decorateClass([
  import_sequelize_typescript11.PrimaryKey,
  (0, import_sequelize_typescript11.Column)(import_sequelize_typescript11.DataType.INTEGER)
], UebFzt.prototype, "FGR_NR", 2);
__decorateClass([
  import_sequelize_typescript11.PrimaryKey,
  (0, import_sequelize_typescript11.Column)(import_sequelize_typescript11.DataType.INTEGER)
], UebFzt.prototype, "TAGESART_NR", 2);
__decorateClass([
  import_sequelize_typescript11.PrimaryKey,
  (0, import_sequelize_typescript11.ForeignKey)(() => RecUeb),
  (0, import_sequelize_typescript11.Column)(import_sequelize_typescript11.DataType.INTEGER)
], UebFzt.prototype, "ONR_TYP_NR", 2);
__decorateClass([
  import_sequelize_typescript11.PrimaryKey,
  (0, import_sequelize_typescript11.ForeignKey)(() => RecUeb),
  (0, import_sequelize_typescript11.Column)(import_sequelize_typescript11.DataType.INTEGER)
], UebFzt.prototype, "ORT_NR", 2);
__decorateClass([
  import_sequelize_typescript11.PrimaryKey,
  (0, import_sequelize_typescript11.ForeignKey)(() => RecUeb),
  (0, import_sequelize_typescript11.Column)(import_sequelize_typescript11.DataType.INTEGER)
], UebFzt.prototype, "UEB_ZIEL_TYP", 2);
__decorateClass([
  import_sequelize_typescript11.PrimaryKey,
  (0, import_sequelize_typescript11.ForeignKey)(() => RecUeb),
  (0, import_sequelize_typescript11.Column)(import_sequelize_typescript11.DataType.INTEGER)
], UebFzt.prototype, "UEB_ZIEL", 2);
__decorateClass([
  (0, import_sequelize_typescript11.Column)(import_sequelize_typescript11.DataType.INTEGER)
], UebFzt.prototype, "UEB_FAHRZEIT", 2);
__decorateClass([
  (0, import_sequelize_typescript11.BelongsTo)(() => RecUeb, {
    foreignKey: "BASIS_VERSION",
    // Simplification, composite key logic in Sequelize is tricky, usually handled by matching all PKs manually
    targetKey: "BASIS_VERSION",
    constraints: false
  })
], UebFzt.prototype, "recUeb", 2);
UebFzt = __decorateClass([
  (0, import_sequelize_typescript11.Table)({
    tableName: "UEB_FZT",
    timestamps: false
  })
], UebFzt);

// src/models/VDV/RecUeb.ts
var RecUeb = class extends import_sequelize_typescript12.Model {
};
__decorateClass([
  import_sequelize_typescript12.PrimaryKey,
  (0, import_sequelize_typescript12.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript12.Column)({
    type: import_sequelize_typescript12.DataType.INTEGER,
    defaultValue: 1
  })
], RecUeb.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript12.PrimaryKey,
  (0, import_sequelize_typescript12.Column)(import_sequelize_typescript12.DataType.INTEGER)
], RecUeb.prototype, "BEREICH_NR", 2);
__decorateClass([
  import_sequelize_typescript12.PrimaryKey,
  (0, import_sequelize_typescript12.Column)(import_sequelize_typescript12.DataType.INTEGER)
], RecUeb.prototype, "ONR_TYP_NR", 2);
__decorateClass([
  import_sequelize_typescript12.PrimaryKey,
  (0, import_sequelize_typescript12.Column)(import_sequelize_typescript12.DataType.INTEGER)
], RecUeb.prototype, "ORT_NR", 2);
__decorateClass([
  import_sequelize_typescript12.PrimaryKey,
  (0, import_sequelize_typescript12.Column)(import_sequelize_typescript12.DataType.INTEGER)
], RecUeb.prototype, "UEB_ZIEL_TYP", 2);
__decorateClass([
  import_sequelize_typescript12.PrimaryKey,
  (0, import_sequelize_typescript12.Column)(import_sequelize_typescript12.DataType.INTEGER)
], RecUeb.prototype, "UEB_ZIEL", 2);
__decorateClass([
  (0, import_sequelize_typescript12.Column)(import_sequelize_typescript12.DataType.INTEGER)
], RecUeb.prototype, "UEB_LAENGE", 2);
__decorateClass([
  (0, import_sequelize_typescript12.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], RecUeb.prototype, "basisVersion", 2);
__decorateClass([
  (0, import_sequelize_typescript12.HasMany)(() => UebFzt, {
    foreignKey: "BASIS_VERSION",
    sourceKey: "BASIS_VERSION",
    constraints: false
  })
], RecUeb.prototype, "uebFzts", 2);
RecUeb = __decorateClass([
  (0, import_sequelize_typescript12.Table)({
    tableName: "REC_UEB",
    timestamps: false
  })
], RecUeb);

// src/models/VDV/RecUmlauf.ts
var import_sequelize_typescript14 = require("sequelize-typescript");

// src/models/VDV/RecFrt.ts
var import_sequelize_typescript13 = require("sequelize-typescript");
var RecFrt = class extends import_sequelize_typescript13.Model {
  // Trip Type (MENGE_FAHRTART)
  // Add more fields as needed per XSD
};
__decorateClass([
  import_sequelize_typescript13.PrimaryKey,
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript13.PrimaryKey,
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "FRT_FID", 2);
__decorateClass([
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "FRT_START", 2);
__decorateClass([
  (0, import_sequelize_typescript13.ForeignKey)(() => RecLid),
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "LI_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript13.ForeignKey)(() => RecUmlauf),
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "UM_UID", 2);
__decorateClass([
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "TAGESART_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "FGR_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.STRING(6))
], RecFrt.prototype, "STR_LI_VAR", 2);
__decorateClass([
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "ZUGNR", 2);
__decorateClass([
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "LI_KU_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "BEREICH_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript13.Column)(import_sequelize_typescript13.DataType.INTEGER)
], RecFrt.prototype, "FAHRTART_NR", 2);
RecFrt = __decorateClass([
  (0, import_sequelize_typescript13.Table)({
    tableName: "REC_FRT",
    timestamps: false
  })
], RecFrt);

// src/models/VDV/RecUmlauf.ts
var RecUmlauf = class extends import_sequelize_typescript14.Model {
};
__decorateClass([
  import_sequelize_typescript14.PrimaryKey,
  (0, import_sequelize_typescript14.Column)(import_sequelize_typescript14.DataType.INTEGER)
], RecUmlauf.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript14.PrimaryKey,
  (0, import_sequelize_typescript14.Column)(import_sequelize_typescript14.DataType.INTEGER)
], RecUmlauf.prototype, "TAGESART_NR", 2);
__decorateClass([
  import_sequelize_typescript14.PrimaryKey,
  (0, import_sequelize_typescript14.Column)(import_sequelize_typescript14.DataType.INTEGER)
], RecUmlauf.prototype, "UM_UID", 2);
__decorateClass([
  (0, import_sequelize_typescript14.Column)(import_sequelize_typescript14.DataType.INTEGER)
], RecUmlauf.prototype, "ANF_ORT", 2);
__decorateClass([
  (0, import_sequelize_typescript14.Column)(import_sequelize_typescript14.DataType.INTEGER)
], RecUmlauf.prototype, "ANF_ONR_TYP", 2);
__decorateClass([
  (0, import_sequelize_typescript14.Column)(import_sequelize_typescript14.DataType.INTEGER)
], RecUmlauf.prototype, "END_ORT", 2);
__decorateClass([
  (0, import_sequelize_typescript14.Column)(import_sequelize_typescript14.DataType.INTEGER)
], RecUmlauf.prototype, "END_ONR_TYP", 2);
__decorateClass([
  (0, import_sequelize_typescript14.Column)(import_sequelize_typescript14.DataType.INTEGER)
], RecUmlauf.prototype, "FZG_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript14.HasMany)(() => RecFrt, {
    foreignKey: "UM_UID",
    sourceKey: "UM_UID",
    constraints: false
  })
], RecUmlauf.prototype, "trips", 2);
RecUmlauf = __decorateClass([
  (0, import_sequelize_typescript14.Table)({
    tableName: "REC_UMLAUF",
    timestamps: false
  })
], RecUmlauf);

// src/models/VDV/RecUms.ts
var import_sequelize_typescript16 = require("sequelize-typescript");

// src/models/VDV/Einzelanschluss.ts
var import_sequelize_typescript15 = require("sequelize-typescript");
var Einzelanschluss = class extends import_sequelize_typescript15.Model {
  // Relation helps for eager loading names if needed, though composite keys make it tricky
};
__decorateClass([
  import_sequelize_typescript15.PrimaryKey,
  (0, import_sequelize_typescript15.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript15.Column)({
    type: import_sequelize_typescript15.DataType.INTEGER,
    defaultValue: 1
  })
], Einzelanschluss.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript15.PrimaryKey,
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "EINAN_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.CHAR(40))
], Einzelanschluss.prototype, "ANSCHLUSS_NAME", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.CHAR(6))
], Einzelanschluss.prototype, "ANSCHLUSS_GRUPPE", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)({
    type: import_sequelize_typescript15.DataType.INTEGER,
    defaultValue: 0
  })
], Einzelanschluss.prototype, "LEITSTELLENKENNUNG", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ZUB_LI_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ZUB_LI_RI_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.ForeignKey)(() => RecOrt),
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ZUB_ORT_REF_ORT", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ZUB_ONR_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ZUB_ORT_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "VON_ORT_REF_ORT", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ABB_LI_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ABB_LI_RI_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.ForeignKey)(() => RecOrt),
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ABB_ORT_REF_ORT", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ABB_ONR_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "ABB_ORT_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.INTEGER)
], Einzelanschluss.prototype, "NACH_ORT_REF_ORT", 2);
__decorateClass([
  (0, import_sequelize_typescript15.Column)(import_sequelize_typescript15.DataType.CHAR(10))
], Einzelanschluss.prototype, "ASBID", 2);
__decorateClass([
  (0, import_sequelize_typescript15.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], Einzelanschluss.prototype, "basisVersion", 2);
__decorateClass([
  (0, import_sequelize_typescript15.HasMany)(() => RecUms, {
    foreignKey: "EINAN_NR",
    sourceKey: "EINAN_NR",
    constraints: false
  })
], Einzelanschluss.prototype, "recUms", 2);
Einzelanschluss = __decorateClass([
  (0, import_sequelize_typescript15.Table)({
    tableName: "EINZELANSCHLUSS",
    timestamps: false
  })
], Einzelanschluss);

// src/models/VDV/RecUms.ts
var RecUms = class extends import_sequelize_typescript16.Model {
};
__decorateClass([
  import_sequelize_typescript16.PrimaryKey,
  (0, import_sequelize_typescript16.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript16.Column)({
    type: import_sequelize_typescript16.DataType.INTEGER,
    defaultValue: 1
  })
], RecUms.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript16.PrimaryKey,
  (0, import_sequelize_typescript16.ForeignKey)(() => Einzelanschluss),
  (0, import_sequelize_typescript16.Column)(import_sequelize_typescript16.DataType.INTEGER)
], RecUms.prototype, "EINAN_NR", 2);
__decorateClass([
  import_sequelize_typescript16.PrimaryKey,
  (0, import_sequelize_typescript16.Column)(import_sequelize_typescript16.DataType.INTEGER)
], RecUms.prototype, "TAGESART_NR", 2);
__decorateClass([
  import_sequelize_typescript16.PrimaryKey,
  (0, import_sequelize_typescript16.Column)(import_sequelize_typescript16.DataType.INTEGER)
], RecUms.prototype, "UMS_BEGINN", 2);
__decorateClass([
  import_sequelize_typescript16.PrimaryKey,
  (0, import_sequelize_typescript16.Column)(import_sequelize_typescript16.DataType.INTEGER)
], RecUms.prototype, "UMS_ENDE", 2);
__decorateClass([
  (0, import_sequelize_typescript16.Column)(import_sequelize_typescript16.DataType.INTEGER)
], RecUms.prototype, "UMS_MIN", 2);
__decorateClass([
  (0, import_sequelize_typescript16.Column)({
    type: import_sequelize_typescript16.DataType.INTEGER,
    defaultValue: 65532
  })
], RecUms.prototype, "UMS_MAX", 2);
__decorateClass([
  (0, import_sequelize_typescript16.Column)({
    type: import_sequelize_typescript16.DataType.INTEGER,
    defaultValue: 65532
  })
], RecUms.prototype, "MAX_VERZ_MAN", 2);
__decorateClass([
  (0, import_sequelize_typescript16.Column)({
    type: import_sequelize_typescript16.DataType.INTEGER,
    defaultValue: 65532
  })
], RecUms.prototype, "MAX_VERZ_AUTO", 2);
__decorateClass([
  (0, import_sequelize_typescript16.BelongsTo)(() => Einzelanschluss, {
    foreignKey: "EINAN_NR",
    targetKey: "EINAN_NR",
    constraints: false
  })
], RecUms.prototype, "einzelanschluss", 2);
RecUms = __decorateClass([
  (0, import_sequelize_typescript16.Table)({
    tableName: "REC_UMS",
    timestamps: false
  })
], RecUms);

// src/models/VDV/RecSel.ts
var import_sequelize_typescript17 = require("sequelize-typescript");
var RecSel = class extends import_sequelize_typescript17.Model {
  // Fahrgast Group (Optional, def 0)
};
__decorateClass([
  import_sequelize_typescript17.PrimaryKey,
  (0, import_sequelize_typescript17.Column)(import_sequelize_typescript17.DataType.INTEGER)
], RecSel.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript17.PrimaryKey,
  (0, import_sequelize_typescript17.Column)({
    type: import_sequelize_typescript17.DataType.INTEGER,
    defaultValue: 1
  })
], RecSel.prototype, "BEREICH_NR", 2);
__decorateClass([
  import_sequelize_typescript17.PrimaryKey,
  (0, import_sequelize_typescript17.Column)(import_sequelize_typescript17.DataType.INTEGER)
], RecSel.prototype, "ONR_TYP_NR", 2);
__decorateClass([
  import_sequelize_typescript17.PrimaryKey,
  (0, import_sequelize_typescript17.Column)(import_sequelize_typescript17.DataType.INTEGER)
], RecSel.prototype, "ORT_NR", 2);
__decorateClass([
  import_sequelize_typescript17.PrimaryKey,
  (0, import_sequelize_typescript17.Column)(import_sequelize_typescript17.DataType.INTEGER)
], RecSel.prototype, "SEL_ZIEL", 2);
__decorateClass([
  import_sequelize_typescript17.PrimaryKey,
  (0, import_sequelize_typescript17.Column)(import_sequelize_typescript17.DataType.INTEGER)
], RecSel.prototype, "SEL_ZIEL_TYP", 2);
__decorateClass([
  (0, import_sequelize_typescript17.Column)(import_sequelize_typescript17.DataType.INTEGER)
], RecSel.prototype, "SEL_FZT", 2);
__decorateClass([
  (0, import_sequelize_typescript17.Column)(import_sequelize_typescript17.DataType.INTEGER)
], RecSel.prototype, "SEL_LAENGE", 2);
__decorateClass([
  (0, import_sequelize_typescript17.Column)(import_sequelize_typescript17.DataType.INTEGER)
], RecSel.prototype, "FGR_NR", 2);
RecSel = __decorateClass([
  (0, import_sequelize_typescript17.Table)({
    tableName: "REC_SEL",
    timestamps: false
  })
], RecSel);

// src/models/VDV/MengeFzgTyp.ts
var import_sequelize_typescript19 = require("sequelize-typescript");

// src/models/VDV/Fahrzeug.ts
var import_sequelize_typescript18 = require("sequelize-typescript");
var Fahrzeug = class extends import_sequelize_typescript18.Model {
};
__decorateClass([
  import_sequelize_typescript18.PrimaryKey,
  (0, import_sequelize_typescript18.Column)(import_sequelize_typescript18.DataType.INTEGER)
], Fahrzeug.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript18.PrimaryKey,
  (0, import_sequelize_typescript18.Column)(import_sequelize_typescript18.DataType.INTEGER)
], Fahrzeug.prototype, "FZG_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript18.ForeignKey)(() => MengeFzgTyp),
  (0, import_sequelize_typescript18.Column)(import_sequelize_typescript18.DataType.INTEGER)
], Fahrzeug.prototype, "FZG_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript18.Column)(import_sequelize_typescript18.DataType.INTEGER)
], Fahrzeug.prototype, "UNTERNEHMEN", 2);
__decorateClass([
  (0, import_sequelize_typescript18.Column)(import_sequelize_typescript18.DataType.STRING(40))
], Fahrzeug.prototype, "FZG_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript18.Column)(import_sequelize_typescript18.DataType.STRING(20))
], Fahrzeug.prototype, "POLKENN", 2);
__decorateClass([
  (0, import_sequelize_typescript18.Column)(import_sequelize_typescript18.DataType.STRING(17))
], Fahrzeug.prototype, "FIN", 2);
__decorateClass([
  (0, import_sequelize_typescript18.BelongsTo)(() => MengeFzgTyp, {
    foreignKey: "FZG_TYP_NR",
    targetKey: "FZG_TYP_NR",
    constraints: false
  })
], Fahrzeug.prototype, "type", 2);
Fahrzeug = __decorateClass([
  (0, import_sequelize_typescript18.Table)({
    tableName: "FAHRZEUG",
    timestamps: false
  })
], Fahrzeug);

// src/models/VDV/MengeFzgTyp.ts
var MengeFzgTyp = class extends import_sequelize_typescript19.Model {
};
__decorateClass([
  import_sequelize_typescript19.PrimaryKey,
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript19.PrimaryKey,
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "FZG_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.STRING(40))
], MengeFzgTyp.prototype, "FZG_TYP_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "FZG_LAENGE", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "FZG_TYP_BREITE", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "FZG_TYP_HOEHE", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "FZG_TYP_GEWICHT", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "FZG_TYP_SITZ", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "FZG_TYP_STEH", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "SONDER_PLATZ", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.STRING(6))
], MengeFzgTyp.prototype, "STR_FZG_TYP", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "BATTERIE_TYP_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "VERBRAUCH_DISTANZ", 2);
__decorateClass([
  (0, import_sequelize_typescript19.Column)(import_sequelize_typescript19.DataType.INTEGER)
], MengeFzgTyp.prototype, "VERBRAUCH_ZEIT", 2);
__decorateClass([
  (0, import_sequelize_typescript19.HasMany)(() => Fahrzeug, {
    foreignKey: "FZG_TYP_NR",
    sourceKey: "FZG_TYP_NR",
    constraints: false
  })
], MengeFzgTyp.prototype, "vehicles", 2);
MengeFzgTyp = __decorateClass([
  (0, import_sequelize_typescript19.Table)({
    tableName: "MENGE_FZG_TYP",
    timestamps: false
  })
], MengeFzgTyp);

// src/models/VDV/RecOm.ts
var import_sequelize_typescript20 = require("sequelize-typescript");
var RecOm = class extends import_sequelize_typescript20.Model {
};
__decorateClass([
  import_sequelize_typescript20.PrimaryKey,
  (0, import_sequelize_typescript20.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript20.Column)({
    type: import_sequelize_typescript20.DataType.INTEGER,
    defaultValue: 1
  })
], RecOm.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript20.PrimaryKey,
  (0, import_sequelize_typescript20.Column)(import_sequelize_typescript20.DataType.INTEGER)
], RecOm.prototype, "ONR_TYP_NR", 2);
__decorateClass([
  import_sequelize_typescript20.PrimaryKey,
  (0, import_sequelize_typescript20.ForeignKey)(() => RecOrt),
  (0, import_sequelize_typescript20.Column)(import_sequelize_typescript20.DataType.INTEGER)
], RecOm.prototype, "ORT_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript20.Column)(import_sequelize_typescript20.DataType.STRING(6))
], RecOm.prototype, "ORM_KUERZEL", 2);
__decorateClass([
  (0, import_sequelize_typescript20.Column)(import_sequelize_typescript20.DataType.INTEGER)
], RecOm.prototype, "ORMACODE", 2);
__decorateClass([
  (0, import_sequelize_typescript20.Column)(import_sequelize_typescript20.DataType.STRING(40))
], RecOm.prototype, "ORM_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript20.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], RecOm.prototype, "basisVersion", 2);
__decorateClass([
  (0, import_sequelize_typescript20.BelongsTo)(() => RecOrt, { foreignKey: "ORT_NR", targetKey: "ORT_NR", constraints: false })
], RecOm.prototype, "ort", 2);
RecOm = __decorateClass([
  (0, import_sequelize_typescript20.Table)({
    tableName: "REC_OM",
    timestamps: false
  })
], RecOm);

// src/models/VDV/MengeBereich.ts
var import_sequelize_typescript21 = require("sequelize-typescript");
var MengeBereich = class extends import_sequelize_typescript21.Model {
};
__decorateClass([
  import_sequelize_typescript21.PrimaryKey,
  (0, import_sequelize_typescript21.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript21.Column)({
    type: import_sequelize_typescript21.DataType.INTEGER,
    defaultValue: 1
  })
], MengeBereich.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript21.PrimaryKey,
  (0, import_sequelize_typescript21.Column)(import_sequelize_typescript21.DataType.INTEGER)
], MengeBereich.prototype, "BEREICH_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript21.Column)(import_sequelize_typescript21.DataType.STRING(6))
], MengeBereich.prototype, "STR_BEREICH", 2);
__decorateClass([
  (0, import_sequelize_typescript21.Column)(import_sequelize_typescript21.DataType.STRING(40))
], MengeBereich.prototype, "BEREICH_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript21.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], MengeBereich.prototype, "basisVersion", 2);
MengeBereich = __decorateClass([
  (0, import_sequelize_typescript21.Table)({
    tableName: "MENGE_BEREICH",
    timestamps: false
  })
], MengeBereich);

// src/models/VDV/MengeFgr.ts
var import_sequelize_typescript22 = require("sequelize-typescript");
var MengeFgr = class extends import_sequelize_typescript22.Model {
};
__decorateClass([
  import_sequelize_typescript22.PrimaryKey,
  (0, import_sequelize_typescript22.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript22.Column)({
    type: import_sequelize_typescript22.DataType.INTEGER,
    defaultValue: 1
  })
], MengeFgr.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript22.PrimaryKey,
  (0, import_sequelize_typescript22.Column)(import_sequelize_typescript22.DataType.INTEGER)
], MengeFgr.prototype, "FGR_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript22.Column)(import_sequelize_typescript22.DataType.STRING(10))
], MengeFgr.prototype, "STR_FGR", 2);
__decorateClass([
  (0, import_sequelize_typescript22.Column)(import_sequelize_typescript22.DataType.STRING(40))
], MengeFgr.prototype, "FGR_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript22.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], MengeFgr.prototype, "basisVersion", 2);
MengeFgr = __decorateClass([
  (0, import_sequelize_typescript22.Table)({
    tableName: "MENGE_FGR",
    timestamps: false
  })
], MengeFgr);

// src/models/VDV/MengeFahrtart.ts
var import_sequelize_typescript23 = require("sequelize-typescript");
var MengeFahrtart = class extends import_sequelize_typescript23.Model {
};
__decorateClass([
  import_sequelize_typescript23.PrimaryKey,
  (0, import_sequelize_typescript23.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript23.Column)({
    type: import_sequelize_typescript23.DataType.INTEGER,
    defaultValue: 1
  })
], MengeFahrtart.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript23.PrimaryKey,
  (0, import_sequelize_typescript23.Column)(import_sequelize_typescript23.DataType.INTEGER)
], MengeFahrtart.prototype, "FAHRTART_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript23.Column)(import_sequelize_typescript23.DataType.STRING(6))
], MengeFahrtart.prototype, "STR_FAHRTART", 2);
__decorateClass([
  (0, import_sequelize_typescript23.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], MengeFahrtart.prototype, "basisVersion", 2);
MengeFahrtart = __decorateClass([
  (0, import_sequelize_typescript23.Table)({
    tableName: "MENGE_FAHRTART",
    timestamps: false
  })
], MengeFahrtart);

// src/models/VDV/MengeBhof.ts
var import_sequelize_typescript24 = require("sequelize-typescript");
var MengeBhof = class extends import_sequelize_typescript24.Model {
};
__decorateClass([
  import_sequelize_typescript24.PrimaryKey,
  (0, import_sequelize_typescript24.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript24.Column)({
    type: import_sequelize_typescript24.DataType.INTEGER,
    defaultValue: 1
  })
], MengeBhof.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript24.PrimaryKey,
  (0, import_sequelize_typescript24.Column)(import_sequelize_typescript24.DataType.INTEGER)
], MengeBhof.prototype, "BHOF_NR", 2);
__decorateClass([
  (0, import_sequelize_typescript24.Column)(import_sequelize_typescript24.DataType.STRING(32))
], MengeBhof.prototype, "BHOF_TEXT", 2);
__decorateClass([
  (0, import_sequelize_typescript24.Column)(import_sequelize_typescript24.DataType.STRING(10))
], MengeBhof.prototype, "STR_BHOF", 2);
__decorateClass([
  (0, import_sequelize_typescript24.BelongsTo)(() => BasisVersion, { foreignKey: "BASIS_VERSION", targetKey: "BASIS_VERSION", constraints: false })
], MengeBhof.prototype, "basisVersion", 2);
MengeBhof = __decorateClass([
  (0, import_sequelize_typescript24.Table)({
    tableName: "MENGE_BHOF",
    timestamps: false
  })
], MengeBhof);

// src/models/VDV/RecSelFztFeld.ts
var import_sequelize_typescript25 = require("sequelize-typescript");
var RecSelFztFeld = class extends import_sequelize_typescript25.Model {
};
__decorateClass([
  import_sequelize_typescript25.PrimaryKey,
  (0, import_sequelize_typescript25.ForeignKey)(() => BasisVersion),
  (0, import_sequelize_typescript25.Column)({
    type: import_sequelize_typescript25.DataType.INTEGER,
    defaultValue: 1
  })
], RecSelFztFeld.prototype, "BASIS_VERSION", 2);
__decorateClass([
  import_sequelize_typescript25.PrimaryKey,
  (0, import_sequelize_typescript25.ForeignKey)(() => MengeBereich),
  (0, import_sequelize_typescript25.Column)(import_sequelize_typescript25.DataType.INTEGER)
], RecSelFztFeld.prototype, "BEREICH_NR", 2);
__decorateClass([
  import_sequelize_typescript25.PrimaryKey,
  (0, import_sequelize_typescript25.Column)({
    type: import_sequelize_typescript25.DataType.INTEGER,
    defaultValue: 1
  })
], RecSelFztFeld.prototype, "FGR_NR", 2);
__decorateClass([
  import_sequelize_typescript25.PrimaryKey,
  (0, import_sequelize_typescript25.ForeignKey)(() => RecSel),
  (0, import_sequelize_typescript25.Column)(import_sequelize_typescript25.DataType.INTEGER)
], RecSelFztFeld.prototype, "ONR_TYP_NR", 2);
__decorateClass([
  import_sequelize_typescript25.PrimaryKey,
  (0, import_sequelize_typescript25.ForeignKey)(() => RecSel),
  (0, import_sequelize_typescript25.Column)(import_sequelize_typescript25.DataType.INTEGER)
], RecSelFztFeld.prototype, "ORT_NR", 2);
__decorateClass([
  import_sequelize_typescript25.PrimaryKey,
  (0, import_sequelize_typescript25.ForeignKey)(() => RecSel),
  (0, import_sequelize_typescript25.Column)(import_sequelize_typescript25.DataType.INTEGER)
], RecSelFztFeld.prototype, "SEL_ZIEL", 2);
__decorateClass([
  import_sequelize_typescript25.PrimaryKey,
  (0, import_sequelize_typescript25.ForeignKey)(() => RecSel),
  (0, import_sequelize_typescript25.Column)(import_sequelize_typescript25.DataType.INTEGER)
], RecSelFztFeld.prototype, "SEL_ZIEL_TYP", 2);
__decorateClass([
  (0, import_sequelize_typescript25.Column)(import_sequelize_typescript25.DataType.INTEGER)
], RecSelFztFeld.prototype, "SEL_FZT", 2);
__decorateClass([
  (0, import_sequelize_typescript25.BelongsTo)(() => MengeBereich, {
    foreignKey: "BEREICH_NR",
    targetKey: "BEREICH_NR",
    // Simplified, should be composite
    constraints: false
  })
], RecSelFztFeld.prototype, "mengeBereich", 2);
__decorateClass([
  (0, import_sequelize_typescript25.BelongsTo)(() => RecSel, {
    foreignKey: "ORT_NR",
    // Simplified, Sequelize has trouble with multi-col FKs this complex without explicit definition
    constraints: false
  })
], RecSelFztFeld.prototype, "recSel", 2);
RecSelFztFeld = __decorateClass([
  (0, import_sequelize_typescript25.Table)({
    tableName: "SEL_FZT_FELD",
    timestamps: false
  })
], RecSelFztFeld);

// src/config/database.ts
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var dbPath = process.env.DB_FILE || "data/timetable.sqlite3";
var dbDir = import_path.default.dirname(dbPath);
if (!import_fs.default.existsSync(dbDir)) {
  console.log(`[Database] Directory ${dbDir} does not exist. Creating...`);
  import_fs.default.mkdirSync(dbDir, { recursive: true });
}
var sequelize = new import_sequelize_typescript26.Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  models: [
    RecLid,
    RecZnr,
    BasisVersion,
    Tagesart,
    Betriebstag,
    BasisVersionGueltigkeit,
    RecAnr,
    RecOrt,
    RecHp,
    LidVerlauf,
    RecUeb,
    UebFzt,
    RecUmlauf,
    RecFrt,
    RecUms,
    RecSel,
    MengeFzgTyp,
    Fahrzeug,
    RecOm,
    MengeBereich,
    MengeFgr,
    MengeFahrtart,
    MengeBhof,
    RecSelFztFeld,
    Einzelanschluss
  ],
  logging: console.log
});
var initDB = async () => {
  await sequelize.sync({
    alter: {
      drop: false
    }
  });
};

// src/workers/gtfs-import.worker.ts
var { parentPort, workerData } = require("worker_threads");
var reportProgress = (stage, current, total, details = "", completed = false) => {
  if (parentPort) {
    parentPort.postMessage({
      type: "progress",
      payload: {
        stage,
        current,
        total,
        details,
        completed
      }
    });
  }
};
var readCsv = async (zip, filename) => {
  const entry = zip.getEntry(filename);
  if (!entry) return [];
  const content = zip.readAsText(entry);
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = (0, import_parse.parse)({ headers: true }).on("error", (error) => reject(error)).on("data", (row) => rows.push(row)).on("end", () => resolve(rows));
    stream.write(content);
    stream.end();
  });
};
var timeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(":");
  if (parts.length !== 3) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parseInt(parts[2], 10);
  return h * 3600 + m * 60 + s;
};
var runImport = async () => {
  try {
    console.log("[GTFS Worker] Starting...");
    const { tempFile, agencyId, basisVersion, importId } = workerData;
    console.log(`[GTFS Worker] ImportID: ${importId}, File: ${tempFile}`);
    if (parentPort) parentPort.postMessage({ type: "progress", payload: { stage: "Worker Started", current: 0, total: 100, details: "Initializing...", completed: false } });
    const filePath = import_path2.default.join(process.cwd(), "uploads", tempFile);
    console.log("[GTFS Worker] Initializing DB...");
    await initDB();
    console.log("[GTFS Worker] DB Initialized.");
    if (!import_fs2.default.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    reportProgress("Initialisierung", 0, 1, "File loading...");
    const zip = new import_adm_zip.default(filePath);
    const BASIS_VERSION = Number(basisVersion);
    let validityDate;
    try {
      const feedInfo = await readCsv(zip, "feed_info.txt");
      if (feedInfo.length > 0 && feedInfo[0].feed_start_date) {
        const dStr = feedInfo[0].feed_start_date;
        const year = parseInt(dStr.substring(0, 4));
        const month = parseInt(dStr.substring(4, 6)) - 1;
        const day = parseInt(dStr.substring(6, 8));
        validityDate = new Date(year, month, day);
      } else {
        const calendar = await readCsv(zip, "calendar.txt");
        if (calendar.length > 0) {
          const minDate = calendar.reduce((min, c) => {
            return !min || c.start_date < min ? c.start_date : min;
          }, "");
          if (minDate) {
            const year = parseInt(minDate.substring(0, 4));
            const month = parseInt(minDate.substring(4, 6)) - 1;
            const day = parseInt(minDate.substring(6, 8));
            validityDate = new Date(year, month, day);
          }
        }
      }
    } catch (e) {
      console.warn("[GTFS Worker] Could not determining validity date:", e);
    }
    await BasisVersion.upsert({
      BASIS_VERSION,
      BASIS_VERSION_TEXT: `Version ${BASIS_VERSION}`,
      GUELTIG_AB: validityDate
    });
    reportProgress("Reading Routes", 0, 100);
    const allRoutes = await readCsv(zip, "routes.txt");
    const agencyRoutes = allRoutes.filter((r) => {
      if (!r.agency_id) return true;
      return String(r.agency_id).trim() === String(agencyId).trim();
    });
    const routeIds = new Set(agencyRoutes.map((r) => r.route_id));
    reportProgress("Reading Trips", 0, 100);
    const allTrips = await readCsv(zip, "trips.txt");
    const agencyTrips = allTrips.filter((t) => routeIds.has(t.route_id));
    const tripIds = new Set(agencyTrips.map((t) => t.trip_id));
    reportProgress("Reading StopTimes", 0, 100);
    const allStopTimes = await readCsv(zip, "stop_times.txt");
    const agencyStopTimes = allStopTimes.filter((st) => tripIds.has(st.trip_id));
    const usedStopIds = /* @__PURE__ */ new Set();
    const tripPatterns = /* @__PURE__ */ new Map();
    agencyStopTimes.forEach((st) => {
      usedStopIds.add(st.stop_id);
      if (!tripPatterns.has(st.trip_id)) {
        tripPatterns.set(st.trip_id, []);
      }
      tripPatterns.get(st.trip_id).push({
        stop_id: st.stop_id,
        seq: parseInt(st.stop_sequence),
        arr: st.arrival_time,
        dep: st.departure_time
      });
    });
    tripPatterns.forEach((p) => p.sort((a, b) => a.seq - b.seq));
    const allStops = await readCsv(zip, "stops.txt");
    const usedStops = allStops.filter((s) => usedStopIds.has(s.stop_id));
    reportProgress("Processing Stops", 0, usedStops.length);
    const parentOrtMap = /* @__PURE__ */ new Map();
    const childOrtMap = /* @__PURE__ */ new Map();
    const stopIdToOrtNr = /* @__PURE__ */ new Map();
    const ortsToCreate = /* @__PURE__ */ new Map();
    const hpsToCreate = [];
    const stopDataMap = new Map(allStops.map((s) => [s.stop_id, s]));
    const orderedStopIds = /* @__PURE__ */ new Set();
    agencyRoutes.sort((a, b) => {
      const numA = parseInt(a.route_short_name.replace(/\D/g, ""), 10) || 999999;
      const numB = parseInt(b.route_short_name.replace(/\D/g, ""), 10) || 999999;
      return numA - numB;
    });
    for (const route of agencyRoutes) {
      const routeTrips = agencyTrips.filter((t) => t.route_id === route.route_id);
      for (const trip of routeTrips) {
        const pattern = tripPatterns.get(trip.trip_id);
        if (pattern) {
          pattern.forEach((p) => orderedStopIds.add(p.stop_id));
        }
      }
    }
    for (const s of usedStops) {
      orderedStopIds.add(s.stop_id);
    }
    const maxOrtNr = await RecOrt.max("ORT_NR", { where: { BASIS_VERSION } }) || 1e3;
    let nextOrtNr = maxOrtNr < 1e3 ? 1e3 : maxOrtNr;
    const getNextOrtNr = () => {
      nextOrtNr++;
      return nextOrtNr;
    };
    const parseDhidV2 = (dhid) => {
      const cleanDhid = dhid.replace("_Parent", "");
      const parts = cleanDhid.split(":");
      const land = parts[0] || "";
      const gemeinde = parts[1] || "";
      const refOrtLangNr = parts[2] || "";
      return {
        land,
        gemeinde,
        refOrtLangNr,
        mastNr: parts[3] || "",
        hpNr: parts[4] || "",
        parentKey: `${land}:${gemeinde}:${refOrtLangNr}`
      };
    };
    const parentInfo = /* @__PURE__ */ new Map();
    for (const s of allStops) {
      const cleanId = s.stop_id.replace("_Parent", "");
      const { parentKey, refOrtLangNr, mastNr, hpNr } = parseDhidV2(s.stop_id);
      parentInfo.set(cleanId, { name: s.stop_name, code: s.stop_code });
      if (refOrtLangNr && !mastNr && !hpNr || s.location_type === "1") {
        parentInfo.set(parentKey, { name: s.stop_name, code: s.stop_code });
      }
    }
    let nextParentId = 1e3;
    const parentChildCountMap = /* @__PURE__ */ new Map();
    let stopCount = 0;
    for (const stopId of orderedStopIds) {
      const s = stopDataMap.get(stopId);
      if (!s) continue;
      stopCount++;
      if (stopCount % 100 === 0) reportProgress("Processing Stops", stopCount, orderedStopIds.size);
      if (s.location_type === "1") continue;
      const { parentKey, refOrtLangNr, mastNr, hpNr } = parseDhidV2(s.stop_id);
      if (!refOrtLangNr) continue;
      let lookupKey = parentKey;
      if (s.parent_station) {
        lookupKey = s.parent_station.replace("_Parent", "");
      }
      const pInfo = parentInfo.get(lookupKey);
      let parentName = pInfo ? pInfo.name : s.parent_station ? "Unknown Parent" : s.stop_name;
      let parentCode = pInfo ? pInfo.code : s.stop_code || "";
      if (!pInfo && !s.parent_station) parentName = s.stop_name;
      let parentRefOrtId = parentOrtMap.get(lookupKey);
      if (!parentRefOrtId) {
        parentRefOrtId = nextParentId++;
        parentOrtMap.set(lookupKey, parentRefOrtId);
      }
      let childIndex = parentChildCountMap.get(parentRefOrtId) || 0;
      childIndex++;
      parentChildCountMap.set(parentRefOrtId, childIndex);
      const ortNr = parentRefOrtId * 100 + childIndex;
      stopIdToOrtNr.set(s.stop_id, ortNr);
      let parentLangNr = 0;
      const lookupParts = lookupKey.split(":");
      if (lookupParts.length >= 3) {
        parentLangNr = parseInt(lookupParts[2], 10) || 0;
      } else {
        parentLangNr = parseInt(refOrtLangNr, 10) || 0;
      }
      ortsToCreate.set(ortNr, {
        ORT_NR: ortNr,
        BASIS_VERSION,
        ONR_TYP_NR: 1,
        // 1 = Haltestelle/Ort
        ORT_NAME: s.stop_name,
        ORT_REF_ORT: parentRefOrtId,
        // Sequential internal ID
        ORT_REF_ORT_LangNr: parentLangNr,
        // The "5081" goes here (Parent's ID)
        ORT_REF_ORT_NAME: parentName,
        // Parent Name
        ORT_REF_ORT_KUERZEL: parentCode || null,
        HST_NR_INTERNATIONAL: s.stop_id,
        ORT_POS_LAENGE: Math.round(parseFloat(s.stop_lon) * 1e7),
        ORT_POS_BREITE: Math.round(parseFloat(s.stop_lat) * 1e7),
        ORT_POS_HOEHE: 0
      });
      if (hpNr || mastNr) {
        const finalHpNr = parseInt(hpNr || mastNr || "0", 10);
        if (finalHpNr > 0) {
          hpsToCreate.push({
            BASIS_VERSION,
            ORT_NR: ortNr,
            HALTEPUNKT_NR: finalHpNr,
            ONR_TYP_NR: 1,
            ZUSATZ_INFO: s.platform_code || mastNr || null,
            DHID: s.stop_id
          });
        }
      }
    }
    reportProgress("Importing Places", 0, ortsToCreate.size);
    const ortsArray = Array.from(ortsToCreate.values());
    for (let i = 0; i < ortsArray.length; i += 100) {
      const chunk = ortsArray.slice(i, i + 100);
      reportProgress("Importing Places", i, ortsArray.length);
      for (const ort of chunk) {
        const exists = await RecOrt.findOne({ where: { ORT_NR: ort.ORT_NR, BASIS_VERSION } });
        if (!exists) {
          await RecOrt.create(ort);
        }
      }
    }
    reportProgress("Importing Stop Points", 0, hpsToCreate.length);
    for (let i = 0; i < hpsToCreate.length; i += 100) {
      const chunk = hpsToCreate.slice(i, i + 100);
      reportProgress("Importing Stop Points", i, hpsToCreate.length);
      for (const hp of chunk) {
        const exists = await RecHp.findOne({ where: { ORT_NR: hp.ORT_NR, HALTEPUNKT_NR: hp.HALTEPUNKT_NR, BASIS_VERSION } });
        if (!exists) {
          await RecHp.create(hp);
        }
      }
    }
    const typeToBereichVal = /* @__PURE__ */ new Map();
    const addMapping = (types, id, text, kuerzel) => {
      types.forEach((t) => typeToBereichVal.set(t, { id, text, kuerzel }));
    };
    addMapping([0, 900], 1, "Stra\xDFenbahn", "Tram");
    addMapping([3, 700, 715], 2, "Bus", "Bus");
    addMapping([1, 2, 100, 101, 102, 109], 3, "Zug", "Zug");
    const areasToEnsure = [
      { id: 1, text: "Stra\xDFenbahn", kuerzel: "Tram" },
      { id: 2, text: "Bus", kuerzel: "Bus" },
      { id: 3, text: "Zug", kuerzel: "Zug" }
    ];
    for (const area of areasToEnsure) {
      const exists = await MengeBereich.findOne({ where: { BEREICH_NR: area.id, BASIS_VERSION } });
      if (!exists) {
        await MengeBereich.create({
          BASIS_VERSION,
          BEREICH_NR: area.id,
          STR_BEREICH: area.kuerzel,
          BEREICH_TEXT: area.text
        });
      }
    }
    reportProgress("Processing Day Types", 0, 100);
    const usedServiceIds = /* @__PURE__ */ new Set();
    agencyTrips.forEach((t) => usedServiceIds.add(t.service_id));
    const serviceIdMap = /* @__PURE__ */ new Map();
    const calendars = await readCsv(zip, "calendar.txt");
    let nextTagesartNr = await Tagesart.max("TAGESART_NR", { where: { BASIS_VERSION } }) || 0;
    for (const cal of calendars) {
      if (usedServiceIds.has(cal.service_id) && !serviceIdMap.has(cal.service_id)) {
        nextTagesartNr++;
        const nr = nextTagesartNr;
        await Tagesart.create({ BASIS_VERSION, TAGESART_NR: nr, TAGESART_TEXT: cal.service_id.substring(0, 40) });
        serviceIdMap.set(cal.service_id, nr);
      }
    }
    const calendarDates = await readCsv(zip, "calendar_dates.txt");
    for (const cd of calendarDates) {
      if (usedServiceIds.has(cd.service_id) && !serviceIdMap.has(cd.service_id)) {
        nextTagesartNr++;
        const nr = nextTagesartNr;
        await Tagesart.create({ BASIS_VERSION, TAGESART_NR: nr, TAGESART_TEXT: cd.service_id.substring(0, 40) });
        serviceIdMap.set(cd.service_id, nr);
      }
    }
    reportProgress("Expanding Calendar", 0, 100);
    const dateServiceMap = /* @__PURE__ */ new Map();
    const addToMap = (dateStr, serviceId) => {
      if (!dateServiceMap.has(dateStr)) dateServiceMap.set(dateStr, /* @__PURE__ */ new Set());
      dateServiceMap.get(dateStr).add(serviceId);
    };
    const removeFromMap = (dateStr, serviceId) => {
      if (dateServiceMap.has(dateStr)) {
        dateServiceMap.get(dateStr).delete(serviceId);
      }
    };
    for (const cal of calendars) {
      if (!usedServiceIds.has(cal.service_id)) continue;
      const startY = parseInt(cal.start_date.substring(0, 4));
      const startM = parseInt(cal.start_date.substring(4, 6)) - 1;
      const startD = parseInt(cal.start_date.substring(6, 8));
      const endY = parseInt(cal.end_date.substring(0, 4));
      const endM = parseInt(cal.end_date.substring(4, 6)) - 1;
      const endD = parseInt(cal.end_date.substring(6, 8));
      const current = new Date(startY, startM, startD);
      const end = new Date(endY, endM, endD);
      const activeDays = [
        cal.sunday === "1",
        cal.monday === "1",
        cal.tuesday === "1",
        cal.wednesday === "1",
        cal.thursday === "1",
        cal.friday === "1",
        cal.saturday === "1"
      ];
      while (current <= end) {
        const dayIndex = current.getDay();
        if (activeDays[dayIndex]) {
          const y = current.getFullYear();
          const m = (current.getMonth() + 1).toString().padStart(2, "0");
          const d = current.getDate().toString().padStart(2, "0");
          const dateStr = `${y}${m}${d}`;
          addToMap(dateStr, cal.service_id);
        }
        current.setDate(current.getDate() + 1);
      }
    }
    for (const cd of calendarDates) {
      if (!usedServiceIds.has(cd.service_id)) continue;
      const type = parseInt(cd.exception_type);
      if (type === 1) addToMap(cd.date, cd.service_id);
      else if (type === 2) removeFromMap(cd.date, cd.service_id);
    }
    const betriebstageToCreate = [];
    for (const [dateStr, services] of dateServiceMap) {
      const betriebstagInt = parseInt(dateStr, 10);
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const text = `${day}.${month}.${year}`;
      for (const sId of services) {
        const tNr = serviceIdMap.get(sId);
        if (tNr) {
          betriebstageToCreate.push({
            BASIS_VERSION,
            BETRIEBSTAG: betriebstagInt,
            BETRIEBSTAG_TEXT: text,
            TAGESART_NR: tNr
          });
        }
      }
    }
    reportProgress("Saving Calendar Days", 0, betriebstageToCreate.length);
    for (let i = 0; i < betriebstageToCreate.length; i += 500) {
      const chunk = betriebstageToCreate.slice(i, i + 500);
      await Betriebstag.bulkCreate(chunk, { ignoreDuplicates: true });
    }
    reportProgress("Importing Lines & Trips", 0, agencyRoutes.length);
    let lineIdx = 0;
    let frtFidCounter = await RecFrt.max("FRT_FID", { where: { BASIS_VERSION } }) || 0;
    for (const r of agencyRoutes) {
      lineIdx++;
      if (lineIdx % 5 === 0) reportProgress("Importing Lines", lineIdx, agencyRoutes.length, r.route_short_name);
      const liNr = parseInt(r.route_short_name.replace(/\D/g, ""), 10) || 0;
      let uniqueLiNr = liNr;
      if (uniqueLiNr === 0) {
        uniqueLiNr = 9e3 + lineIdx;
      }
      let routeType = parseInt(r.route_type, 10);
      if (isNaN(routeType)) routeType = 3;
      const mapping = typeToBereichVal.get(routeType);
      const bereichNr = mapping ? mapping.id : 2;
      const routeTrips = agencyTrips.filter((t) => t.route_id === r.route_id);
      const patterns = /* @__PURE__ */ new Map();
      const tripToPatternKey = /* @__PURE__ */ new Map();
      for (const trip of routeTrips) {
        const stops = tripPatterns.get(trip.trip_id);
        if (!stops || stops.length === 0) continue;
        const patternKey = stops.map((s) => s.stop_id).join("|");
        if (!patterns.has(patternKey)) patterns.set(patternKey, stops);
        tripToPatternKey.set(trip.trip_id, patternKey);
      }
      let variantIdx = 0;
      const patternKeyToVarId = /* @__PURE__ */ new Map();
      for (const [key, stops] of patterns) {
        variantIdx++;
        const variantId = variantIdx.toString().padStart(3, "0");
        patternKeyToVarId.set(key, variantId);
        const startStopId = stops[0].stop_id;
        const endStopId = stops[stops.length - 1].stop_id;
        const getParentName = (stopId) => {
          const mappedOrtNr = stopIdToOrtNr.get(stopId);
          if (!mappedOrtNr) return "Unknown";
          const childOrt = ortsToCreate.get(mappedOrtNr);
          if (!childOrt) return "Unknown";
          return childOrt.ORT_REF_ORT_NAME || childOrt.ORT_NAME || "Unknown";
        };
        const startName = getParentName(startStopId);
        const endName = getParentName(endStopId);
        const lidName = `${startName} \u2013 ${endName}`;
        let znrNr = 0;
        const existingZnr = await RecZnr.findOne({ where: { ZNR_TEXT: endName, BASIS_VERSION } });
        if (existingZnr) {
          znrNr = existingZnr.ZNR_NR;
        } else {
          const maxZnr = await RecZnr.max("ZNR_NR", { where: { BASIS_VERSION } }) || 0;
          znrNr = maxZnr + 1;
          await RecZnr.create({
            BASIS_VERSION,
            ZNR_NR: znrNr,
            ZNR_TEXT: endName.substring(0, 40)
          });
        }
        const existingLid = await RecLid.findOne({
          where: { BASIS_VERSION, LI_NR: uniqueLiNr, STR_LI_VAR: variantId }
        });
        if (!existingLid) {
          await RecLid.create({
            BASIS_VERSION,
            LI_NR: uniqueLiNr,
            STR_LI_VAR: variantId,
            STR_LID: r.route_short_name.substring(0, 4),
            LI_KUERZEL: r.route_short_name.substring(0, 6),
            LIDNAME: lidName.substring(0, 100),
            ROUTEN_ART: 1,
            ROUTEN_NR: variantIdx,
            BEREICH_NR: bereichNr
          });
        }
        let seq = 0;
        for (const stop of stops) {
          seq++;
          const ortNr = stopIdToOrtNr.get(stop.stop_id);
          if (ortNr) {
            try {
              await LidVerlauf.create({
                BASIS_VERSION,
                LI_NR: uniqueLiNr,
                STR_LI_VAR: variantId,
                LI_LFD_NR: seq,
                ORT_NR: ortNr,
                ONR_TYP_NR: 1,
                ZNR_NR: seq === 1 ? znrNr : void 0,
                EINSTEIGEVERBOT: false,
                AUSSTEIGEVERBOT: false
              });
            } catch (err) {
            }
          }
        }
      }
      for (const trip of routeTrips) {
        const pKey = tripToPatternKey.get(trip.trip_id);
        if (!pKey) continue;
        const variantId = patternKeyToVarId.get(pKey);
        if (!variantId) continue;
        const tagesartNr = serviceIdMap.get(trip.service_id) || 1;
        const stops = tripPatterns.get(trip.trip_id);
        const startTime = timeToSeconds(stops[0].dep);
        frtFidCounter++;
        await RecFrt.create({
          BASIS_VERSION,
          FRT_FID: frtFidCounter,
          FRT_START: startTime,
          LI_NR: uniqueLiNr,
          STR_LI_VAR: variantId,
          TAGESART_NR: tagesartNr,
          FAHRTART_NR: 1,
          // Default Normal
          UM_UID: null
          // Orphan
          // ZUGNR? Line course?
        });
      }
    }
    reportProgress("Importing Relations", 0, 0);
    const timeWindows = [
      { start: 0, end: 3 * 3600, label: "00:00-02:59" },
      { start: 3 * 3600, end: 6 * 3600, label: "03:00-05:59" },
      { start: 6 * 3600, end: 9 * 3600, label: "06:00-08:59" },
      { start: 9 * 3600, end: 12 * 3600, label: "09:00-11:59" },
      { start: 12 * 3600, end: 15 * 3600, label: "12:00-14:59" },
      { start: 15 * 3600, end: 18 * 3600, label: "15:00-17:59" },
      { start: 18 * 3600, end: 21 * 3600, label: "18:00-20:59" },
      { start: 21 * 3600, end: 24 * 3600, label: "21:00-23:59" }
    ];
    for (let i = 0; i < timeWindows.length; i++) {
      const fgrNr = i + 1;
      const fgrExists = await MengeFgr.findOne({ where: { FGR_NR: fgrNr, BASIS_VERSION } });
      if (!fgrExists) {
        await MengeFgr.create({
          BASIS_VERSION,
          FGR_NR: fgrNr,
          STR_FGR: `FGR${fgrNr}`,
          FGR_TEXT: timeWindows[i].label
        });
      }
    }
    const getTimeWindow = (depTimeSeconds) => {
      const normalizedTime = depTimeSeconds % (24 * 3600);
      for (let i = 0; i < timeWindows.length; i++) {
        if (normalizedTime >= timeWindows[i].start && normalizedTime < timeWindows[i].end) return i + 1;
      }
      return 1;
    };
    const toRad = (v) => v * Math.PI / 180;
    const calcDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    };
    const getDistanceFromEFA = async (originDHID, destDHID) => {
      try {
        const url = `https://westfalenfahrplan.de/nwl-efa/XML_TRIP_REQUEST2?outputFormat=rapidJSON&coordOutputDistance=1&name_origin=${encodeURIComponent(originDHID)}&name_destination=${encodeURIComponent(destDHID)}&type_origin=any&type_destination=any&itdTripDateTimeDepArr=dep&anyObjFilter_origin=2&anyObjFilter_destination=2`;
        const response = await import_axios.default.get(url, { timeout: 3e3 });
        if (response.data.journeys && response.data.journeys.length > 0) {
          const firstJourney = response.data.journeys[0];
          let totalDistance = 0;
          if (firstJourney.legs) {
            firstJourney.legs.forEach((leg) => {
              if (leg.distance) totalDistance += leg.distance;
            });
          }
          return totalDistance > 0 ? totalDistance : null;
        }
        return null;
      } catch (error) {
        return null;
      }
    };
    const segmentFgrDurations = /* @__PURE__ */ new Map();
    const segmentDistances = /* @__PURE__ */ new Map();
    reportProgress("Calculating Travel Times", 0, agencyStopTimes.length);
    let processedSegmentsCount = 0;
    const totalSegmentsEstimate = agencyStopTimes.length;
    for (const st of agencyStopTimes) {
      if (!st.departure_time || !st.arrival_time) continue;
      const tripStops = tripPatterns.get(st.trip_id);
      if (!tripStops || tripStops.length < 2) continue;
      const stopSeq = parseInt(st.stop_sequence);
      const stopIdx = tripStops.findIndex((s) => s.stop_id === st.stop_id && s.seq === stopSeq);
      if (stopIdx === -1 || stopIdx >= tripStops.length - 1) continue;
      const s1 = tripStops[stopIdx];
      const s2 = tripStops[stopIdx + 1];
      const fromOrtNr = stopIdToOrtNr.get(s1.stop_id);
      const toOrtNr = stopIdToOrtNr.get(s2.stop_id);
      if (!fromOrtNr || !toOrtNr || fromOrtNr === toOrtNr) continue;
      const segmentBaseKey = `${fromOrtNr}-${toOrtNr}`;
      if (!segmentDistances.has(segmentBaseKey)) {
        let dist = 0;
        const { loadEFADistances } = workerData;
        let efaSuccess = false;
        const ort1 = ortsToCreate.get(fromOrtNr);
        const ort2 = ortsToCreate.get(toOrtNr);
        if (loadEFADistances && ort1?.HST_NR_INTERNATIONAL && ort2?.HST_NR_INTERNATIONAL) {
          try {
            console.log(`[EFA] Requesting ${ort1.ORT_NAME} -> ${ort2.ORT_NAME}`);
            const efaDist = await getDistanceFromEFA(ort1.HST_NR_INTERNATIONAL, ort2.HST_NR_INTERNATIONAL);
            if (efaDist !== null) {
              dist = efaDist;
              efaSuccess = true;
              console.log(`[EFA] Success: ${dist}m`);
            } else {
              console.log(`[EFA] Returned null (fallback to Haversine)`);
            }
          } catch (err) {
            console.error(`[EFA] Error inside loop:`, err);
          }
        }
        if (!efaSuccess && ort1 && ort2) {
          const lat1 = ort1.ORT_POS_BREITE / 1e7;
          const lon1 = ort1.ORT_POS_LAENGE / 1e7;
          const lat2 = ort2.ORT_POS_BREITE / 1e7;
          const lon2 = ort2.ORT_POS_LAENGE / 1e7;
          dist = calcDistance(lat1, lon1, lat2, lon2);
        }
        segmentDistances.set(segmentBaseKey, dist);
        processedSegmentsCount++;
        if (loadEFADistances && processedSegmentsCount % 10 === 0) {
          reportProgress("Calculating Travel Times (EFA)", processedSegmentsCount, totalSegmentsEstimate, `${ort1.ORT_NAME} -> ${ort2.ORT_NAME}`);
        }
      }
      const depTime = timeToSeconds(s1.dep);
      const arrTime = timeToSeconds(s2.arr);
      const duration = Math.max(0, arrTime - depTime);
      const fgrNr = getTimeWindow(depTime);
      const key = `${fromOrtNr}-${toOrtNr}-${fgrNr}`;
      if (!segmentFgrDurations.has(key)) segmentFgrDurations.set(key, /* @__PURE__ */ new Set());
      segmentFgrDurations.get(key).add(duration);
    }
    const segmentsByKey = /* @__PURE__ */ new Map();
    for (const [key, durations] of segmentFgrDurations) {
      const lastDash = key.lastIndexOf("-");
      const segmentKey = key.substring(0, lastDash);
      const fgrNr = parseInt(key.substring(lastDash + 1));
      if (!segmentsByKey.has(segmentKey)) segmentsByKey.set(segmentKey, /* @__PURE__ */ new Map());
      segmentsByKey.get(segmentKey).set(fgrNr, durations);
    }
    const processedSegments = /* @__PURE__ */ new Set();
    reportProgress("Saving Relations", 0, segmentsByKey.size);
    let selIdx = 0;
    for (const [segmentKey, fgrMap] of segmentsByKey) {
      selIdx++;
      if (selIdx % 100 === 0) reportProgress("Saving Relations", selIdx, segmentsByKey.size);
      const [fromOrt, toOrt] = segmentKey.split("-").map(Number);
      const sortedFgrs = Array.from(fgrMap.keys()).sort((a, b) => a - b);
      const dist = segmentDistances.get(segmentKey) || 0;
      for (const fgrNr of sortedFgrs) {
        const durations = fgrMap.get(fgrNr);
        const avgDuration = Math.round(Array.from(durations).reduce((a, b) => a + b, 0) / durations.size);
        if (fgrNr === 1 && !processedSegments.has(segmentKey)) {
          await RecSel.create({
            BASIS_VERSION,
            BEREICH_NR: 1,
            ONR_TYP_NR: 1,
            ORT_NR: fromOrt,
            SEL_ZIEL: toOrt,
            SEL_ZIEL_TYP: 1,
            SEL_LAENGE: dist,
            SEL_FZT: avgDuration,
            FGR_NR: 1
          });
          processedSegments.add(segmentKey);
        }
        await RecSelFztFeld.create({
          BASIS_VERSION,
          BEREICH_NR: 1,
          FGR_NR: fgrNr,
          ONR_TYP_NR: 1,
          ORT_NR: fromOrt,
          SEL_ZIEL: toOrt,
          SEL_ZIEL_TYP: 1,
          SEL_FZT: avgDuration
        });
      }
    }
    reportProgress("Done", 100, 100, "Import completed successfully", true);
    if (import_fs2.default.existsSync(filePath)) {
      try {
        import_fs2.default.unlinkSync(filePath);
        console.log(`[GTFS Worker] Cleaned up temp file: ${filePath}`);
      } catch (err) {
        console.warn(`[GTFS Worker] Failed to clean up temp file: ${filePath}`, err);
      }
    }
    if (parentPort) parentPort.postMessage({ type: "done" });
    process.exit(0);
  } catch (e) {
    console.error(e);
    const { tempFile } = workerData;
    if (tempFile) {
      const filePath = import_path2.default.join(process.cwd(), "uploads", tempFile);
      if (import_fs2.default.existsSync(filePath)) {
        try {
          import_fs2.default.unlinkSync(filePath);
          console.log(`[GTFS Worker] Cleaned up temp file after error: ${filePath}`);
        } catch (cleanupErr) {
        }
      }
    }
    if (parentPort) parentPort.postMessage({ type: "error", error: e.message });
    process.exit(1);
  }
};
runImport();
