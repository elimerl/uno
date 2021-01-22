"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.Hand = void 0;
const schema_1 = require("@colyseus/schema");
class Hand extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.cards = new schema_1.ArraySchema();
    }
}
__decorate([
    schema_1.type(["string"])
], Hand.prototype, "cards", void 0);
exports.Hand = Hand;
class GameState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.running = false;
        this.hands = new schema_1.MapSchema();
    }
}
__decorate([
    schema_1.type("boolean")
], GameState.prototype, "running", void 0);
__decorate([
    schema_1.type({ map: Hand })
], GameState.prototype, "hands", void 0);
__decorate([
    schema_1.type("string")
], GameState.prototype, "discarded", void 0);
__decorate([
    schema_1.type("string")
], GameState.prototype, "currentPlayer", void 0);
__decorate([
    schema_1.type("number")
], GameState.prototype, "drawPileCards", void 0);
exports.GameState = GameState;
