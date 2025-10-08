
export default class PriorityStats {
  constructor() {
    this.data = new Map();
  }

  stageEnded(state, logs) {
    let turnIndex = -1;
    for (const log of logs) {
      if (log.logType === "startTurn") {
        turnIndex++;
      } else if (log.logType === "hand") {
        const selectedCard = log.data.selectedIndex != null ?
          log.data.handCards[log.data.selectedIndex] : { id: 0 };
        const key = JSON.stringify({ id: selectedCard.id, c: selectedCard.c });
        let others = this.data.get(key);
        if (!others) {
          others = { id: selectedCard.id, c: selectedCard.c, others: new Map() };
          this.data.set(key, others);
        }
        for (let i = 0; i < log.data.handCards.length; i++) {
          if (i !== log.data.selectedIndex) {
            const otherCard = log.data.handCards[i];
            const otherKey = JSON.stringify({ id: otherCard.id, c: otherCard.c });
            let otherData = others.others.get(otherKey);
            if (!otherData) {
              otherData = { id: otherCard.id, c: otherCard.c, count: [] };
              others.others.set(otherKey, otherData);
            }
            if (otherData.count[turnIndex] != null ) {
              otherData.count[turnIndex]++;
            } else {
              otherData.count[turnIndex] = 1;
            }
            if (!this.data.has(otherKey)) {
              this.data.set(otherKey, { id: otherCard.id, c: otherCard.c, others: new Map() });
            }
          }
        }
      }
    }
  }

}
