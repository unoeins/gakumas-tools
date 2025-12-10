import HeuristicStrategy from "./HeuristicStrategy";
import ManualStrategy from "./ManualStrategy";
import HeuristicCustomStrategy from "./HeuristicCustomStrategy";
import HeuristicConstBuffStrategy from "./HeuristicConstBuffStrategy";
import HeuristicSoraChinaStrategy from "./HeuristicSoraChinaStrategy";
import HeuristicCustomGoodConditionStrategy from "./HeuristicCustomGoodConditionStrategy";
import HeuristicCustomBuffDebuffStrategy from "./HeuristicCustomBuffDebuffStrategy";
import HeuristicEffectScoreStrategy from "./HeuristicEffectScoreStrategy";
import HeuristicFutureSightStrategy from "./HeuristicFutureSightStrategy";
import BasicCardStrategy from "./BasicCardStrategy";
import BasicCardSimulationStrategy from "./BasicCardSimulationStrategy";
import BasicCardUseStrategy from "./BasicCardUseStrategy";
import AtmosphereStrategy from "./AtmosphereStrategy";

const STRATEGIES = {
  HeuristicStrategy, 
  ManualStrategy,
  HeuristicCustomStrategy,
  HeuristicConstBuffStrategy,
  // HeuristicSoraChinaStrategy,
  // HeuristicCustomGoodConditionStrategy, 
  // HeuristicCustomBuffDebuffStrategy, 
  // HeuristicEffectScoreStrategy,
  HeuristicFutureSightStrategy,
  AtmosphereStrategy
  // BasicCardStrategy,
  // BasicCardSimulationStrategy,
  // BasicCardUseStrategy,
};

export { ManualStrategy };
export default STRATEGIES;
