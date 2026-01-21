"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LidVerlauf = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const RecLid_1 = require("./RecLid");
const RecHp_1 = require("./RecHp");
const BasisVersion_1 = require("./BasisVersion");
let LidVerlauf = class LidVerlauf extends sequelize_typescript_1.Model {
};
exports.LidVerlauf = LidVerlauf;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => BasisVersion_1.BasisVersion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "BASIS_VERSION", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "LI_LFD_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => RecLid_1.RecLid),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "LI_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(6)),
    __metadata("design:type", String)
], LidVerlauf.prototype, "STR_LI_VAR", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => RecHp_1.RecHp),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "ONR_TYP_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => RecHp_1.RecHp),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "ORT_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => RecHp_1.RecHp),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "HALTEPUNKT_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "ZNR_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "ANR_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], LidVerlauf.prototype, "EINFANGBEREICH", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], LidVerlauf.prototype, "LI_KNOTEN", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], LidVerlauf.prototype, "PRODUKTIV", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], LidVerlauf.prototype, "EINSTEIGEVERBOT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], LidVerlauf.prototype, "AUSSTEIGEVERBOT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], LidVerlauf.prototype, "INNERORTSVERBOT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], LidVerlauf.prototype, "BEDARFSHALT", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => BasisVersion_1.BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false }),
    __metadata("design:type", BasisVersion_1.BasisVersion)
], LidVerlauf.prototype, "basisVersion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecLid_1.RecLid, { foreignKey: 'LI_NR', targetKey: 'LID_NR' }) // RecLid still uses LID_NR? Check RecLid.
    ,
    __metadata("design:type", RecLid_1.RecLid)
], LidVerlauf.prototype, "line", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecHp_1.RecHp, { foreignKey: 'HALTEPUNKT_NR', targetKey: 'HALTEPUNKT_NR' }),
    __metadata("design:type", RecHp_1.RecHp)
], LidVerlauf.prototype, "stop", void 0);
exports.LidVerlauf = LidVerlauf = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'LID_VERLAUF',
        timestamps: false
    })
], LidVerlauf);
