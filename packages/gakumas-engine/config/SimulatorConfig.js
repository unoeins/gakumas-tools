
export default class SimulatorConfig {
  constructor({ enableSkillCardOrder, enableUseStats, enableConditionalUseStats, enablePriorityStats }) {
    this.enableSkillCardOrder = enableSkillCardOrder;
    this.enableUseStats = enableUseStats;
    this.enableConditionalUseStats = enableConditionalUseStats;
    this.enablePriorityStats = enablePriorityStats;
  }

}
