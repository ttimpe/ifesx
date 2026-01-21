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
exports.Announcement = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const RouteStop_1 = require("./RouteStop");
let Announcement = class Announcement extends sequelize_typescript_1.Model {
    constructor() {
        super(...arguments);
        this.stops = [];
    }
};
exports.Announcement = Announcement;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", Number)
], Announcement.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Announcement.prototype, "number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Announcement.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Announcement.prototype, "fullText", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Announcement.prototype, "fileName", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => RouteStop_1.RouteStop, {
        foreignKey: 'announcement_id', // Explicitly defining the foreign key
    }),
    __metadata("design:type", Array)
], Announcement.prototype, "stops", void 0);
exports.Announcement = Announcement = __decorate([
    (0, sequelize_typescript_1.Table)({
        timestamps: false,
        tableName: 'announcements'
    })
], Announcement);
