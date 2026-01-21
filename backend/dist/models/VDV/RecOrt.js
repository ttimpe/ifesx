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
exports.RecOrt = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const BasisVersion_1 = require("./BasisVersion");
const RecHp_1 = require("./RecHp");
let RecOrt = class RecOrt extends sequelize_typescript_1.Model {
};
exports.RecOrt = RecOrt;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOrt.prototype, "ORT_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1 // Default to 1 (Stop/Haltestelle)? Need to confirm typical value.
    }),
    __metadata("design:type", Number)
], RecOrt.prototype, "ONR_TYP_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", String)
], RecOrt.prototype, "ORT_NAME", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOrt.prototype, "ORT_REF_ORT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOrt.prototype, "ORT_REF_ORT_TYP", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOrt.prototype, "ORT_REF_ORT_LangNr", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(8)),
    __metadata("design:type", String)
], RecOrt.prototype, "ORT_REF_ORT_KUERZEL", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", String)
], RecOrt.prototype, "ORT_REF_ORT_NAME", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOrt.prototype, "ZONE_WABE_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 0)),
    __metadata("design:type", Number)
], RecOrt.prototype, "ORT_POS_LAENGE", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 0)),
    __metadata("design:type", Number)
], RecOrt.prototype, "ORT_POS_BREITE", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 0)),
    __metadata("design:type", Number)
], RecOrt.prototype, "ORT_POS_HOEHE", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOrt.prototype, "ORT_RICHTUNG", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOrt.prototype, "HAST_NR_LOKAL", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOrt.prototype, "HST_NR_NATIONAL", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(30)),
    __metadata("design:type", String)
], RecOrt.prototype, "HST_NR_INTERNATIONAL", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => BasisVersion_1.BasisVersion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecOrt.prototype, "BASIS_VERSION", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => BasisVersion_1.BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false }),
    __metadata("design:type", BasisVersion_1.BasisVersion)
], RecOrt.prototype, "basisVersion", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => RecHp_1.RecHp),
    __metadata("design:type", Array)
], RecOrt.prototype, "recHps", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecOrt, { foreignKey: 'ORT_REF_ORT', targetKey: 'ORT_NR', as: 'parentOrt', constraints: false }),
    __metadata("design:type", RecOrt)
], RecOrt.prototype, "parentOrt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => RecOrt, { foreignKey: 'ORT_REF_ORT', sourceKey: 'ORT_NR', as: 'subOrts', constraints: false }),
    __metadata("design:type", Array)
], RecOrt.prototype, "subOrts", void 0);
exports.RecOrt = RecOrt = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'REC_ORT',
        timestamps: false
    })
], RecOrt);
