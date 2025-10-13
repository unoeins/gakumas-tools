import EngineComponent from "./EngineComponent";
import { UseStats, ConditionalUseStats, PriorityStats } from '../listener'
import { EVENTS } from '../constants';

export default class ListenerManager extends EngineComponent {
  constructor(engine) {
    super(engine);

    this.listeners = {};
  }

  registerListeners() {
    const listenerData = {};
    if(this.config.simulator.enableUseStats) {
      const useStats = new UseStats();
      this.addListener(EVENTS.STAGE_ENDED, useStats.stageEnded.bind(useStats));
      listenerData["UseStats"] = useStats;
    }
    if(this.config.simulator.enableConditionalUseStats) {
      const conditionalUseStats = new ConditionalUseStats();
      this.addListener(EVENTS.STAGE_ENDED, conditionalUseStats.stageEnded.bind(conditionalUseStats));
      listenerData["ConditionalUseStats"] = conditionalUseStats;
    }
    if(this.config.simulator.enablePriorityStats) {
      const priorityStats = new PriorityStats();
      this.addListener(EVENTS.STAGE_ENDED, priorityStats.stageEnded.bind(priorityStats));
      listenerData["PriorityStats"] = priorityStats;
    }
    return listenerData;
  }

  addListener(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  removeListener(event, listener) {
    const listeners = this.listeners[event];
    if (listeners) {
      this.listeners[event] = listeners.filter(l => l !== listener);
    }
  }

  triggerEvent(event, state, ...args) {
    const listeners = this.listeners[event];
    if (listeners) {
      listeners.forEach(listener => listener(state, ...args));
    }
  }
}
