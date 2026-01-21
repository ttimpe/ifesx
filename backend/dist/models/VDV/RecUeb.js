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
exports.RecUeb = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const BasisVersion_1 = require("./BasisVersion");
const UebFzt_1 = require("./UebFzt");
let RecUeb = class RecUeb extends sequelize_typescript_1.Model {
};
exports.RecUeb = RecUeb;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => BasisVersion_1.BasisVersion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecUeb.prototype, "BASIS_VERSION", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUeb.prototype, "BEREICH_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUeb.prototype, "ONR_TYP_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUeb.prototype, "ORT_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUeb.prototype, "UEB_ZIEL_TYP", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUeb.prototype, "UEB_ZIEL", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUeb.prototype, "UEB_LAENGE", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => BasisVersion_1.BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false }),
    __metadata("design:type", BasisVersion_1.BasisVersion)
], RecUeb.prototype, "basisVersion", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => UebFzt_1.UebFzt, {
        foreignKey: 'BASIS_VERSION',
        sourceKey: 'BASIS_VERSION',
        constraints: false
    }),
    __metadata("design:type", Array)
], RecUeb.prototype, "uebFzts", void 0);
exports.RecUeb = RecUeb = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'REC_UEB',
        timestamps: false
    })
], RecUeb);
