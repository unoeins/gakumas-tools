
export default class SimulatorConfig {
  constructor({
      enableSkillCardOrder,
      enableUseStats,
      enableConditionalUseStats,
      enablePriorityStats,
      enableScoreStats,
      enableSelectRandomCards,
      enableStrategyCustomization,
      maxDepth,
      nextDepth,
      scoreMultiplier,
      goodConditionTurnsMultiplier,
      concentrationMultiplier,
      goodImpressionTurnsMultiplier,
      motivationMultiplier,
      fullPowerMultiplier,
      enableEffectScore,
      effectScoreMultiplier,
      enableNewHoldStrategy,
    }) {
    this.enableSkillCardOrder = enableSkillCardOrder;
    this.enableUseStats = enableUseStats;
    this.enableConditionalUseStats = enableConditionalUseStats;
    this.enablePriorityStats = enablePriorityStats;
    this.enableScoreStats = enableScoreStats;
    this.enableSelectRandomCards = enableSelectRandomCards;
    this.enableStrategyCustomization = enableStrategyCustomization || false;
    this.maxDepth = maxDepth || 3;
    this.nextDepth = nextDepth || 3;
    this.scoreMultiplier = (scoreMultiplier || 100) / 100;
    this.goodConditionTurnsMultiplier = (goodConditionTurnsMultiplier || 100) / 100;
    this.concentrationMultiplier = (concentrationMultiplier || 100) / 100;
    this.goodImpressionTurnsMultiplier = (goodImpressionTurnsMultiplier || 100) / 100;
    this.motivationMultiplier = (motivationMultiplier || 100) / 100;
    this.fullPowerMultiplier = (fullPowerMultiplier || 100) / 100;
    this.enableEffectScore = enableEffectScore || false;
    this.effectScoreMultiplier = (effectScoreMultiplier || 100) / 100;
    this.enableNewHoldStrategy = enableNewHoldStrategy || false;
  }

}
