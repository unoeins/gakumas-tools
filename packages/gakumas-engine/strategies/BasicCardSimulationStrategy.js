import { S } from "../constants";
import { deepCopy } from "../utils";
import BaseStrategy from "./BaseStrategy";

const MAX_DEPTH = 3;
const MAX_TURNS = 6;

export default class BasicCardSimulationStrategy extends BaseStrategy {
  constructor(engine) {
    super(engine);

    const { config } = engine;
    this.averageTypeMultiplier = Object.keys(config.typeMultipliers).reduce(
      (acc, cur) =>
        acc +
        (config.typeMultipliers[cur] * config.stage.turnCounts[cur]) /
          config.stage.turnCount,
      0
    );

    this.goodConditionTurnsMultiplier =
      config.idol.recommendedEffect == "goodConditionTurns" ? 1.75 : 1;
    this.concentrationMultiplier =
      config.idol.recommendedEffect == "concentration" ? 3 : 1;
    this.goodImpressionTurnsMultiplier =
      config.idol.recommendedEffect == "goodImpressionTurns" ? 3.5 : 1;
    this.motivationMultiplier =
      config.idol.recommendedEffect == "motivation" ? 5.5 : 1;
    this.fullPowerMultiplier =
      config.idol.recommendedEffect == "fullPower" ? 5 : 1;

    this.depth = 0;
    this.rootEffectCount = 0;
  }

  evaluate(state) {
    if (this.depth == 0) {
      this.rootEffectCount = state[S.effects].length;
    }

    const logIndex = this.engine.logger.log(state, "hand", null);

    const futures = state[S.handCards].map((card) =>
      this.getFuture(state, card)
    );

    let nextState;

    const scores = futures.map((f) => (f ? f.score : -Infinity));
    let maxScore = Math.max(...scores);
    let selectedIndex = null;
    if (maxScore > 0) {
      selectedIndex = scores.indexOf(maxScore);
      nextState = futures[selectedIndex].state;
    } else {
      nextState = this.engine.endTurn(state);
      maxScore = this.getStateScore(nextState);
    }

    this.engine.logger.logs[logIndex].data = {
      handCards: state[S.handCards].map((card) => ({
        id: state[S.cardMap][card].id,
        c: state[S.cardMap][card].c11n,
      })),
      scores,
      selectedIndex,
      state: this.engine.logger.getHandStateForLogging(state),
    };

    return { score: maxScore, state: nextState };
  }

  getFuture(state, card) {
    if (!this.engine.isCardUsable(state, card)) {
      return null;
    }

    const previewState = this.engine.useCard(state, card);
    this.depth++;

    // Additional actions
    if (
      previewState[S.turnsRemaining] >= state[S.turnsRemaining] &&
      this.depth < MAX_DEPTH
    ) {
      const future = this.evaluate(previewState);
      this.depth--;
      return { score: future.score, state: future.state };
    }

    let score = 0;

    if (this.engine.config.idol.plan != "anomaly") {
      // Cards removed
      score +=
        (((state[S.removedCards].length - previewState[S.removedCards].length) *
          (previewState[S.score] - state[S.score])) /
          this.averageTypeMultiplier) *
        Math.floor(previewState[S.turnsRemaining] / 13);
    }

    score += this.getStateScore(previewState);

    this.depth--;
    return { score: Math.round(score), state: previewState };
  }

  scaleScore(score) {
    return Math.ceil(score * this.averageTypeMultiplier);
  }

  getStateScore(state) {
    state = deepCopy(state);
    const baseScore = state[S.score];
    
    const effects = state[S.effects];
    const limits = effects.map(effect => {
      let limit = Math.min(state[S.turnsRemaining], MAX_TURNS);
      if (
        effect.limit != null &&
        effect.limit < limit
      ) {
        limit = effect.limit;
      }
      return limit;
    });

    const { recommendedEffect } = this.engine.config.idol;
    let score = 0;

    // Turn simulation based on using basic cards only
    const maxTurns = Math.min(state[S.turnsRemaining], MAX_TURNS);
    for(let i=0; i < maxTurns; i++) {
      if(recommendedEffect == "goodConditionTurns" || recommendedEffect == "concentration") {
        score +=
          (9 + state[S.concentration]) *
          (state[S.goodConditionTurns] ? 
            1.5 + (state[S.perfectConditionTurns] ? 
              state[S.goodConditionTurns] * 0.1 : 0) : 
            1);
      } else if (recommendedEffect == "goodImpressionTurns") {
        state[S.goodImpressionTurns] += 2;
        score += state[S.goodImpressionTurns];
      } else if (recommendedEffect == "motivation") {
        state[S.genki] += state[S.motivation] + 1;
        state[S.motivation] += 2;
        score += state[S.goodImpressionTurns];
      }

      // Effects -- TODO: make this not suck
      for (let j = 0; j < effects.length; j++) {
        const effect = effects[j];
        const limit = limits[j];
        if (limit < i) continue;
        this.engine.effectManager.triggerEffects(
          state,
          [
            {
              ...effect,
              phase: null,
              delay: effect.delay - state[S.turnsRemaining],
            },
          ],
          null,
          null,
          true
        );
      }

      // Decrement turn based buffs
      if(state[S.goodConditionTurns]) {
        state[S.goodConditionTurns] -= 1;
      }
      if(state[S.perfectConditionTurns]) {
        state[S.perfectConditionTurns] -= 1;
      }
      if(state[S.goodImpressionTurns]) {
        state[S.goodImpressionTurns] -= 1;
      }
    }

    // Simulation score
    score += state[S.score] - baseScore;

    // Cards in hand
    score += state[S.handCards].length * 3;

    // Stamina
    score += state[S.stamina] * state[S.turnsRemaining] * 0.01;

    // Genki
    score += state[S.genki] * state[S.turnsRemaining] * 0.01;

    // Stance
    if (
      this.engine.config.idol.plan == "anomaly" &&
      (state[S.turnsRemaining] || state[S.cardUsesRemaining])
    ) {
      score += state[S.strengthTimes] * 40;
      score += state[S.preservationTimes] * 80;
      score += state[S.leisureTimes] * 80;
      score += state[S.fullPowerTimes] * 80 * this.fullPowerMultiplier;

      //Enthusiasm
      score += state[S.enthusiasm] * 5;
      if (state[S.turnsRemaining]) {
        score += state[S.enthusiasmBonus] * 5 * state[S.enthusiasmMultiplier];
      }

      // Full power charge
      score +=
        state[S.cumulativeFullPowerCharge] * 3 * this.fullPowerMultiplier;

      // Growth
      score += this.getGrowthScore(state) * 0.2 * state[S.turnsRemaining];
    }

    // Good impression turns
    if(recommendedEffect == "goodImpressionTurns") {
      if(state[S.turnsRemaining]) {
        const s = state[S.stamina] + state[S.genki];
        score += (state[S.goodImpressionTurns] * (s >= 5 ? 1 : s / 5));
      }
    }

    // Motivation
    if(recommendedEffect == "motivation") {
      if(state[S.turnsRemaining] >= 2) {
        score += (state[S.genki] * (state[S.stamina] >= 10 ? 2 : state[S.stamina] / 5));
      } else if(state[S.turnsRemaining] >= 1) {
        score += (state[S.genki] * (state[S.stamina] >= 5 ? 1 : state[S.stamina] / 5));
      }
    } else {
      score +=
        state[S.motivation] *
        state[S.turnsRemaining] *
        0.45 *
        this.motivationMultiplier;
    }

    // Half cost turns
    score += Math.min(state[S.halfCostTurns], state[S.turnsRemaining]) * 6;

    // Double cost turns
    score += Math.min(state[S.doubleCostTurns], state[S.turnsRemaining]) * -6;

    // Cost reduction
    score += state[S.costReduction] * state[S.turnsRemaining] * 0.5;

    // Double card effect cards
    score += state[S.doubleCardEffectCards] * 50;

    // Card uses remaining
    score += state[S.cardUsesRemaining] * 50;

    // Good impression turns buffs
    score +=
      state[S.goodImpressionTurnsBuffs].reduce(
        (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
        0
      ) *
      10 *
      this.goodImpressionTurnsMultiplier;

    // Good impression turns effects buffs
    score +=
      state[S.goodImpressionTurnsEffectBuffs].reduce(
        (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
        0
      ) *
      state[S.goodImpressionTurns] *
      this.goodImpressionTurnsMultiplier;

    // Good condition turns buffs
    score +=
      state[S.goodConditionTurnsBuffs].reduce(
        (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
        0
      ) * this.goodConditionTurnsMultiplier;

    // Concentration buffs
    score +=
      state[S.concentrationBuffs].reduce(
        (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
        0
      ) * this.concentrationMultiplier;

    // Full power charge buffs
    score +=
      state[S.fullPowerChargeBuffs].reduce(
        (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
        0
      ) * this.fullPowerMultiplier;

    // Nullify genki turns
    score += state[S.nullifyGenkiTurns] * -9;

    // Turn cards upgraded
    score += state[S.turnCardsUpgraded] * 20;

    if(state[S.turnsRemaining]) {
      // Score buffs
      const totalScoreBuffs = state[S.scoreBuffs].reduce(
        (acc, cur) => 
          acc + cur.amount * 
          (cur.turns ? 
            Math.min(cur.turns, state[S.turnsRemaining]) : 
            state[S.turnsRemaining]),
        0
      ) / state[S.turnsRemaining];
      score *= 1 + totalScoreBuffs;

      // Score debuffs
      const totalScoreDebuffs = state[S.scoreDebuffs].reduce(
        (acc, cur) => 
          acc + cur.amount * 
          (cur.turns ? 
            Math.min(cur.turns, state[S.turnsRemaining]) : 
            state[S.turnsRemaining]),
        0
      ) / state[S.turnsRemaining];
      score *= totalScoreDebuffs < 1 ? 1 - totalScoreDebuffs : 0;
    }

    // Scale score
    score = this.scaleScore(score);

    if (recommendedEffect == "goodConditionTurns") {
      score += baseScore * 0.4;
    } else if (recommendedEffect == "concentration") {
      score += baseScore * 0.6;
    } else if (recommendedEffect == "goodImpressionTurns") {
      score += baseScore * 1.1;
    } else if (recommendedEffect == "motivation") {
      score += baseScore * 0.6;
    } else if (recommendedEffect == "strength") {
      score += baseScore * 0.65;
    } else if (recommendedEffect == "preservation") {
      score += baseScore * 0.65;
    } else if (recommendedEffect == "fullPower") {
      score += baseScore * 0.8;
    } else {
      score += baseScore;
    }

    return Math.round(score);
  }

  getGrowthScore(state) {
    let growthScore = 0;
    const multipliers = {
      [S["g.score"]]: 2,
      [S["g.scoreTimes"]]: 20,
      [S["g.cost"]]: 1,
      [S["g.typedCost"]]: 1,
      [S["g.genki"]]: 1,
      [S["g.goodConditionTurns"]]: 1,
      [S["g.perfectConditionTurns"]]: 1,
      [S["g.concentration"]]: 2,
      [S["g.goodImpressionTurns"]]: 1,
      [S["g.motivation"]]: 1,
      [S["g.fullPowerCharge"]]: 1,
      [S["g.halfCostTurns"]]: 1,
      [S["g.scoreByGoodImpressionTurns"]]: 20,
      [S["g.scoreByMotivation"]]: 20,
      [S["g.scoreByGenki"]]: 20,
      [S["g.stanceLevel"]]: 2,
    };
    for (let { growth } of state[S.cardMap]) {
      if (!growth) continue;
      for (let key in growth) {
        growthScore += growth[key] * (multipliers[key] || 1);
      }
    }
    return growthScore;
  }

  evaluateForHold(state, card) {
    let previewState = this.engine.getInitialState(true);
    previewState[S.cardMap] = deepCopy(state[S.cardMap]);
    this.engine.buffManager.setStance(previewState, "fullPower");
    previewState[S.nullifyHold] = true;
    previewState = this.engine.useCard(previewState, card);
    return Math.round(previewState[S.score]);
  }

  pickCardsToHold(state, cards, num = 1) {
    let scores = [];
    for (let i = 0; i < cards.length; i++) {
      scores.push(this.evaluateForHold(state, cards[i]));
    }
    const sortedIndices = scores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, num)
      .map((item) => item.index);
    return sortedIndices;
  }
}
