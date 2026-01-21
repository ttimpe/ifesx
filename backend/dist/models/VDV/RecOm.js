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
exports.RecOm = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const BasisVersion_1 = require("./BasisVersion");
const RecOrt_1 = require("./RecOrt");
let RecOm = class RecOm extends sequelize_typescript_1.Model {
};
exports.RecOm = RecOm;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => BasisVersion_1.BasisVersion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecOm.prototype, "BASIS_VERSION", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOm.prototype, "ONR_TYP_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => RecOrt_1.RecOrt),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOm.prototype, "ORT_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(6)),
    __metadata("design:type", String)
], RecOm.prototype, "ORM_KUERZEL", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecOm.prototype, "ORMACODE", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", String)
], RecOm.prototype, "ORM_TEXT", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => BasisVersion_1.BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false }),
    __metadata("design:type", BasisVersion_1.BasisVersion)
], RecOm.prototype, "basisVersion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecOrt_1.RecOrt, { foreignKey: 'ORT_NR', targetKey: 'ORT_NR', constraints: false }),
    __metadata("design:type", RecOrt_1.RecOrt)
], RecOm.prototype, "ort", void 0);
exports.RecOm = RecOm = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'REC_OM',
        timestamps: false
    })
], RecOm);
