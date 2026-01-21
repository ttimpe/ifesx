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
exports.VehicleSchedule = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Trip_1 = require("./Trip");
let VehicleSchedule = class VehicleSchedule extends sequelize_typescript_1.Model {
    constructor() {
        super(...arguments);
        this.trips = [];
    }
};
exports.VehicleSchedule = VehicleSchedule;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], VehicleSchedule.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], VehicleSchedule.prototype, "number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], VehicleSchedule.prototype, "daytype", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], VehicleSchedule.prototype, "departureTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], VehicleSchedule.prototype, "arrivalTime", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Trip_1.Trip),
    __metadata("design:type", Array)
], VehicleSchedule.prototype, "trips", void 0);
exports.VehicleSchedule = VehicleSchedule = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'schedules'
    })
], VehicleSchedule);
