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
exports.RecZnr = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const BasisVersion_1 = require("./BasisVersion");
let RecZnr = class RecZnr extends sequelize_typescript_1.Model {
    // Backward compatibility getters
    // Note: 'id' getter removed to avoid conflict with Model.id. Use ZNR_NR explicitly or map in controller.
    get number() { return this.ZNR_NR; }
    get name() { return this.ZNR_TEXT; }
};
exports.RecZnr = RecZnr;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecZnr.prototype, "ZNR_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(160)),
    __metadata("design:type", String)
], RecZnr.prototype, "ZNR_TEXT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(10)),
    __metadata("design:type", String)
], RecZnr.prototype, "ZNR_KUERZEL", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(44)),
    __metadata("design:type", String)
], RecZnr.prototype, "FAHRERKURZTEXT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(160)),
    __metadata("design:type", String)
], RecZnr.prototype, "SEITENTEXT", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(68)),
    __metadata("design:type", String)
], RecZnr.prototype, "ZNR_CODE", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecZnr.prototype, "BASIS_VERSION", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => BasisVersion_1.BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false }),
    __metadata("design:type", BasisVersion_1.BasisVersion)
], RecZnr.prototype, "basisVersion", void 0);
exports.RecZnr = RecZnr = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'REC_ZNR',
        timestamps: false
    })
], RecZnr);
