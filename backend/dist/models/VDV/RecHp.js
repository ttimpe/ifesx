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
exports.RecHp = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const BasisVersion_1 = require("./BasisVersion");
const RecOrt_1 = require("./RecOrt");
const Stop_1 = require("../Stop");
let RecHp = class RecHp extends sequelize_typescript_1.Model {
};
exports.RecHp = RecHp;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => RecOrt_1.RecOrt),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecHp.prototype, "ORT_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecHp.prototype, "ONR_TYP_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecOrt_1.RecOrt, {
        foreignKey: 'ORT_NR',
        targetKey: 'ORT_NR',
        as: 'recOrt'
        // Note: Sequelize composite key association might need 'ONR_TYP_NR' too,
        // but simplistic approach often works if ORT_NR is unique enough or we define constraints loosely.
    }),
    __metadata("design:type", RecOrt_1.RecOrt)
], RecHp.prototype, "recOrt", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecHp.prototype, "HALTEPUNKT_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", String)
], RecHp.prototype, "ZUSATZ_INFO", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", String)
], RecHp.prototype, "DHID", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => BasisVersion_1.BasisVersion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecHp.prototype, "BASIS_VERSION", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => BasisVersion_1.BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false }),
    __metadata("design:type", BasisVersion_1.BasisVersion)
], RecHp.prototype, "basisVersion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Stop_1.Stop, { foreignKey: 'DHID', targetKey: 'id' }),
    __metadata("design:type", Stop_1.Stop)
], RecHp.prototype, "stop", void 0);
exports.RecHp = RecHp = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'REC_HP'
    })
], RecHp);
