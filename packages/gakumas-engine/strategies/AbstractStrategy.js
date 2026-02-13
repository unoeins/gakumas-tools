import { S } from "../constants";
import { deepCopy } from "../utils";
import HeuristicStrategy from "./HeuristicStrategy";

export default class AbstractStrategy extends HeuristicStrategy {
  constructor(engine) {
    super(engine);

    this.depth = 0;
    this.rootEffectCount = 0;
    this.maxDepth = 3;
    this.nextDepth = 3;
  }

  evaluate(state) {
    const result = this.evaluateInternal(state, state);
    return { score: result.score, state: result.nextState, scoreBreakdown: result.scoreBreakdown };
  }

  evaluateInternal(state, nextState) {
    if (this.depth == 0) {
      this.rootEffectCount = state[S.effects].length;
    }

    let logIndex = null;
    if (this.depth < this.nextDepth) {
      logIndex = this.engine.logger.log(state, "hand", null);
    }

    const futures = state[S.handCards].map((card) =>
      this.getFuture(state, nextState, card)
    );

    let nextState;

    const scores = futures.map((f) => (f ? f.score : -Infinity));
    const scoreBreakdowns = futures.map((f) => (f ? f.scoreBreakdown : {}));
    // console.log("scoreBreakdowns:", scoreBreakdowns);
    let maxScore = Math.max(...scores);
    let selectedIndex = null;
    let scoreBreakdown = {};
    if (maxScore > 0) {
      selectedIndex = scores.indexOf(maxScore);
      if (this.depth < this.nextDepth) {
        nextState = futures[selectedIndex].nextState;
      }
      scoreBreakdown = futures[selectedIndex].scoreBreakdown;
    } else {
      const endTurnState = this.engine.endTurn(state);
      if (this.depth < this.nextDepth) {
        nextState = endTurnState;
      }
      maxScore = this.getStateScore(endTurnState).score;
    }

    if (logIndex != null) {
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
    }

    return {
      score: maxScore,
      state: nextState,
      nextState: nextState,
      scoreBreakdown: scoreBreakdown
    };
  }

  getFuture(state, nextState, card) {
    if (!this.engine.isCardUsable(state, card)) {
      return null;
    }

    const previewState = this.engine.useCard(state, card);
    if (this.depth < this.nextDepth) {
      nextState = previewState;
    }
    this.depth++;

    // Additional actions
    if (
      previewState[S.turnsRemaining] >= state[S.turnsRemaining] &&
      this.depth < this.maxDepth
    ) {
      const future = this.evaluateInternal(previewState, nextState);
      this.depth--;
      return {
        score: future.score,
        state: future.state,
        nextState: future.nextState,
        scoreBreakdown: future.scoreBreakdown
      };
    }

    let effectScore = this.evaluateEffectScore(previewState, 6);
    let score = effectScore;

    if (this.engine.getConfig(state).idol.plan != "anomaly") {
      // Cards removed
      score +=
        (((state[S.removedCards].length - previewState[S.removedCards].length) *
          (previewState[S.score] - state[S.score])) /
          this.getAverageTypeMultiplier(state)) *
        Math.floor(previewState[S.turnsRemaining] / 13);
    }

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

  evaluateEffectScore(previewState, maxTriggers = 6) {
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
      effectScore += scoreDelta * Math.min(limit, maxTriggers);
    }
    return effectScore;
  }

  initializeMultipliers(state) {
    // Initialize multipliers
    const config = this.engine.getConfig(state);
    this.goodConditionTurnsMultiplier =
      // config.idol.recommendedEffect == "goodConditionTurns" ? 1 : 1;
      // config.idol.recommendedEffect == "goodConditionTurns" ? 1.75 : 1;
      config.idol.recommendedEffect == "goodConditionTurns" ? 3 : 1;
    // if (config.idol.pIdolId == 114) {
    //   this.goodConditionTurnsMultiplier = 8;
    // }
    this.concentrationMultiplier =
      // config.idol.recommendedEffect == "concentration" ? 1 : 1;
      config.idol.recommendedEffect == "concentration" ? 3 : 1;
    this.goodImpressionTurnsMultiplier =
      config.idol.recommendedEffect == "goodImpressionTurns" ? 3.5 : 1;
    this.motivationMultiplier =
      config.idol.recommendedEffect == "motivation" ? 5.5 : 1;
    this.fullPowerMultiplier =
      config.idol.recommendedEffect == "fullPower" ? 5 : 1;
    
    const { recommendedEffect } = config.idol;
    if (recommendedEffect == "goodConditionTurns") {
      this.actualScoreMultiplier = 0.4;
    } else if (recommendedEffect == "concentration") {
      this.actualScoreMultiplier = 0.6;
    } else if (recommendedEffect == "goodImpressionTurns") {
      this.actualScoreMultiplier = 1.1;
    } else if (recommendedEffect == "motivation") {
      this.actualScoreMultiplier = 0.6;
    } else if (recommendedEffect == "strength") {
      this.actualScoreMultiplier = 0.65;
    } else if (recommendedEffect == "preservation") {
      this.actualScoreMultiplier = 0.65;
    } else if (recommendedEffect == "fullPower") {
      this.actualScoreMultiplier = 0.8;
    } else {
      this.actualScoreMultiplier = 1;
    }
  }

  evaluateHandCards(state) {
    return state[S.handCards].length * 3;
  }

  evaluateCardsUsed(state) {
    return state[S.cardsUsed] * 8;
  }

  evaluateStamina(state) {
    return state[S.stamina] * state[S.turnsRemaining] * 0.05;
  }

  evaluateGenki(state) {
    return state[S.genki] *
           Math.tanh(state[S.turnsRemaining] / 3) *
           0.7 *
           this.motivationMultiplier;
  }

  evaluateGoodConditionTurns(state) {
    if (config.idol.pIdolId == 114) {
      if (state[S.turnsRemaining] > 0) {
        return state[S.goodConditionTurns] * 3 * this.goodConditionTurnsMultiplier;
      }
    } else {
      return Math.min(state[S.goodConditionTurns], state[S.turnsRemaining]) *
             1.6 *
             this.goodConditionTurnsMultiplier;
    }
    return 0;
  }

  evaluatePerfectConditionTurns(state) {
    return Math.min(state[S.perfectConditionTurns], state[S.turnsRemaining]) *
           state[S.goodConditionTurns] *
           this.goodConditionTurnsMultiplier *
           1.5;
  }

  evaluateConcentration(state) {
    return state[S.concentration] *
           state[S.turnsRemaining] *
           this.concentrationMultiplier;
  }

  evaluateStance(state) {
    let score = 0;
    score += state[S.strengthTimes] * 40;
    score += state[S.preservationTimes] * 80;
    score += state[S.leisureTimes] * 80;
    score += state[S.fullPowerTimes] * 80 * this.fullPowerMultiplier;
    return score;
  }

  evaluateEnthusiasm(state) {
    return state[S.enthusiasm] * 5;
  }

  evaluateFullPowerCharge(state) {
    return state[S.cumulativeFullPowerCharge] * 3 * this.fullPowerMultiplier;
  }

  evaluateEnthusiasmBuffs(state) {
    return state[S.enthusiasmBuffs].reduce(
             (acc, cur) =>
               acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
             0
           ) * 5;
  }

  evaluateFullPowerChargeBuffs(state) {
    return state[S.fullPowerChargeBuffs].reduce(
             (acc, cur) =>
               acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
             0
           ) * this.fullPowerMultiplier;
  }

  evaluateGrowth(state) {
    return this.getGrowthScore(state) * 0.2 * state[S.turnsRemaining];
  }

  evaluateGoodImpressionTurns(state) {
    return state[S.goodImpressionTurns] *
           state[S.turnsRemaining] *
           this.goodImpressionTurnsMultiplier;
  }

  evaluateMotivation(state) {
    return state[S.motivation] *
           state[S.turnsRemaining] *
           0.45 *
           this.motivationMultiplier;
  }

  evaluatePrideTurns(state) {
    return state[S.prideTurns] * state[S.turnsRemaining] * 0.2;
  }

  evaluateScoreBuffs(state) {
    return state[S.scoreBuffs].reduce(
      (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
      0
    ) * 8;
  }

  evaluateScoreDebuffs(state) {
    return state[S.scoreDebuffs].reduce(
      (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
      0
    ) * -8;
  }

  evaluateHalfCostTurns(state) {
    return Math.min(state[S.halfCostTurns], state[S.turnsRemaining]) * 6;
  }

  evaluateDoubleCostTurns(state) {
    return Math.min(state[S.doubleCostTurns], state[S.turnsRemaining]) * -6;
  }

  evaluateCostReduction(state) {
    return state[S.costReduction] * state[S.turnsRemaining] * 0.5;
  }

  evaluateDoubleCardEffectCards(state) {
    return state[S.doubleCardEffectCards] * 50;
  }
  
  evaluateCardUsesRemaining(state) {
    return state[S.cardUsesRemaining] * 50;
  }

  evaluateGoodImpressionTurnsBuffs(state) {
    return state[S.goodImpressionTurnsBuffs].reduce(
      (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
      0
    ) * 10 * this.goodImpressionTurnsMultiplier;
  }

  evaluateGoodImpressionTurnsEffectBuffs(state) {
    return state[S.goodImpressionTurnsEffectBuffs].reduce(
      (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
      0
    ) * state[S.goodImpressionTurns] * this.goodImpressionTurnsMultiplier;
  }

  evaluateGoodConditionTurnsBuffs(state) {
    return state[S.goodConditionTurnsBuffs].reduce(
      (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
      0
    ) * this.goodConditionTurnsMultiplier;
  }

  evaluateConcentrationBuffs(state) {
    return state[S.concentrationBuffs].reduce(
      (acc, cur) => acc + cur.amount * (cur.turns || state[S.turnsRemaining]),
      0
    ) * this.concentrationMultiplier;
  }

  evaluateNullifyGenkiTurns(state) {
    return state[S.nullifyGenkiTurns] * -9;
  }

  evaluateTurnCardsUpgraded(state) {
    return state[S.turnCardsUpgraded] * 20;
  }

  evaluateScoreEffects(state) {
    const effectState = deepCopy(state);
    effectState[S.stance] = "none";
    const effects = effectState[S.effects].filter(
      (e) => e.actions && e.actions.some(a => a[0] == "score"));
    let preEffectScore = effectState[S.score];
    let scoreEffectScore = 0;
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      let limit = effectState[S.turnsRemaining];
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
    scoreEffectScore = this.scaleScore(scoreEffectScore);
    return scoreEffectScore;
  }

  getStateScore(state) {
    this.initializeMultipliers(state);

    // Calc score
    let score = 0;

    // Cards in hand
    score += this.evaluateHandCards(state);

    // Cards used
    score += this.evaluateCardsUsed(state);

    // Stamina
    score += this.evaluateStamina(state);

    // Genki
    score += this.evaluateGenki(state);

    // Good condition turns
    score += this.evaluateGoodConditionTurns(state);

    // Perfect condition turns
    score += this.evaluatePerfectConditionTurns(state);

    // Concentration
    score += this.evaluateConcentration(state);

    // Stance
    if (
      this.engine.getConfig(state).idol.plan == "anomaly" &&
      (state[S.turnsRemaining] || state[S.cardUsesRemaining])
    ) {
      score += this.evaluateStance(state);

      //Enthusiasm
      score += this.evaluateEnthusiasm(state);

      // Full power charge
      score += this.evaluateFullPowerCharge(state);

      // Enthusiasm buffs
      score += this.evaluateEnthusiasmBuffs(state);

      // Full power charge buffs
      score += this.evaluateFullPowerChargeBuffs(state);

      // Growth
      score += this.evaluateGrowth(state);
    }

    // Good impression turns
    score += this.evaluateGoodImpressionTurns(state);

    // Motivation
    score += this.evaluateMotivation(state);

    // Pride turns
    score += this.evaluatePrideTurns(state);

    // Score buffs
    score += this.evaluateScoreBuffs(state);

    // Score debuffs
    score += this.evaluateScoreDebuffs(state);

    // Half cost turns
    score += this.evaluateHalfCostTurns(state);

    // Double cost turns
    score += this.evaluateDoubleCostTurns(state);
    
    // Cost reduction
    score += this.evaluateCostReduction(state);

    // Double card effect cards
    score += this.evaluateDDoubleCardEffectCards(state);

    // Card uses remaining
    score += this.evaluateCardUsesRemaining(state);

    // Good impression turns buffs
    score += this.evaluateGoodImpressionTurnsBuffs(state);

    // Good impression turns effects buffs
    score += this.evaluateGoodImpressionTurnsEffectBuffs(state);

    // Good condition turns buffs
    score += this.evaluateGoodConditionTurnsBuffs(state);

    // Concentration buffs
    score += this.evaluateConcentrationBuffs(state);

    // Nullify genki turns
    score += this.evaluateNullifyGenkiTurns(state);

    // Turn cards upgraded
    score += this.evaluateTurnCardsUpgraded(state);

    // Scale score
    score = this.scaleScore(score, state);
    const buffScore = score;

    // Effect score
    const scoreEffectScore = this.evaluateScoreEffects(state);
    score += scoreEffectScore;

    // Actual score
    const actualScore = state[S.score] * this.actualScoreMultiplier;
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
}
