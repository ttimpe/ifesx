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
exports.StopTime = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Trip_1 = require("./Trip");
const RouteStop_1 = require("./RouteStop");
let StopTime = class StopTime extends sequelize_typescript_1.Model {
};
exports.StopTime = StopTime;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], StopTime.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], StopTime.prototype, "arrivalTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], StopTime.prototype, "departureTime", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Trip_1.Trip, {
        foreignKey: 'trip_id',
        targetKey: 'id'
    }),
    __metadata("design:type", Trip_1.Trip)
], StopTime.prototype, "trip", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => RouteStop_1.RouteStop),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], StopTime.prototype, "route_stop_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RouteStop_1.RouteStop, {
        foreignKey: 'route_stop_id',
        targetKey: 'id'
    }),
    __metadata("design:type", RouteStop_1.RouteStop)
], StopTime.prototype, "stop", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Trip_1.Trip),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], StopTime.prototype, "trip_id", void 0);
exports.StopTime = StopTime = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'stop_times'
    })
], StopTime);
