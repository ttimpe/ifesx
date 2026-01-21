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
exports.Trip = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Route_1 = require("./Route");
const VehicleSchedule_1 = require("./VehicleSchedule");
const StopTime_1 = require("./StopTime");
let Trip = class Trip extends sequelize_typescript_1.Model {
};
exports.Trip = Trip;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Trip.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Trip.prototype, "courseNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Trip.prototype, "turnaroundMinutes", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Route_1.Route) // Define foreign key
    ,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER) // Adjust data type as needed
    ,
    __metadata("design:type", Number)
], Trip.prototype, "routeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Route_1.Route),
    __metadata("design:type", Route_1.Route)
], Trip.prototype, "route", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => VehicleSchedule_1.VehicleSchedule),
    __metadata("design:type", VehicleSchedule_1.VehicleSchedule)
], Trip.prototype, "schedule", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => VehicleSchedule_1.VehicleSchedule),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Trip.prototype, "schedule_id", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => StopTime_1.StopTime),
    __metadata("design:type", Array)
], Trip.prototype, "stopTimes", void 0);
exports.Trip = Trip = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'trips'
    })
], Trip);
