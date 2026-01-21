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
exports.RecLidVerlauf = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const RecLid_1 = require("./RecLid");
const BasisVersion_1 = require("./BasisVersion");
const RecOrt_1 = require("./RecOrt");
let RecLidVerlauf = class RecLidVerlauf extends sequelize_typescript_1.Model {
};
exports.RecLidVerlauf = RecLidVerlauf;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecLidVerlauf.prototype, "LI_LFD_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => RecLid_1.RecLid),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecLidVerlauf.prototype, "LI_NR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(10)),
    __metadata("design:type", String)
], RecLidVerlauf.prototype, "STR_LI_VAR", void 0);
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.ForeignKey)(() => BasisVersion_1.BasisVersion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1
    }),
    __metadata("design:type", Number)
], RecLidVerlauf.prototype, "BASIS_VERSION", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RecLidVerlauf.prototype, "ORT_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TINYINT),
    __metadata("design:type", Number)
], RecLidVerlauf.prototype, "LI_KNOTEN", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => BasisVersion_1.BasisVersion, { foreignKey: 'BASIS_VERSION', targetKey: 'BASIS_VERSION', constraints: false }),
    __metadata("design:type", BasisVersion_1.BasisVersion)
], RecLidVerlauf.prototype, "basisVersion", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecLid_1.RecLid, { foreignKey: 'LI_NR', targetKey: 'LID_NR' }) // Note: LI_NR in table maps to LID_NR in RecLid? Check RecLid schema if needed. Assuming yes.
    ,
    __metadata("design:type", RecLid_1.RecLid)
], RecLidVerlauf.prototype, "line", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecOrt_1.RecOrt, { foreignKey: 'ORT_NR', targetKey: 'ORT_NR' }),
    __metadata("design:type", RecOrt_1.RecOrt)
], RecLidVerlauf.prototype, "ort", void 0);
exports.RecLidVerlauf = RecLidVerlauf = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'LID_VERLAUF',
        timestamps: false
    })
], RecLidVerlauf);
