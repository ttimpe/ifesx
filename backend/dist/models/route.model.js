"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const route_stop_model_1 = require("./route-stop.model");
let Route = (() => {
    let _classDecorators = [(0, sequelize_typescript_1.Table)({
            timestamps: false,
            tableName: 'routes'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = sequelize_typescript_1.Model;
    let _instanceExtraInitializers = [];
    let _line_id_decorators;
    let _line_id_initializers = [];
    let _route_id_decorators;
    let _route_id_initializers = [];
    let _direction_decorators;
    let _direction_initializers = [];
    let _stops_decorators;
    let _stops_initializers = [];
    var Route = _classThis = class extends _classSuper {
        constructor() {
            super(...arguments);
            this.line_id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _line_id_initializers, void 0));
            this.route_id = __runInitializers(this, _route_id_initializers, void 0);
            this.direction = __runInitializers(this, _direction_initializers, void 0);
            this.stops = __runInitializers(this, _stops_initializers, void 0);
        }
    };
    __setFunctionName(_classThis, "Route");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        _line_id_decorators = [(0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING)];
        _route_id_decorators = [(0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING)];
        _direction_decorators = [(0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER)];
        _stops_decorators = [(0, sequelize_typescript_1.HasMany)(() => route_stop_model_1.RouteStop)];
        __esDecorate(null, null, _line_id_decorators, { kind: "field", name: "line_id", static: false, private: false, access: { has: obj => "line_id" in obj, get: obj => obj.line_id, set: (obj, value) => { obj.line_id = value; } }, metadata: _metadata }, _line_id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _route_id_decorators, { kind: "field", name: "route_id", static: false, private: false, access: { has: obj => "route_id" in obj, get: obj => obj.route_id, set: (obj, value) => { obj.route_id = value; } }, metadata: _metadata }, _route_id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _direction_decorators, { kind: "field", name: "direction", static: false, private: false, access: { has: obj => "direction" in obj, get: obj => obj.direction, set: (obj, value) => { obj.direction = value; } }, metadata: _metadata }, _direction_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _stops_decorators, { kind: "field", name: "stops", static: false, private: false, access: { has: obj => "stops" in obj, get: obj => obj.stops, set: (obj, value) => { obj.stops = value; } }, metadata: _metadata }, _stops_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Route = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Route = _classThis;
})();
exports.Route = Route;
