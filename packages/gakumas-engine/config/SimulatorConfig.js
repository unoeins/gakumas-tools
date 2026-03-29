
export default class SimulatorConfig {
  constructor({
      enableSkillCardOrder,
      enableUseStats,
      enableConditionalUseStats,
      enablePriorityStats,
      enableScoreStats
    }) {
    this.enableSkillCardOrder = enableSkillCardOrder;
    this.enableUseStats = enableUseStats;
    this.enableConditionalUseStats = enableConditionalUseStats;
    this.enablePriorityStats = enablePriorityStats;
    this.enableScoreStats = enableScoreStats;
  }

}
