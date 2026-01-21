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
exports.Route = void 0;
const SpecialCharacter_1 = require("./SpecialCharacter");
const RecZnr_1 = require("./VDV/RecZnr");
const sequelize_typescript_1 = require("sequelize-typescript");
const RouteStop_1 = require("./RouteStop");
const Line_1 = require("./Line");
let Route = class Route extends sequelize_typescript_1.Model {
};
exports.Route = Route;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Route.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Line_1.Line),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Route.prototype, "line_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Line_1.Line),
    __metadata("design:type", Line_1.Line)
], Route.prototype, "line", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Route.prototype, "number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Route.prototype, "direction", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => RecZnr_1.RecZnr),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Route.prototype, "destination_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    (0, sequelize_typescript_1.BelongsTo)(() => RecZnr_1.RecZnr, { foreignKey: 'destination_id', targetKey: 'ZNR_NR', as: 'routeDestination' }),
    __metadata("design:type", RecZnr_1.RecZnr)
], Route.prototype, "destination", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    (0, sequelize_typescript_1.BelongsTo)(() => SpecialCharacter_1.SpecialCharacter, { foreignKey: 'special_character', targetKey: 'id', as: 'routeSpecialCharacter' }),
    __metadata("design:type", SpecialCharacter_1.SpecialCharacter)
], Route.prototype, "specialCharacter", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => RouteStop_1.RouteStop),
    __metadata("design:type", Array)
], Route.prototype, "stops", void 0);
exports.Route = Route = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'routes'
    })
], Route);
