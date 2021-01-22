import * as PIXI from "pixi.js-legacy";
import * as Colyseus from "colyseus.js";
import confetti from "canvas-confetti";
const client = new Colyseus.Client();
const wordsForNumbers = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};
function word2num(word: string) {
  return (
    wordsForNumbers[word.trim().toLowerCase()] ||
    (word.trim().toLowerCase() === "zero" ? 0 : word.trim().toLowerCase())
  );
}
function cardIdToAsset(s: string) {
  const cardColor = s.split(" ").shift().toLowerCase();
  const cardNumber = word2num(s.split(" ").pop().toLowerCase());
  if (cardColor === "no_color") {
    return `color_${cardNumber}`;
  } else {
    return `color_${cardColor.replace(
      "blue",
      "purple"
    )}_${cardNumber.toString().replace("draw_two", "draw")}`;
  }
}
//@ts-expect-error
import cards from "./assets/*.png";
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: true,
});
window.onresize = () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
};
document.body.appendChild(app.view);
const loader = new PIXI.Loader();
Object.keys(cards).forEach((cardName) => {
  loader.add(cardName, cards[cardName]);
});
loader.load(setup);
function setup(
  loader: PIXI.Loader,
  resources: Partial<Record<string, PIXI.LoaderResource>>
) {
  client
    .joinOrCreate("game")
    .then(
      //@ts-expect-error
      (
        room: Colyseus.Room<{
          hands: Map<string, { cards: string[] }>;
          discarded: string;
          currentPlayer: string;
          drawPileCards: number;
        }>
      ) => {
        room.onMessage("win", () => {
          confetti();
        });
        room.onStateChange((state) => {
          if (state.hands.has(room.sessionId)) {
            // render hand
            const cardSprites = render(
              resources,
              state.hands.get(room.sessionId).cards.map(cardIdToAsset)
            );
            // our hand
            const hand = state.hands.get(room.sessionId).cards;
            cardSprites.forEach((sprite, i) => {
              const card = hand[i];
              sprite.interactive = true;
              sprite.on("mousedown", () => {
                console.log(card);
                if (
                  card.split(" ").pop() === "WILD" ||
                  card.split(" ").pop() === "WILD_DRAW_FOUR"
                ) {
                  console.log(card);
                  (document.getElementById(
                    "dialog-color"
                  ) as HTMLDialogElement).open = true;
                  const buttons: {
                    red: HTMLButtonElement;
                    purple: HTMLButtonElement;
                    yellow: HTMLButtonElement;
                    green: HTMLButtonElement;
                  } = {
                    //@ts-expect-error
                    red: document.getElementById("red"),
                    //@ts-expect-error
                    green: document.getElementById("green"),
                    //@ts-expect-error
                    purple: document.getElementById("purple"),
                    //@ts-expect-error
                    yellow: document.getElementById("yellow"),
                  };
                  Object.keys(buttons).forEach(
                    //@ts-expect-error
                    (color: "red" | "green" | "purple" | "yellow") => {
                      buttons[color].onclick = () => {
                        console.log(color);
                        (document.getElementById(
                          "dialog-color"
                        ) as HTMLDialogElement).open = false;
                        room.send("play", { card, color: color.toUpperCase() });
                      };
                    }
                  );
                } else room.send("play", { card });
              });
            });
            // other player hands
            Array.from(room.state.hands.keys())
              .filter((key) => key !== room.sessionId)
              .forEach((key, handNum) => {
                const hand = room.state.hands.get(key);
                hand.cards.forEach((assetId, i) => {
                  try {
                    const sprite = new PIXI.Sprite(
                      resources["color_back"].texture
                    );
                    sprite.scale.set(4, 4);

                    sprite.x = i * (sprite.width / 1.5);
                    sprite.y =
                      app.renderer.height - (handNum + 1) * sprite.height;
                    app.stage.addChild(sprite);
                  } catch (error) {
                    throw assetId;
                  }
                });
              });

            for (let i = 0; i < room.state.drawPileCards; i++) {
              const pileSprite = new PIXI.Sprite(
                resources["color_back"].texture
              );
              pileSprite.scale.set(4, 4);

              pileSprite.x = 16 + app.renderer.width / 2 - i / 4;
              pileSprite.y = app.renderer.height / 2;
              pileSprite.interactive = true;
              pileSprite.on("mousedown", () => {
                room.send("draw");
              });
              app.stage.addChild(pileSprite);
            }

            if (room.state.discarded) {
              const discardSprite = new PIXI.Sprite(
                resources[cardIdToAsset(room.state.discarded)].texture
              );
              discardSprite.scale.set(4, 4);

              discardSprite.x = app.renderer.width / 2 - discardSprite.width;
              discardSprite.y = app.renderer.height / 2;

              app.stage.addChild(discardSprite);
            }
            // show who's turn it is
            const text = new PIXI.Text(
              room.state.currentPlayer === room.sessionId
                ? "It IS your turn"
                : "It is NOT your turn",
              {
                fontSize: 64,
                fontFamily: "'VT323'",
                fill:
                  room.state.currentPlayer === room.sessionId ? "green" : "red",
              }
            );
            text.x = app.renderer.width - (text.width + 16);
            text.y = 32;

            app.stage.addChild(text);

            // show uno button
            const unoBtn = new PIXI.Sprite(resources["btn_uno"].texture);
            unoBtn.scale.set(4, 4);

            unoBtn.x = app.renderer.width / 2;
            unoBtn.y = app.renderer.height / 2 - unoBtn.height;
            unoBtn.interactive = true;
            unoBtn.on("mousedown", () => {
              room.send("uno");
            });
            app.stage.addChild(unoBtn);
          } else {
            clearStage();
            const text = new PIXI.Text("Waiting for players...", {
              fontSize: 64,
              fontFamily: "'VT323'",
            });
            text.x = 40;
            text.y = 40;
            app.stage.addChild(text);
          }
        });
      }
    )
    .catch((reason) => alert(reason));
}
function clearStage() {
  for (var i = app.stage.children.length - 1; i >= 0; i--) {
    app.stage.removeChild(app.stage.children[i]);
  }
}
function render(
  resources: Partial<Record<string, PIXI.LoaderResource>>,
  hand: string[]
) {
  clearStage();
  const handSprites: PIXI.Sprite[] = [];
  hand.forEach((assetId, i) => {
    try {
      const sprite = new PIXI.Sprite(resources[assetId].texture);
      sprite.scale.set(4, 4);

      sprite.x = i * (sprite.width / 1.5);
      app.stage.addChild(sprite);
      handSprites.push(sprite);
    } catch (error) {
      throw assetId;
    }
  });
  return handSprites;
}
