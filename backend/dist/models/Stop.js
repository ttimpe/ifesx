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
exports.Stop = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const StopInformation_1 = require("./StopInformation");
const RouteStop_1 = require("./RouteStop");
const RecHp_1 = require("./VDV/RecHp");
let Stop = class Stop extends sequelize_typescript_1.Model {
};
exports.Stop = Stop;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Stop.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Stop.prototype, "parent_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Stop.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => StopInformation_1.StopInformation),
    __metadata("design:type", StopInformation_1.StopInformation)
], Stop.prototype, "stopInformation", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => RouteStop_1.RouteStop),
    __metadata("design:type", Array)
], Stop.prototype, "routeStops", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => RecHp_1.RecHp, { foreignKey: 'DHID', sourceKey: 'id' }),
    __metadata("design:type", RecHp_1.RecHp)
], Stop.prototype, "recHp", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.FLOAT),
    __metadata("design:type", Number)
], Stop.prototype, "latitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.FLOAT),
    __metadata("design:type", Number)
], Stop.prototype, "longitude", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Stop, { foreignKey: 'parent_id', targetKey: 'id' }),
    __metadata("design:type", Stop)
], Stop.prototype, "parent", void 0);
exports.Stop = Stop = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'stops'
    })
], Stop);
