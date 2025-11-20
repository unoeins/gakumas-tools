export default class PlayerStrategy {
  constructor(engine) {
    this.engine = engine;
    this.pickCardsToHoldIndices = [];
  }

  /**
   * Evaluates the given state, and selects a card to play.
   * Returns the next state and numeric evaluation of the future state.
   */
  evaluate(state) {
    throw new Error("evaluate is not implemented!");
  }

  /**
   * Given a state and list of cards, selects a card to hold.
   * Returns the indices of the cards to hold.
   */
  pickCardsToHold(state, cards, num = 1) {
    if (this.pickCardsToHoldIndices.length >= num) {
      return this.pickCardsToHoldIndices.splice(0, num);
    } else {
      const e = new Error("not picked");
      e.args = {state, cards, num};
      throw e;
    }
  }
}
