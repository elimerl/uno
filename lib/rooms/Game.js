"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const colyseus_1 = require("colyseus");
const { Colors } = require("uno-engine");
const uno_engine_1 = require("uno-engine");
const GameState_1 = require("./schema/GameState");
class Game extends colyseus_1.Room {
    onCreate() {
        this.setState(new GameState_1.GameState());
        this.maxClients = 2;
    }
    onJoin(client, options) {
        if (this.clients.length === 2) {
            this.state.running = true;
            this.engine = new uno_engine_1.Game(this.clients.map((c) => c.sessionId));
            this.updateState();
            this.onMessage("play", (client, msg) => this.playerPlay(client, msg));
            this.engine.on("end", (msg) => {
                console.log(msg);
            });
        }
    }
    updateState() {
        this.engine.players.forEach((player) => {
            this.state.hands.set(player.name, new GameState_1.Hand());
            player.hand.forEach((c) => this.state.hands.get(player.name).cards.push(c.toString()));
        });
        this.state.discarded = this.engine.discardedCard.toString();
        this.state.currentPlayer = this.engine.currentPlayer.name;
        this.state.drawPileCards = this.engine["drawPile"].length;
    }
    playerPlay(client, msg) {
        if (!this.state.running) {
            return false;
        }
        if (this.engine.currentPlayer.name === client.sessionId) {
            const card = this.engine
                .getPlayer(client.sessionId)
                .hand.find((c) => c.toString() === msg.card);
            if (card.color === undefined) {
                card.color = Colors[msg.color.toUpperCase()];
            }
            try {
                this.engine.play(card);
            }
            catch (error) {
                console.log(error.message);
            }
            this.engine.draw();
            this.engine.pass();
            this.updateState();
        }
    }
    onLeave() {
        this.disconnect();
    }
    onDispose() { }
}
exports.Game = Game;
