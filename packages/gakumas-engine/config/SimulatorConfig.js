import { StrategyCustomizations } from "gakumas-data";

export default class SimulatorConfig {
  constructor({
      enableSkillCardOrder,
      enableUseStats,
      enableConditionalUseStats,
      enablePriorityStats,
      enableScoreStats,
      enableSelectRandomCards,
      enableStrategyCustomizations,
      strategyCustomizations,
    }) {
    this.enableSkillCardOrder = enableSkillCardOrder;
    this.enableUseStats = enableUseStats;
    this.enableConditionalUseStats = enableConditionalUseStats;
    this.enablePriorityStats = enablePriorityStats;
    this.enableScoreStats = enableScoreStats;
    this.enableSelectRandomCards = enableSelectRandomCards;
    this.enableStrategyCustomizations = enableStrategyCustomizations || false;
    if (this.enableStrategyCustomizations) {
      const strategyCustomizationsHelper = new StrategyCustomizations(strategyCustomizations);
      this.maxDepth = strategyCustomizationsHelper.getMaxDepth();
      this.nextDepth = strategyCustomizationsHelper.getNextDepth();
      this.scoreMultiplier = strategyCustomizationsHelper.getScoreMultiplier() / 100;
      this.goodConditionTurnsMultiplier = strategyCustomizationsHelper.getGoodConditionTurnsMultiplier() / 100;
      this.concentrationMultiplier = strategyCustomizationsHelper.getConcentrationMultiplier() / 100;
      this.goodImpressionTurnsMultiplier = strategyCustomizationsHelper.getGoodImpressionTurnsMultiplier() / 100;
      this.motivationMultiplier = strategyCustomizationsHelper.getMotivationMultiplier() / 100;
      this.fullPowerMultiplier = strategyCustomizationsHelper.getFullPowerMultiplier() / 100;
      this.enableEffectScore = strategyCustomizationsHelper.isEffectScoreEnabled();
      this.effectScoreMultiplier = strategyCustomizationsHelper.getEffectScoreMultiplier() / 100;
      this.fixScoreBonusOnHolding = strategyCustomizationsHelper.isFixScoreBonusOnHoldingEnabled();
    }
  }
}
