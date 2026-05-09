
export default class SimulatorConfig {
  constructor({
      enableSkillCardOrder,
      enableUseStats,
      enableConditionalUseStats,
      enablePriorityStats,
      enableScoreStats,
      enableSelectRandomCards,
    }) {
    this.enableSkillCardOrder = enableSkillCardOrder;
    this.enableUseStats = enableUseStats;
    this.enableConditionalUseStats = enableConditionalUseStats;
    this.enablePriorityStats = enablePriorityStats;
    this.enableScoreStats = enableScoreStats;
    this.enableSelectRandomCards = enableSelectRandomCards;
  }

}
