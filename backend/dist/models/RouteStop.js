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
exports.RouteStop = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Stop_1 = require("./Stop");
const Route_1 = require("./Route");
const Announcement_1 = require("./Announcement");
const RecAnr_1 = require("./VDV/RecAnr");
const StopTime_1 = require("./StopTime");
let RouteStop = class RouteStop extends sequelize_typescript_1.Model {
};
exports.RouteStop = RouteStop;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Stop_1.Stop),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], RouteStop.prototype, "stop_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RouteStop.prototype, "sequence_number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], RouteStop.prototype, "hasHighPlatform", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RouteStop.prototype, "doorSide", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Stop_1.Stop, { foreignKey: 'stop_id', targetKey: 'id' }),
    __metadata("design:type", Stop_1.Stop)
], RouteStop.prototype, "stop", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Route_1.Route),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RouteStop.prototype, "route_id", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => StopTime_1.StopTime, {
        foreignKey: 'route_stop_id', // Ensure the foreign key is correctly defined
        sourceKey: 'id'
    }),
    __metadata("design:type", Array)
], RouteStop.prototype, "stopTimes", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Announcement_1.Announcement),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], RouteStop.prototype, "announcement_id", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Announcement_1.Announcement, { foreignKey: 'announcement_id' }),
    __metadata("design:type", Announcement_1.Announcement)
], RouteStop.prototype, "announcement", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => RecAnr_1.RecAnr),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true
    }),
    __metadata("design:type", Number)
], RouteStop.prototype, "ANR_NR", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => RecAnr_1.RecAnr, { foreignKey: 'ANR_NR', targetKey: 'ANR_NR' }),
    __metadata("design:type", RecAnr_1.RecAnr)
], RouteStop.prototype, "recAnr", void 0);
exports.RouteStop = RouteStop = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'route_stops'
    })
], RouteStop);
