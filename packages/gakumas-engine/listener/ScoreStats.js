import { S } from "../constants";

export default class ScoreStats {
  constructor() {
    this.data = [];
    this.turnTypes = [];
    this.numRuns = 0;
  }

  stageEnded(state, logs) {
    this.numRuns++;
    let turnIndex = -1;
    let turnType = null;
    let group = new Group(null, { type: "root" });
    for (const log of logs) {
      if (log.logType === "startTurn") {
        turnIndex++;
        turnType = log.data.type;
        if (!this.data[turnIndex]) {
          this.data[turnIndex] = new Map();
        }
        if (!this.turnTypes[turnIndex]) {
          this.turnTypes[turnIndex] = {
            "vocal": 0, "dance": 0, "visual": 0
          };
        }
        this.turnTypes[turnIndex][turnType] += 1;
      } else if (log.logType === "entityStart") {
        const entityGroup = new Group(group, log.data);
        group.add(entityGroup);
        group = entityGroup;
      } else if (log.logType === "entityEnd") {
        group = group.parent;
      } else if (log.logType === "diff" && log.data.field === S.score) {
        const score = group.calculateScore(log.data.prev, log.data.next);
        if (score > 0) {
          const turnData = this.data[turnIndex];
          let entityData = turnData.get(group.key);
          if (!entityData) {
            entityData = {
              ...group.entity,
              scores: { "vocal": 0, "dance": 0, "visual": 0 },
            };
            entityData.scores[turnType] = score;
            turnData.set(group.key, entityData);
          } else {
            entityData.scores[turnType] += score;
          }
        }
        if (score < 0) {
          console.warn("Negative score", {
            score,
            turnIndex,
            turnType,
            entity: group.entity,
            log,
            logs,
          });
        }
      }
    }
  }
}

class Group {
  constructor(parent, entity) {
    this.parent = parent;
    this.entity = entity;
    this.key = JSON.stringify({ type: entity.type, id: entity.id });
    this.children = [];
    this.prevScores = [];
    this.nextScores = [];
    this.scores = [];
  }

  add(child) {
    this.children.push(child);
  }

  calculateScore(prevScore, nextScore) {
    this.prevScores.push(prevScore);
    this.nextScores.push(nextScore);
    const groupScore = nextScore - prevScore;
    const internalScore = this.calculateInternalScore(prevScore, nextScore);
    const score = groupScore - internalScore;
    this.scores.push(score);
    return score;
  }

  calculateInternalScore(prevScore, nextScore) {
    return this.children.reduce((a, b) => {
      let score = a;
      for (let i = 0; i < b.prevScores.length; i++) {
        if (b.prevScores[i] >= prevScore && b.nextScores[i] <= nextScore) {
          score += b.scores[i];
        }
      }
      score += b.calculateInternalScore(prevScore, nextScore);
      return score;
    }, 0);
  }
}
