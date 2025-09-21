import EngineComponent from "./EngineComponent";
import UseStats from '../listener/UseStats'
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
      console.log("new UseStats", useStats);
      this.addListener(EVENTS.STAGE_ENDED, useStats.stageEnded.bind(useStats));
      listenerData["UseStats"] = useStats;
      console.log("Registered UseStats", useStats);
      console.log("Registered UseStats listener", listenerData);
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
