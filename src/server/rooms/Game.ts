import { Room, Client } from "colyseus";
import { Colors, Game as UnoGame } from "uno-engine";
import { Player } from "uno-engine/dist/player";
import { GameState, Hand } from "./schema/GameState";
export class Game extends Room {
  state: GameState;
  engine: UnoGame;
  onCreate(options: { maxPlayers: number }) {
    this.setState(new GameState());
    this.maxClients = options.maxPlayers || 2;
  }

  onJoin(client: Client, options: any) {
    if (this.clients.length === this.maxClients) {
      this.state.running = true;
      this.engine = new UnoGame(this.clients.map((c) => c.sessionId));
      this.updateState();
      this.onMessage("play", (client, msg) => this.playerPlay(client, msg));
      this.onMessage("draw", (client, msg) => this.playerDraw(client));
      this.onMessage("uno", (client, msg) => this.playerUno(client));

      this.engine.on(
        "end",
        (msg: { data: { winner: Player; score: number } }) => {
          console.log(msg);
        }
      );
    }
  }
  updateState() {
    this.engine.players.forEach((player) => {
      this.state.hands.set(player.name, new Hand());
      player.hand.forEach((c) =>
        this.state.hands.get(player.name).cards.push(c.toString())
      );
    });
    this.state.discarded = this.engine.discardedCard.toString();
    this.state.currentPlayer = this.engine.currentPlayer.name;
    this.state.drawPileCards = this.engine["drawPile"].length;
  }
  playerUno(client: Client) {
    if (!this.state.running) {
      return false;
    }
    if (this.engine.currentPlayer.name === client.sessionId) {
      try {
        this.engine.uno();
        this.state.gameLog.push(`${client.sessionId} SHOUT`);
      } catch (error) {
        console.log(error.message);
      }
      this.updateState();
    }
  }
  playerPlay(client: Client, msg: { card: string; color?: string }) {
    if (!this.state.running) {
      return false;
    }
    if (this.engine.currentPlayer.name === client.sessionId) {
      const card = this.engine
        .getPlayer(client.sessionId)
        .hand.find((c) => c.toString() === msg.card);
      if (card.color === undefined) {
        card.color = (Colors as any)[msg.color.toUpperCase()];
      }
      try {
        this.engine.play(card);
        this.state.gameLog.push(`${client.sessionId} PLAY ${card.toString()}`);
      } catch (error) {
        console.log(error.message);
      }

      this.updateState();
    }
  }
  playerDraw(client: Client) {
    if (!this.state.running) {
      return false;
    }
    if (this.engine.currentPlayer.name === client.sessionId) {
      try {
        this.engine.draw();
        this.state.gameLog.push(`${client.sessionId} DRAW`);
      } catch (error) {
        console.log(error.message);
      }
      this.updateState();
    }
  }
  onLeave() {
    this.disconnect();
  }
  onDispose() {}
}
