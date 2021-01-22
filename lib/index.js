"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const colyseus_1 = require("colyseus");
const monitor_1 = require("@colyseus/monitor");
const Game_1 = require("./rooms/Game");
const pkg_dir_1 = __importDefault(require("pkg-dir"));
console.clear();
const port = Number(process.env.PORT || 2567);
const app = express_1.default();
// app.use(pino({ logger }));
app.use(cors_1.default());
app.use(express_1.default.json());
app.use(express_1.default.static(pkg_dir_1.default.sync() + "/dist/"));
const server = http_1.default.createServer(app);
const gameServer = new colyseus_1.Server({
    server,
});
// register your room handlers
gameServer.define("game", Game_1.Game);
// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor_1.monitor());
gameServer.listen(port);
console.log(`Listening on http://localhost:${port}`);
