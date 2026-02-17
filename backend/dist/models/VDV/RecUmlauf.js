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
exports.RecUmlauf = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const RecFrt_1 = require("./RecFrt");
let RecUmlauf = class RecUmlauf extends sequelize_typescript_1.Model {
};
exports.RecUmlauf = RecUmlauf;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUmlauf.prototype, "BASIS_VERSION", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUmlauf.prototype, "TAGESART_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUmlauf.prototype, "UM_UID", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUmlauf.prototype, "ANF_ORT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUmlauf.prototype, "ANF_ONR_TYP", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUmlauf.prototype, "END_ORT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUmlauf.prototype, "END_ONR_TYP", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecUmlauf.prototype, "FZG_TYP_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => RecFrt_1.RecFrt, {
        foreignKey: 'UM_UID',
        sourceKey: 'UM_UID',
        constraints: false
    }),
    __metadata("design:type", Array)
], RecUmlauf.prototype, "trips", void 0);
exports.RecUmlauf = RecUmlauf = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'REC_UMLAUF',
        timestamps: false
    })
], RecUmlauf);
