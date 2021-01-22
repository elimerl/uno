import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
export class Hand extends Schema {
  @type(["string"])
  cards: ArraySchema<string> = new ArraySchema<string>();
}

export class GameState extends Schema {
  @type("boolean")
  running: boolean = false;
  @type({ map: Hand })
  hands: MapSchema<Hand> = new MapSchema<Hand>();
  @type("string")
  discarded: string;
  @type("string")
  currentPlayer: string;
  @type("number")
  drawPileCards: number;
  @type(["string"])
  gameLog: string[] = [];
}
