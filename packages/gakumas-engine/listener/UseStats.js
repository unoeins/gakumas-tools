import { S } from "../constants";
import deepEqual from 'fast-deep-equal';

export default class UseStats {
  constructor() {
    this.data = [];
  }

  // cardUsed(state, card) {
  //   let turnData = this.data[state[S.turnsElapsed]];
  //   if (!turnData) {
  //     turnData = new Map();
  //     this.data[state[S.turnsElapsed]] = turnData;
  //   }
  //   turnData.set(state[S.cardMap][card], (turnData.get(state[S.cardMap][card]) || 0) + 1);
  // }

  stageEnded(state, logs) {
    let turnIndex = -1;
    for (const log of logs) {
      if (log.logType === "startTurn") {
        turnIndex++;
      } else if (log.logType === "hand") {
        const card = log.data.selectedIndex != null ? 
          log.data.handCards[log.data.selectedIndex] : { id: 0 };
        let turnData = this.data[turnIndex];
        if (!turnData) {
          turnData = [];
          this.data[turnIndex] = turnData;
        }
        const index = turnData.findIndex((data) => data.id === card.id &&
                      (card.c ? deepEqual(card.c, data.c) : !data.c));
        if (index >= 0) {
          turnData[index].count++;
        } else {
          turnData.push({ id: card.id, c: card.c, count: 1 });
        }
      }
    }
  }

  mergeResults(statsArray) {
    const merged = new UseStats();
    for (const stats of statsArray) {
      for (const [turn, cardsUsed] of stats.data.entries()) {
        merged.data[turn] = (merged.data[turn] || []);
        for (const { id, c, count } of cardsUsed) {
          const index = merged.data[turn].findIndex((data) => data.id === id && data.c === c);
          if (index >= 0) {
            merged.data[turn][index].count += count;
          } else {
            merged.data[turn].push({ id, c, count });
          }
        }
      }
    }
    return merged;
  }
}
