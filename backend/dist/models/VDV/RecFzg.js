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
exports.RecFzg = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const RecFzgTyp_1 = require("./RecFzgTyp");
let RecFzg = class RecFzg extends sequelize_typescript_1.Model {
};
exports.RecFzg = RecFzg;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecFzg.prototype, "BASIS_VERSION", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecFzg.prototype, "FZG_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => RecFzgTyp_1.RecFzgTyp),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecFzg.prototype, "FZG_TYP_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecFzg.prototype, "UNTERNEHMEN", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(40)),
    __metadata("design:type", String)
], RecFzg.prototype, "FZG_TEXT", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecFzgTyp_1.RecFzgTyp, {
        foreignKey: 'FZG_TYP_NR',
        targetKey: 'FZG_TYP_NR',
        constraints: false
    }),
    __metadata("design:type", RecFzgTyp_1.RecFzgTyp)
], RecFzg.prototype, "type", void 0);
exports.RecFzg = RecFzg = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'REC_FZG',
        timestamps: false
    })
], RecFzg);
