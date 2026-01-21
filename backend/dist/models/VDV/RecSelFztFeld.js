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
exports.RecSelFztFeld = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const BasisVersion_1 = require("./BasisVersion");
const MengeBereich_1 = require("./MengeBereich");
const RecSel_1 = require("./RecSel");
let RecSelFztFeld = class RecSelFztFeld extends sequelize_typescript_1.Model {
};
exports.RecSelFztFeld = RecSelFztFeld;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => BasisVersion_1.BasisVersion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecSelFztFeld.prototype, "BASIS_VERSION", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => MengeBereich_1.MengeBereich),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecSelFztFeld.prototype, "BEREICH_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecSelFztFeld.prototype, "FGR_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => RecSel_1.RecSel),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecSelFztFeld.prototype, "ONR_TYP_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => RecSel_1.RecSel),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecSelFztFeld.prototype, "ORT_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => RecSel_1.RecSel),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecSelFztFeld.prototype, "SEL_ZIEL", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => RecSel_1.RecSel),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecSelFztFeld.prototype, "SEL_ZIEL_TYP", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecSelFztFeld.prototype, "SEL_FZT", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => MengeBereich_1.MengeBereich, {
        foreignKey: 'BEREICH_NR',
        targetKey: 'BEREICH_NR', // Simplified, should be composite
        constraints: false
    }),
    __metadata("design:type", MengeBereich_1.MengeBereich)
], RecSelFztFeld.prototype, "mengeBereich", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecSel_1.RecSel, {
        foreignKey: 'ORT_NR', // Simplified, Sequelize has trouble with multi-col FKs this complex without explicit definition
        constraints: false
    }),
    __metadata("design:type", RecSel_1.RecSel)
], RecSelFztFeld.prototype, "recSel", void 0);
exports.RecSelFztFeld = RecSelFztFeld = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'SEL_FZT_FELD',
        timestamps: false
    })
], RecSelFztFeld);
