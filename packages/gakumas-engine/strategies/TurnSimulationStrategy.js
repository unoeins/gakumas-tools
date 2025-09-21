import { SkillCards } from "gakumas-data";
import { S } from "../constants";
import { deepCopy, getBaseId } from "../utils";
import BaseStrategy from "./BaseStrategy";

const MAX_DEPTH = 3;
const MAX_TURNS = 6;

export default class TurnSimulationStrategy extends BaseStrategy {
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
      config.idol.recommendedEffect == "goodConditionTurns" ? 1 : 1;
    this.concentrationMultiplier =
      config.idol.recommendedEffect == "concentration" ? 1 : 1;
    this.goodImpressionTurnsMultiplier =
      config.idol.recommendedEffect == "goodImpressionTurns" ? 1 : 1;
    this.motivationMultiplier =
      config.idol.recommendedEffect == "motivation" ? 1 : 1;
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

  simulateUseCard(state, id) {
    const skillCard = SkillCards.getById(id);
    const cardMapData = {
      id,
      baseId: getBaseId(skillCard),
    };
    state[S.cardMap].push(cardMapData);
    const card = state[S.cardMap].length - 1;

    if(this.engine.isCardUsable(state, card)) {
      this.engine.effectManager.triggerEffectsForPhase("cardUsed", state);
      if(skillCard.type == "active") {
        this.engine.effectManager.triggerEffectsForPhase("activeCardUsed", state);
      }
      if(skillCard.type == "mental") {
        this.engine.effectManager.triggerEffectsForPhase("mentalCardUsed", state);
      }

      this.engine.executor.executeActions(state, skillCard.actions, card);

      this.engine.effectManager.triggerEffectsForPhase("afterCardUsed", state);
      if(skillCard.type == "active") {
        this.engine.effectManager.triggerEffectsForPhase("afterActiveCardUsed", state);
      }
      if(skillCard.type == "mental") {
        this.engine.effectManager.triggerEffectsForPhase("afterMentalCardUsed", state);
      }

    } else {

    }


    state[S.handCards].unshift(card);
    if (this.engine.isCardUsable(state, card)) {
      state = this.engine.useCard(state, card);
    } else {
      state = this.engine.endTurn(state);
    }
    state[S.cardMap].pop();
    state[S.handCards] = state[S.handCards].filter((id) => id !== card);
    state[S.discardedCards] = state[S.discardedCards].filter((id) => id !== card);
    state[S.removedCards] = state[S.removedCards].filter((id) => id !== card);
    return state;
  }

  getStateScore(state) {
    const simulatedState = deepCopy(state);
    const baseScore = state[S.score];
    
    const effects = simulatedState[S.effects];
    const limits = effects.map(effect => {
      let limit = Math.min(simulatedState[S.turnsRemaining], MAX_TURNS);
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

    // Turn simulation based on using only basic card
    while(simulatedState[S.turnsRemaining] > 0) {
      if(recommendedEffect == "goodConditionTurns" || recommendedEffect == "concentration") {
        if(simulatedState[S.turnsRemaining] > 2) {
          simulatedState = this.simulateUseCard(simulatedState, 1); // アピールの基本
        } else if(simulatedState[S.turnsRemaining] > 0) {
          simulatedState = this.simulateUseCard(simulatedState, 1);
        }
      } else if (recommendedEffect == "goodImpressionTurns") {
        if(simulatedState[S.turnsRemaining] > 1 || simulatedState[S.cardUsesRemaining] > 0) {
          simulatedState = this.simulateUseCard(simulatedState, 19); // 目線の基本
        } else if(simulatedState[S.turnsRemaining] > 0) {
          simulatedState = this.simulateUseCard(simulatedState, 9); // 可愛い仕草
        }
      } else if (recommendedEffect == "motivation") {
        if(simulatedState[S.turnsRemaining] > 1 || simulatedState[S.cardUsesRemaining] > 0) {
          simulatedState = this.simulateUseCard(simulatedState, 21); // 意識の基本
        } else if(simulatedState[S.turnsRemaining] > 0) {
          simulatedState = this.simulateUseCard(simulatedState, 11); // 気分転換
        }
      }
    }
    // Simulation score
    score += simulatedState[S.score] - baseScore;

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

    // Motivation
    score +=
      simulatedState[S.motivation] *
      simulatedState[S.turnsRemaining] *
      0.45 *
      this.motivationMultiplier;

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

    // Score buffs
    score +=
      state[S.scoreBuffs].reduce(
        (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
        0
      ) * 8;

    // Score debuffs
    score +=
      state[S.scoreDebuffs].reduce(
        (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
        0
      ) * -8;

    // Scale score
    score = this.scaleScore(score);

    if (recommendedEffect == "goodConditionTurns") {
      baseScore *= 0.4;
    } else if (recommendedEffect == "concentration") {
      baseScore *= 0.6;
    } else if (recommendedEffect == "goodImpressionTurns") {
      baseScore *= 1.1;
    } else if (recommendedEffect == "motivation") {
      baseScore *= 0.6;
      // const turnCount = this.engine.config.stage.turnCount;
      // baseScore *= (Math.tanh(state[S.turnsElapsed] / turnCount * 4 - 4) / 2 + 0.5);
    } else if (recommendedEffect == "strength") {
      baseScore *= 0.65;
    } else if (recommendedEffect == "preservation") {
      baseScore *= 0.65;
    } else if (recommendedEffect == "fullPower") {
      baseScore *= 0.8;
    } else {
      baseScore *= 1;
    }

    score += baseScore;
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
