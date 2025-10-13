
export default class ConditionalUseStats {
  constructor() {
    this.data = new Map();
  }

  stageEnded(state, logs) {
    let turnIndex = -1;
    let drawnCards = new Map();
    let usedCards = new Map();
    const pass = JSON.stringify({ id: 0 });
    for (const log of logs) {
      if (log.logType === "startTurn") {
        this.updateData(turnIndex, drawnCards, usedCards);
        turnIndex++;
        drawnCards = new Map();
        usedCards = new Map();
        drawnCards.set(pass, { id: 0 });
      } else if (log.logType === "hand") {
        log.data.handCards.forEach((card, index) => {
          const key = JSON.stringify({ id: card.id, c: card.c });
          if (!drawnCards.has(key)) {
            drawnCards.set(key, card);
          }
          if (index === log.data.selectedIndex) {
            if (!usedCards.has(key)) {
              usedCards.set(key, 1);
            } else {
              usedCards.set(key, usedCards.get(key) + 1);
            }
          }
        });
        if (log.data.selectedIndex == null) {
          usedCards.set(pass, 1);
        }
      }
    }
    // last turn
    this.updateData(turnIndex, drawnCards, usedCards);
  }

  updateData(turnIndex, drawnCards, usedCards) {
    drawnCards.forEach((card, key) => {
      let keyedData = this.data.get(key);
      if (!keyedData) {
        keyedData = { id: card.id, c: card.c, turns: [] };
        this.data.set(key, keyedData);
      }
      let turnData = keyedData.turns[turnIndex];
      if (!turnData) {
        turnData = new Map();
        keyedData.turns[turnIndex] = turnData;
      }
      drawnCards.forEach((card2, key2) => {
        let cardData = turnData.get(key2);
        if (!cardData) {
          cardData = { id: card2.id, c: card2.c, use: 0, draw: 1 };
          turnData.set(key2, cardData);
        } else {
          cardData.draw++;
        }
        if (usedCards.has(key2)) {
          cardData.use += usedCards.get(key2);
        }
      });
    });
  }

}
