import { deserializeEffectSequence } from "gakumas-data";
import { STARTING_EFFECTS } from "gakumas-engine/constants";

export default class StageConfig {
  constructor(stage, startingEffects = []) {
    const {
      type,
      plan,
      season,
      defaultCardSet,
      turnCounts,
      firstTurns,
      criteria,
      effects,
      linkTurnCounts,
    } = stage;
    this.type = type;
    this.plan = plan;
    this.defaultCardSet = defaultCardSet;
    this.season = season;
    this.turnCounts = turnCounts;
    this.firstTurns = firstTurns;
    this.criteria = criteria;
    this.effects = effects;
    this.turnCount = turnCounts.vocal + turnCounts.dance + turnCounts.visual;
    this.linkTurnCounts = linkTurnCounts;
    this.linkPhaseChangeTurns = this.calculateLinkPhaseChangeTurns();
    if (stage.type === "exam") {
      this.effects = effects.concat(this.getStartingEffects(startingEffects, plan).map(deserializeEffectSequence)).flat();
    }
  }

  calculateLinkPhaseChangeTurns() {
    let cumulativeTurns = 0;
    return this.linkTurnCounts.map((turnCount) => {
      cumulativeTurns += turnCount;
      return cumulativeTurns;
    });
  }

  getStartingEffects(startingEffects, plan) {
    const targetPlan = ["free", plan];
    let effects = [];
    for (let i = 0; i < startingEffects.length; i++) {
      if (startingEffects[i] && targetPlan.includes(STARTING_EFFECTS[i].plan)) {
        switch (STARTING_EFFECTS[i].type) {
          case "replace":
            effects.push(STARTING_EFFECTS[i].pattern.replace("{0}", startingEffects[i]));
            break;
          case "replacePercent":
            effects.push(STARTING_EFFECTS[i].pattern.replace("{0}", startingEffects[i]/100));
            break;
          case "repeat":
            for (let j = 0; j < Math.min(startingEffects[i], 2); j++) {
              effects.push(STARTING_EFFECTS[i].pattern);
            }
            break;
          default:
            console.error("Unknown starting effect type:", STARTING_EFFECTS[i].type);
        }
      }
    }
    return effects;
  }
}
