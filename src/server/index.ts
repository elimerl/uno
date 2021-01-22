import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { Game } from "./rooms/Game";
import pkgDir from "pkg-dir";
console.clear();
const port = Number(process.env.PORT || 2567);
const app = express();
// app.use(pino({ logger }));
app.use(cors());
app.use(express.json());
app.use(express.static(pkgDir.sync() + "/dist/"));

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

// register your room handlers
gameServer.define("game", Game, {
  maxPlayers: Number(process.env.MAX_PLAYERS || 2),
});
// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on http://localhost:${port}`);
