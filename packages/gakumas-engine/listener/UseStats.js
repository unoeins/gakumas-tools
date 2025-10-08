
export default class UseStats {
  constructor() {
    this.data = [];
    this.numRuns = 0;
  }

  stageEnded(state, logs) {
    this.numRuns++;
    let turnIndex = -1;
    let drawnCards = new Set();
    for (const log of logs) {
      if (log.logType === "startTurn") {
        turnIndex++;
        drawnCards = new Set();
      } else if (log.logType === "hand") {
        log.data.handCards.forEach((card, index) => {
          const key = JSON.stringify({ id: card.id, c: card.c });
          if (!drawnCards.has(key)) {
            drawnCards.add(key);
            let turnData = this.data[turnIndex];
            if (!turnData) {
              turnData = new Map();
              this.data[turnIndex] = turnData;
            }
            const cardData = turnData.get(key);
            if (!cardData) {
              turnData.set(key, { id: card.id, c: card.c, use: 0, draw: 1 });
            } else {
              cardData.draw++;
            }
          }
          if (index === log.data.selectedIndex) {
            this.data[turnIndex].get(key).use++;
          }
        });
        if (log.data.selectedIndex == null) {
          const key = JSON.stringify({ id: 0 });
          let turnData = this.data[turnIndex];
          if (!turnData) {
            turnData = new Map();
            this.data[turnIndex] = turnData;
          }
          const cardData = turnData.get(key);
          if (!cardData) {
            turnData.set(key, { id: 0, c: null, use: 1, draw: 0 });
          } else {
            cardData.use++;
          }
        }
      }
    }
  }

}
