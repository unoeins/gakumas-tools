import { S, EVENTS } from "../constants";

export default class StagePlayer {
  constructor(engine, strategy) {
    this.engine = engine;
    this.strategy = strategy;
  }

  play() {
    this.engine.logger.reset();
    let state = this.engine.getInitialState();
    state = this.engine.startStage(state);

    while (state[S.turnsRemaining] > 0) {
      state = this.strategy.evaluate(state).state;
    }

    const logs = this.engine.logger.pickLogs(state);
    this.engine.listenerManager.triggerEvent(EVENTS.STAGE_ENDED, state, logs);

    return {
      score: state[S.score],
      logs: logs,
      graphData: state.graphData,
    };
  }
}
