const STRATEGY_CUSTOMIZATIONS = [
  {
    id: 1,
    name: "maxDepth",
    type: "integer",
    min: 1,
    max: 10,
    default: 3,
  },
  {
    id: 2,
    name: "nextDepth",
    type: "integer",
    min: 1,
    max: 10,
    default: 3,
  },
  {
    id: 3,
    name: "scoreMultiplier",
    type: "integer",
    min: 1,
    max: 10000,
    default: 100,
  },
  {
    id: 4,
    name: "goodConditionTurnsMultiplier",
    type: "integer",
    min: 1,
    max: 10000,
    default: 100,
  },
  {
    id: 5,
    name: "concentrationMultiplier",
    type: "integer",
    min: 1,
    max: 10000,
    default: 100,
  },
  {
    id: 6,
    name: "goodImpressionTurnsMultiplier",
    type: "integer",
    min: 1,
    max: 10000,
    default: 100,
  },
  {
    id: 7,
    name: "motivationMultiplier",
    type: "integer",
    min: 1,
    max: 10000,
    default: 100,
  },
  {
    id: 8,
    name: "fullPowerMultiplier",
    type: "integer",
    min: 1,
    max: 10000,
    default: 100,
  },
  {
    id: 9,
    name: "enableEffectScore",
    type: "boolean",
    default: 0,
  },
  {
    id: 10,
    name: "effectScoreMultiplier",
    type: "integer",
    min: 1,
    max: 10000,
    default: 100,
  },
  {
    id: 11,
    name: "fixScoreBonusOnHolding",
    type: "boolean",
    default: 0,
  }
];

const STRATEGY_CUSTOMIZATIONS_BY_ID = STRATEGY_CUSTOMIZATIONS.reduce((acc, cur) => {
  acc[cur.id] = cur;
  return acc;
}, {});

export class StrategyCustomizations {
  static getAll() {
    return STRATEGY_CUSTOMIZATIONS;
  }

  static getById(id) {
    return STRATEGY_CUSTOMIZATIONS_BY_ID[id];
  }

  static getDefaults() {
    return STRATEGY_CUSTOMIZATIONS.reduce((acc, cur) => {
      acc[cur.id] = cur.default;
      return acc;
    }, {});
  }

  constructor(customizations, setCustomizations) {
    this.customizations = {...customizations};
    this.setCustomizations = setCustomizations;
  }

  get(id, useDefault = false) {
    let value = this.customizations[id];
    if (value === undefined && useDefault) {
      value = STRATEGY_CUSTOMIZATIONS_BY_ID[id]?.default;
    }
    if (STRATEGY_CUSTOMIZATIONS_BY_ID[id]?.type === "boolean") {
      return value ? true : false;
    }
    return value;
  }

  set(id, value) {
    let unset = false;
    if (STRATEGY_CUSTOMIZATIONS_BY_ID[id]?.type === "integer") {
      if (isNaN(value) || 
          value < STRATEGY_CUSTOMIZATIONS_BY_ID[id].min || 
          value > STRATEGY_CUSTOMIZATIONS_BY_ID[id].max) {
        unset = true;
      }
    } else if (STRATEGY_CUSTOMIZATIONS_BY_ID[id]?.type === "boolean") {
      value = value ? 1 : 0;
    }
    if (unset) {
      delete this.customizations[id];
    } else {
      this.customizations[id] = value;
    }
    if (this.setCustomizations) {
      this.setCustomizations(this.customizations);
    }
  }

  resetAll() {
    this.customizations = StrategyCustomizations.getDefaults();
    if (this.setCustomizations) {
      this.setCustomizations(this.customizations);
    }
  }

  getMaxDepth() {
    return this.get(1, true);
  }

  getNextDepth() {
    return this.get(2, true);
  }

  getScoreMultiplier() {
    return this.get(3, true);
  }

  getGoodConditionTurnsMultiplier() {
    return this.get(4, true);
  }

  getConcentrationMultiplier() {
    return this.get(5, true);
  }

  getGoodImpressionTurnsMultiplier() {
    return this.get(6, true);
  }

  getMotivationMultiplier() {
    return this.get(7, true);
  }

  getFullPowerMultiplier() {
    return this.get(8, true);
  }

  isEffectScoreEnabled() {
    return this.get(9, true);
  }

  getEffectScoreMultiplier() {
    return this.get(10, true);
  }

  isFixScoreBonusOnHoldingEnabled() {
    return this.get(11, true);
  }
}

export function deserializeStrategyCustomizations(str) {
  try {
    return str.split("-").reduce((acc, cur) => {
      const [k, v] = cur.split("x");
      acc[k] = parseInt(v, 10);
      return acc;
    }, {});
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function serializeStrategyCustomizations(customizations) {
  if (!customizations) return "";
  return Object.keys(customizations)
    .filter((k) => {
      const def = STRATEGY_CUSTOMIZATIONS_BY_ID[k];
      return def && customizations[k] !== def.default;
    })
    .map((k) => `${k}x${customizations[k]}`)
    .join("-");
}
