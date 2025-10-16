import HeuristicStrategy from "./HeuristicStrategy";
import HeuristicCustomStrategy from "./HeuristicCustomStrategy";
import HeuristicCustomGoodConditionStrategy from "./HeuristicCustomGoodConditionStrategy";
import HeuristicCustomBuffDebuffStrategy from "./HeuristicCustomBuffDebuffStrategy";
import HeuristicEffectScoreStrategy from "./HeuristicEffectScoreStrategy";
import HeuristicFutureSightStrategy from "./HeuristicFutureSightStrategy";
import BasicCardStrategy from "./BasicCardStrategy";
import BasicCardSimulationStrategy from "./BasicCardSimulationStrategy";
import BasicCardUseStrategy from "./BasicCardUseStrategy";

const STRATEGIES = {
  HeuristicStrategy, 
  HeuristicCustomStrategy,
  HeuristicCustomGoodConditionStrategy, 
  HeuristicCustomBuffDebuffStrategy, 
  HeuristicEffectScoreStrategy,
  HeuristicFutureSightStrategy,
  BasicCardStrategy,
  BasicCardSimulationStrategy,
  BasicCardUseStrategy,
};

export default STRATEGIES;
