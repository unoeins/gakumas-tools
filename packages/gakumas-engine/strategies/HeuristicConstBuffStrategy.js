import { S } from "../constants";
import { deepCopy } from "../utils";
import BaseStrategy from "./BaseStrategy";

const MAX_DEPTH = 3;

export default class HeuristicConstBuffStrategy extends BaseStrategy {
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
      config.idol.recommendedEffect == "goodConditionTurns" ? 4 : 1;
    this.concentrationMultiplier =
      config.idol.recommendedEffect == "concentration" ? 4 : 1;
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
    const scoreBreakdowns = futures.map((f) => (f ? f.scoreBreakdown : {}));
    let maxScore = Math.max(...scores);
    let selectedIndex = null;
    let scoreBreakdown = {};
    if (maxScore > 0) {
      selectedIndex = scores.indexOf(maxScore);
      nextState = futures[selectedIndex].state;
      scoreBreakdown = futures[selectedIndex].scoreBreakdown;
    } else {
      nextState = this.engine.endTurn(state);
      maxScore = this.getStateScore(nextState).score;
    }

    this.engine.logger.logs[logIndex].data = {
      handCards: state[S.handCards].map((card) => ({
        id: state[S.cardMap][card].id,
        c: state[S.cardMap][card].c11n,
      })),
      scores,
      scoreBreakdowns,
      selectedIndex,
      state: this.engine.logger.getHandStateForLogging(state),
    };

    return { score: maxScore, state: nextState, scoreBreakdown: scoreBreakdown };
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
      return { score: future.score, state: future.state, scoreBreakdown: future.scoreBreakdown };
    }

    let score = 0;

    // Effects -- TODO: make this not suck
    const effectsDiff = previewState[S.effects].length - this.rootEffectCount;
    let effectScore = 0;
    for (let i = 0; i < effectsDiff; i++) {
      const effect =
        previewState[S.effects][previewState[S.effects].length - i - 1];
      let limit = previewState[S.turnsRemaining];
      if (
        effect.limit != null &&
        effect.limit < previewState[S.turnsRemaining]
      ) {
        limit = effect.limit + 1;
      }
      if (limit == 0) continue;
      const postEffectState = deepCopy(previewState);
      this.engine.effectManager.triggerEffects(
        postEffectState,
        [
          {
            ...effect,
            phase: null,
            delay: effect.delay - previewState[S.turnsRemaining],
          },
        ],
        null,
        null,
        true
      );
      const scoreDelta =
        this.getStateScore(postEffectState).score - this.getStateScore(previewState).score;
      effectScore += scoreDelta * Math.min(limit, 6);
    }
    score += effectScore;

    const stateScore = this.getStateScore(previewState);
    score += stateScore.score;

    this.depth--;
    return { 
      score: Math.round(score),
      state: previewState,
      scoreBreakdown: {
        ...stateScore.breakdown,
        effect: Math.round(effectScore),
      }
    };
  }

  scaleScore(score) {
    return Math.ceil(score * this.averageTypeMultiplier);
  }

  getStateScore(state) {
    const turnCount = state[S.turnsElapsed] + state[S.turnsRemaining];

    let score = 0;

    if (state[S.turnsRemaining] > 0) {
      // Cards in hand
      score += state[S.handCards].length * turnCount * 3;

      // Stamina
      score += state[S.stamina] * turnCount * 0.05;

      // Genki
      // const genkiCoef = Math.tanh(Math.min(state[S.turnsRemaining], state[S.turnsElapsed]) / 3);
      score +=
        state[S.genki] *
        // genkiCoef *
        0.7 *
        this.motivationMultiplier;

      // Good condition turns
      score +=
        state[S.goodConditionTurns] *
        turnCount *
        this.goodConditionTurnsMultiplier;

      // Perfect condition turns
      score +=
        Math.min(state[S.perfectConditionTurns], state[S.turnsRemaining]) *
        state[S.goodConditionTurns] * 0.2 *
        turnCount *
        this.goodConditionTurnsMultiplier;

      // Concentration
      score +=
        state[S.concentration] *
        turnCount *
        this.concentrationMultiplier;

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
        score += this.getGrowthScore(state) * 0.2 * turnCount;
      }

      // Good impression turns
      score +=
        state[S.goodImpressionTurns] *
        turnCount *
        this.goodImpressionTurnsMultiplier;

      // Motivation
      score +=
        state[S.motivation] *
        turnCount *
        0.45 *
        this.motivationMultiplier;

      // Score buffs
      score +=
        state[S.scoreBuffs].reduce(
          (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
          0
        ) * turnCount * 8;

      // Score debuffs
      score +=
        state[S.scoreDebuffs].reduce(
          (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
          0
        ) * turnCount * -8;

      // Half cost turns
      score += 
        Math.min(state[S.halfCostTurns], state[S.turnsRemaining]) * 
        turnCount *
        6;

      // Double cost turns
      score += 
        Math.min(state[S.doubleCostTurns], state[S.turnsRemaining]) * 
        turnCount *
        -6;

      // Cost reduction
      score += state[S.costReduction] * turnCount * 0.5;

      // Double card effect cards
      score += state[S.doubleCardEffectCards] * turnCount * 50;

      // Card uses remaining
      score += state[S.cardUsesRemaining] * turnCount * 50;

      // Good impression turns buffs
      score +=
        state[S.goodImpressionTurnsBuffs].reduce(
          (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
          0
        ) *
        turnCount *
        10 *
        this.goodImpressionTurnsMultiplier;

      // Good impression turns effects buffs
      score +=
        state[S.goodImpressionTurnsEffectBuffs].reduce(
          (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
          0
        ) *
        state[S.goodImpressionTurns] *
        turnCount *
        this.goodImpressionTurnsMultiplier;

      // Good condition turns buffs
      score +=
        state[S.goodConditionTurnsBuffs].reduce(
          (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
          0
        ) *
        turnCount *
        this.goodConditionTurnsMultiplier;

      // Concentration buffs
      score +=
        state[S.concentrationBuffs].reduce(
          (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
          0
        ) *
        turnCount *
        this.concentrationMultiplier;

      // Full power charge buffs
      score +=
        state[S.fullPowerChargeBuffs].reduce(
          (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
          0
        ) *
        turnCount *
        this.fullPowerMultiplier;

      // Nullify genki turns
      score += state[S.nullifyGenkiTurns] * turnCount * -9;

      // Turn cards upgraded
      score += state[S.turnCardsUpgraded] * turnCount * 20;

      // Current turn score buffs
      const totalScoreBuffs = state[S.scoreBuffs].reduce(
        (acc, cur) => 
          acc + cur.amount,
        0
      );
      score *= 1 + totalScoreBuffs;

      // Current turn score debuffs
      const totalScoreDebuffs = state[S.scoreDebuffs].reduce(
        (acc, cur) => 
          acc + cur.amount,
        0
      );
      score *= totalScoreDebuffs < 1 ? 1 - totalScoreDebuffs : 0;
    }

    // Scale score
    score = this.scaleScore(score);
    const buffScore = score;

    // Effect score
    let scoreEffectScore = 0;
    if (state[S.turnsRemaining] > 0) {
      const effectState = deepCopy(state);
      effectState[S.stance] = "none";
      const effects = effectState[S.effects].filter(
        (e) => e.actions && e.actions.some(a => a[0] == "score"));
      let preEffectScore = effectState[S.score];
      for (let i = 0; i < effects.length; i++) {
        const effect = effects[i];
        let limit = turnCount;
        if (
          effect.limit != null &&
          effect.limit < limit
        ) {
          limit = effect.limit;
        }
        if (limit <= 0) continue;
        this.engine.effectManager.triggerEffects(
          effectState,
          [
            {
              ...effect,
              phase: null,
              delay: effect.delay - effectState[S.turnsRemaining],
            },
          ],
          null,
          null,
          true
        );
        const effectScore = (effectState[S.score] - preEffectScore) * limit;
        scoreEffectScore += effectScore / this.engine.turnManager.getTurnMultiplier(effectState);
        preEffectScore = effectState[S.score];
      }
      // Scale score
      scoreEffectScore *= turnCount / 2;
      scoreEffectScore = this.scaleScore(scoreEffectScore);
      score += scoreEffectScore;
    }

    let actualScore;
    const { recommendedEffect } = this.engine.config.idol;
    if (recommendedEffect == "goodConditionTurns") {
      actualScore = state[S.score] * 0.4;
    } else if (recommendedEffect == "concentration") {
      actualScore = state[S.score] * 0.6;
    } else if (recommendedEffect == "goodImpressionTurns") {
      actualScore = state[S.score] * 1.1;
    } else if (recommendedEffect == "motivation") {
      actualScore = state[S.score] * 0.6;
    } else if (recommendedEffect == "strength") {
      actualScore = state[S.score] * 0.65;
    } else if (recommendedEffect == "preservation") {
      actualScore = state[S.score] * 0.65;
    } else if (recommendedEffect == "fullPower") {
      actualScore = state[S.score] * 0.8;
    } else {
      actualScore = state[S.score];
    }
    actualScore *= state[S.turnsElapsed] / 2;
    score += actualScore;

    return {
      score: Math.round(score),
      breakdown: {
        buff: Math.round(buffScore),
        actual: Math.round(actualScore),
        scoreFX: Math.round(scoreEffectScore),
      },
    };
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
