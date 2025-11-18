import { FULL_POWER_EFFECTS, GOOD_IMPRESSION_EFFECTS, S } from "../constants";
import EngineComponent from "./EngineComponent";
import { getRand, shuffle } from "../utils";

export default class TurnManager extends EngineComponent {
  constructor(engine) {
    super(engine);

    this.variableResolvers = {
      isVocalTurn: (state) => this.getTurnType(state) == "vocal",
      isDanceTurn: (state) => this.getTurnType(state) == "dance",
      isVisualTurn: (state) => this.getTurnType(state) == "visual",
    };
  }

  initializeState(state) {
    state[S.turnsElapsed] = 0;
    state[S.turnsRemaining] = this.getConfig(state).stage.turnCount;
    state[S.turnTypes] = this.generateTurnTypes();
    state[S.linkPhase] = 0;
  }

  getTurnType(state) {
    return state[S.turnTypes][
      Math.min(state[S.turnsElapsed], this.getConfig(state).stage.turnCount - 1)
    ];
  }

  getTurnMultiplier(state) {
    const turnType = this.getTurnType(state);
    return this.getConfig(state).typeMultipliers[turnType];
  }

  generateTurnTypes() {
    const { turnCounts, firstTurns, criteria } = this.engine.config.stage;
    const { turnTypeOrder } = this.engine.config.idol;

    if (this.engine.config.simulator.enableSkillCardOrder && turnTypeOrder &&
        turnTypeOrder.some((turnType) => turnType != "none")) {
      return this.generateOrderedTurnTypes();
    }

    // Initialize remaining counts for each turn type
    const remainingTurns = { ...turnCounts };

    // Pick first turn based on configured distribution
    const rand = getRand();
    let firstTurn = "vocal";
    if (rand > firstTurns.vocal) firstTurn = "dance";
    if (rand > firstTurns.vocal + firstTurns.dance) firstTurn = "visual";
    remainingTurns[firstTurn]--;

    // Pick last 3 turns based on stage criteria
    const sortedTypes = Object.keys(criteria).sort(
      (a, b) => criteria[b] - criteria[a]
    );
    const lastThreeTurns = sortedTypes.slice().reverse();
    lastThreeTurns.forEach((t) => remainingTurns[t]--);

    let randomTurns = [];
    for (let k in remainingTurns) {
      for (let i = 0; i < remainingTurns[k]; i++) {
        randomTurns.push(k);
      }
    }
    shuffle(randomTurns);

    return [firstTurn, ...randomTurns, ...lastThreeTurns];
  }

  generateOrderedTurnTypes() {
    const { turnCounts, firstTurns, criteria } = this.engine.config.stage;
    const { turnTypeOrder } = this.engine.config.idol;

    // Initialize remaining counts for each turn type
    const remainingTurns = { ...turnCounts };

    // Generate ordered turn types
    const turnTypes = turnTypeOrder.map((turnType) => {
      if (remainingTurns[turnType] > 0) {
        remainingTurns[turnType]--;
        return turnType;
      }
      return "none";
    });

    // Pick first turn based on configured distribution
    if(turnTypes[0] == "none") {
      let updatedFirstTurns = { ...firstTurns };
      for(let type in firstTurns) {
        if (firstTurns[type] > 0 && remainingTurns[type] <= 0) {
          updatedFirstTurns[type] = 0;
        }
      }
      const total = updatedFirstTurns.vocal + updatedFirstTurns.dance + updatedFirstTurns.visual || 1;
      updatedFirstTurns = {
        vocal: Math.round((100 * updatedFirstTurns.vocal) / total) / 100,
        dance: Math.round((100 * updatedFirstTurns.dance) / total) / 100,
        visual: Math.round((100 * updatedFirstTurns.visual) / total) / 100,
      };
      const rand = getRand();
      let firstTurn = "vocal";
      if (rand > updatedFirstTurns.vocal) firstTurn = "dance";
      if (rand > updatedFirstTurns.vocal + updatedFirstTurns.dance) firstTurn = "visual";
      remainingTurns[firstTurn]--;
      turnTypes[0] = firstTurn;
    }

    // Pick last 3 turns based on stage criteria
    const sortedTypes = Object.keys(criteria).sort(
      (a, b) => criteria[b] - criteria[a]
    );
    const lastThreeTurns = sortedTypes.slice().reverse();
    lastThreeTurns.forEach((t, i) => {
      if(turnTypes[turnTypes.length - 3 + i] == "none" && remainingTurns[t] > 0) {
        remainingTurns[t]--;
        turnTypes[turnTypes.length - 3 + i] = t;
      }
    });

    let randomTurns = [];
    for (let k in remainingTurns) {
      for (let i = 0; i < remainingTurns[k]; i++) {
        randomTurns.push(k);
      }
    }
    shuffle(randomTurns);

    let result = turnTypes.map((turnType) => 
      turnType == "none" ? randomTurns.shift() : turnType
    );
    return result;
  }

  startTurn(state, forceInitialHand = false) {
    this.logger.debug("Starting turn", state[S.turnsElapsed] + 1);

    this.logger.log(state, "startTurn", {
      num: state[S.turnsElapsed] + 1,
      type: this.getTurnType(state),
      multiplier: this.getTurnMultiplier(state),
    });

    state[S.cardUsesRemaining] = 1;

    state[S.prevStance] = "none";
    this.engine.effectManager.triggerEffects(state, FULL_POWER_EFFECTS);
    this.engine.effectManager.triggerEffectsForPhase(
      state,
      "beforeStartOfTurn"
    );
    this.engine.effectManager.triggerEffectsForPhase(state, "startOfTurn");

    // Draw cards
    for (let i = 0; i < 3; i++) {
      this.engine.cardManager.drawCard(state);
    }

    // Add forced initial hand cards
    if (state[S.turnsElapsed] == 0 || forceInitialHand) {
      for (let i = 0; i < 2; i++) {
        const card = this.engine.cardManager.peekDeck(state);
        if (
          card != null &&
          this.engine.cardManager.isForceInitialHand(state, card)
        ) {
          this.engine.cardManager.drawCard(state);
        }
      }
    }

    this.engine.effectManager.triggerEffectsForPhase(state, "afterStartOfTurn");
    this.engine.effectManager.triggerEffectsForPhase(state, "turn");
    this.engine.effectManager.triggerEffectsForPhase(state, "everyTurn");
  }

  endTurn(state) {
    // Recover stamina if turn ended by player
    if (state[S.cardUsesRemaining] > 0) {
      state[S.stamina] = Math.min(
        state[S.stamina] + 2,
        this.getConfig(state).idol.params.stamina
      );
    }

    // Trigger effects
    this.engine.effectManager.triggerEffectsForPhase(state, "endOfTurn");

    // Good impression
    this.engine.effectManager.triggerEffects(state, GOOD_IMPRESSION_EFFECTS);

    // Decrement buff turns
    this.engine.buffManager.decrementBuffTurns(state);

    // Reset one turn fields
    state[S.cardUsesRemaining] = 0;
    state[S.turnCardsUsed] = 0;
    state[S.turnCardsUpgraded] = 0;
    state[S.enthusiasm] = 0;

    this.engine.effectManager.decrementTtl(state);
    this.engine.effectManager.decrementDelay(state);
    this.engine.effectManager.clearExpiredEffects(state);

    // Discard hand
    this.engine.cardManager.discardHand(state);

    state[S.turnsElapsed]++;
    state[S.turnsRemaining]--;

    this.logger.pushGraphData(state);

    // Start next turn
    if (state[S.turnsRemaining] > 0) {
      let forceInitialHand = false;
      const stageConfig = this.getConfig(state).stage;
      if (stageConfig.type === "linkContest") {
        const { linkPhaseChangeTurns } = stageConfig;
        for (let i = 0; i < linkPhaseChangeTurns.length; i++) {
          if (
            state[S.turnsElapsed] == linkPhaseChangeTurns[i] &&
            i < this.engine.linkConfigs.length - 1
          ) {
            this.engine.changeIdol(state);
            forceInitialHand = true;
            break;
          }
        }
      }

      this.startTurn(state, forceInitialHand);
    }
  }
}
