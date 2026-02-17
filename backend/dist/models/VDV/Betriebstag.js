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
exports.Betriebstag = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Tagesart_1 = require("./Tagesart");
const BasisVersion_1 = require("./BasisVersion");
let Betriebstag = class Betriebstag extends sequelize_typescript_1.Model {
};
exports.Betriebstag = Betriebstag;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Betriebstag.prototype, "BASIS_VERSION", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => BasisVersion_1.BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION' }),
    __metadata("design:type", BasisVersion_1.BasisVersion)
], Betriebstag.prototype, "basisVersion", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Betriebstag.prototype, "BETRIEBSTAG", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Betriebstag.prototype, "BETRIEBSTAG_TEXT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Betriebstag.prototype, "TAGESART_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Tagesart_1.Tagesart, { foreignKey: 'TAGESART_NR', targetKey: 'TAGESART_NR' }),
    __metadata("design:type", Tagesart_1.Tagesart)
], Betriebstag.prototype, "tagesart", void 0);
exports.Betriebstag = Betriebstag = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'FIRMENKALENDER'
    })
], Betriebstag);
