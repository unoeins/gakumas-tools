import { PDrinks, PItems, SkillCards, Stages, ProduceExams } from "gakumas-data";
import {
  deserializeCustomizations,
  fixCustomizationGroups,
  serializeCustomizations,
} from "./customizations";
import { deserializeIds, serializeIds } from "./ids";
import {
  getDefaultParams,
  getStage,
  knownStageId,
  produceExamIdOf,
  TURN_TYPES,
} from "./stages";
import {
  StrategyCustomizations,
  deserializeStrategyCustomizations,
  serializeStrategyCustomizations,
} from "gakumas-loadout";

const SIMULATOR_BASE_URL = "https://gktools.unoeins.org/simulator";

// Turn order of a produce exam in the URL: "vo-da-vi-...".
const TURN_TYPE_CODES = { vocal: "vo", dance: "da", visual: "vi" };

export function serializeTurnTypes(turnTypes) {
  return turnTypes.map((type) => TURN_TYPE_CODES[type]).join("-");
}

export function deserializeTurnTypes(value) {
  if (!value) return null;
  const types = value
    .split("-")
    .map((code) => TURN_TYPES.find((type) => TURN_TYPE_CODES[type] == code));
  return types.every(Boolean) ? types : null;
}

export const DEFAULTS = {
  stageId: Stages.findLast((s) => s.type == "contest" && !s.preview).id,
  supportBonus: "0.1",
  pItemIds: "0-0-0-0",
  skillCardIdGroups: "0-0-0-0-0-0_0-0-0-0-0-0",
  customizationGroups: "-----_-----",
  pDrinkIds: "0-0-0-0",
  hifAbilityIds: "0-0-0-0",
  startingEffects: "0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0",
  skillCardIdOrderGroups: "0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0",
  customizationOrderGroups: "-------------------",
  turnTypeOrder: "0-0-0-0-0-0-0-0-0-0-0-0",
  removedCardOrder: "0",
  strategyCustomizations: "",
  prioritySkillCardIds: "0",
  priorityCustomizations: "",
  priorityValues: "100",
};

function knownPItemId(id) {
  return PItems.getById(id) ? id : 0;
}

function knownPDrinkId(id) {
  return PDrinks.getById(id) ? id : 0;
}

// P-drinks are held only in produce exams: 3 slots, "drinks=5-11-18".
export const P_DRINK_SLOTS = 4;

export function deserializePDrinkIds(value) {
  const ids = value ? deserializeIds(value).map(knownPDrinkId) : [];
  return Array.from({ length: P_DRINK_SLOTS }, (_, i) => ids[i] || 0);
}

// The turn each drink is drunk on: "drink_turns=0-11-1", 1-based, 0 (or
// missing) for auto, where the simulator plans the turn.
export function deserializePDrinkTurns(value) {
  const turns = value ? deserializeIds(value) : [];
  return Array.from({ length: P_DRINK_SLOTS }, (_, i) =>
    Math.max(0, turns[i] || 0),
  );
}

// The 体力 a produce exam starts at ("start_stamina=26"): a produce exam starts
// at the 体力 the run had, which can be below max. null = start at max.
export function deserializeStartStamina(value) {
  const stamina = parseInt(value, 10);
  return stamina >= 0 ? stamina : null;
}

function knownSkillCardId(id) {
  return SkillCards.getById(id) ? id : 0;
}

export function getSimulatorUrl(loadout, loadouts, pathname) {
  if (loadout.stageId == "custom" || !knownStageId(loadout.stageId)) {
    return null;
  }
  const stage = getStage(loadout.stageId, loadout.customStage);
  let searchParams;
  if (stage.type === "linkContest") {
    searchParams = loadoutsToSearchParams(loadouts);
  } else {
    searchParams = loadoutToSearchParams(loadout);
  }
  try {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const realPathname = pathname || window.location.pathname;
    if(protocol && host && realPathname) {
      return `${protocol}//${host}${realPathname}?${searchParams.toString()}`;
    }
  } catch(e) {
    // ignore
  }
  return `${SIMULATOR_BASE_URL}/?${searchParams.toString()}`;
}

export function loadoutFromSearchParams(searchParams, suffix = "") {
  let stageId = searchParams.get("stage");
  let supportBonus = searchParams.get("support_bonus");
  let params = searchParams.get("params" + suffix);
  let pItemIds = searchParams.get("items" + suffix);
  let skillCardIdGroups = searchParams.get("cards" + suffix);
  let customizationGroups = searchParams.get("customizations" + suffix);
  let pDrinkIds = searchParams.get("drinks" + suffix);
  let hifAbilityIds = searchParams.get("hif_abilities" + suffix);
  let startingEffects = searchParams.get("effects" + suffix);
  let skillCardIdOrderGroups = searchParams.get("order_cards" + suffix);
  let customizationOrderGroups = searchParams.get("order_customs" + suffix);
  let removedCardOrder = searchParams.get("order_removed");
  let turnTypeOrder = searchParams.get("order_turns");
  let strategyCustomizations = searchParams.get("strategy_customs" + suffix);
  let prioritySkillCardIds = searchParams.get("pri_cards" + suffix);
  let priorityCustomizations = searchParams.get("pri_customs" + suffix);
  let priorityValues = searchParams.get("pri_values" + suffix);
  const enterPercents = searchParams.get("enter_percents") == "1";
  const hasDataFromParams =
    stageId ||
    params ||
    pItemIds ||
    skillCardIdGroups ||
    customizationGroups ||
    enterPercents || 
    pDrinkIds || hifAbilityIds || startingEffects || 
    skillCardIdOrderGroups || customizationOrderGroups || turnTypeOrder;
  const enableSkillCardOrder = 
    !!(skillCardIdOrderGroups || customizationOrderGroups || removedCardOrder || turnTypeOrder);
  const enableStrategyCustomizations = strategyCustomizations != null;
  const enableCardPriorities = !!(prioritySkillCardIds || priorityCustomizations || priorityValues);

  stageId = stageId || DEFAULTS.stageId;
  if (!searchParams.has("support_bonus")) supportBonus = DEFAULTS.supportBonus;
  pItemIds = pItemIds || DEFAULTS.pItemIds;
  skillCardIdGroups = skillCardIdGroups || DEFAULTS.skillCardIdGroups;
  customizationGroups = customizationGroups || DEFAULTS.customizationGroups;
  pDrinkIds = pDrinkIds || DEFAULTS.pDrinkIds;
  hifAbilityIds = hifAbilityIds || DEFAULTS.hifAbilityIds;
  startingEffects = startingEffects || DEFAULTS.startingEffects;
  removedCardOrder = removedCardOrder || DEFAULTS.removedCardOrder;
  strategyCustomizations = strategyCustomizations || DEFAULTS.strategyCustomizations;
  prioritySkillCardIds = prioritySkillCardIds || DEFAULTS.prioritySkillCardIds;
  priorityCustomizations = priorityCustomizations || DEFAULTS.priorityCustomizations;
  priorityValues = priorityValues || DEFAULTS.priorityValues;

  const isProduceExam = !!produceExamIdOf(stageId);
  stageId = knownStageId(isProduceExam ? stageId : parseInt(stageId, 10));
  const turnTypes = isProduceExam
    ? deserializeTurnTypes(searchParams.get("turns"))
    : null;
  const customStage = turnTypes ? { turnTypes } : {};
  const pDrinkTurns = deserializePDrinkTurns(
    isProduceExam ? searchParams.get("drink_turns") : null
  );
  const startStamina = deserializeStartStamina(
    isProduceExam ? searchParams.get("start_stamina") : null,
  );
  supportBonus = parseFloat(supportBonus);
  if (isNaN(supportBonus)) supportBonus = null;
  params = params
    ? deserializeIds(params)
    : getDefaultParams(getStage(stageId, customStage));
  pItemIds = deserializeIds(pItemIds).map(knownPItemId);
  skillCardIdGroups = skillCardIdGroups
    .split("_")
    .map((group) => deserializeIds(group).map(knownSkillCardId));
  customizationGroups = customizationGroups
    .split("_")
    .map(deserializeCustomizations);
  pDrinkIds = deserializePDrinkIds(pDrinkIds);
  hifAbilityIds = deserializeIds(hifAbilityIds);
  startingEffects = deserializeIds(startingEffects);
  removedCardOrder = removedCardOrder == "1" ? "skip" : "random";
  strategyCustomizations = {
    ...StrategyCustomizations.getDefaults(),
    ...deserializeStrategyCustomizations(strategyCustomizations)
  };
  prioritySkillCardIds = deserializeIds(prioritySkillCardIds);
  priorityCustomizations = deserializeCustomizations(priorityCustomizations);
  priorityValues = deserializeIds(priorityValues);

  if (skillCardIdOrderGroups) {
    skillCardIdOrderGroups = skillCardIdOrderGroups
      .split("_")
      .map(deserializeIds);
  } else {
    const stage = Stages.getById(stageId);
    if (stageId === "custom" || stage?.type === "contest" || stage?.type === "event") {
      skillCardIdOrderGroups = [new Array(20).fill(0)];
    } else if (stage?.type === "linkContest") {
      skillCardIdOrderGroups = [new Array(12).fill(0)];
    } else if (stage?.type === "exam") {
      skillCardIdOrderGroups = [new Array(skillCardIdGroups[0].length).fill(0)];
    } else {
      skillCardIdOrderGroups = [new Array(20).fill(0)];
    }
  }
  if (customizationOrderGroups) {
    customizationOrderGroups = customizationOrderGroups
      .split("_")
      .map(deserializeCustomizations);
  } else {
    const stage = Stages.getById(stageId);
    if (stageId === "custom" || stage?.type === "contest" || stage?.type === "event") {
      customizationOrderGroups = [new Array(20).fill({})];
    } else if (stage?.type === "linkContest") {
      customizationOrderGroups = [new Array(12).fill({})];
    } else if (stage?.type === "exam") {
      customizationOrderGroups = [new Array(skillCardIdGroups[0].length).fill({})];
    } else {
      customizationOrderGroups = [new Array(20).fill({})];
    }
  }
  if (turnTypeOrder) {
    turnTypeOrder = turnTypeOrder.split("-")
      .map((x) => parseInt(x, 10) || 0)
      .map((i) => ["none", "vocal", "dance", "visual"][i]);
  } else {
    // init turn type order by stage
    let turnCounts = null;
    if (stageId === "custom") {
      turnCounts = 12;
    } else {
      const stage = Stages.getById(stageId);
      if (stage) {
        turnCounts = stage.turnCounts;
      } else {
        const examStageId = produceExamIdOf(stageId);
        if (examStageId) {
          turnCounts = ProduceExams.getById(examStageId).turnCounts;
        }
      }
    }
    const totalTurns = turnCounts ? turnCounts.vocal + turnCounts.dance + turnCounts.visual : 12;
    turnTypeOrder = new Array(totalTurns).fill("none");
  }

  // Ensure customizations are same shape as skill cards
  if (skillCardIdGroups.length != customizationGroups.length) {
    customizationGroups = skillCardIdGroups.map((g) => g.map(() => ({})));
  }
  customizationGroups = fixCustomizationGroups(
    skillCardIdGroups,
    customizationGroups
  );

  // Ensure customization order are same shape as skill card order
  if (skillCardIdOrderGroups.length != customizationOrderGroups.length) {
    customizationOrderGroups = skillCardIdOrderGroups.map((g) => g.map(() => ({})));
  }

  return {
    stageId,
    customStage,
    enterPercents,
    supportBonus,
    params,
    pItemIds,
    pDrinkIds,
    pDrinkTurns,
    startStamina,
    skillCardIdGroups,
    customizationGroups,
    pDrinkIds,
    hifAbilityIds,
    startingEffects,
    hasDataFromParams,
    enableSkillCardOrder,
    skillCardIdOrderGroups,
    customizationOrderGroups,
    removedCardOrder,
    turnTypeOrder,
    enableStrategyCustomizations,
    strategyCustomizations,
    enableCardPriorities,
    prioritySkillCardIds,
    priorityCustomizations,
    priorityValues,
  };
}

export function loadoutsFromSearchParamsLegacy(searchParams) {
  let loadouts = [];
  loadouts.push(loadoutFromSearchParams(searchParams));
  loadouts.push(loadoutFromSearchParams(searchParams, "2"));
  loadouts.push(loadoutFromSearchParams(searchParams, "3"));
  return loadouts;
}

export function loadoutToSearchParams(loadout) {
  const {
    stageId,
    customStage,
    enterPercents,
    supportBonus,
    params,
    pItemIds,
    pDrinkIds,
    pDrinkTurns,
    startStamina,
    skillCardIdGroups,
    customizationGroups,
    hifAbilityIds,
    startingEffects,
    enableSkillCardOrder,
    skillCardIdOrderGroups,
    customizationOrderGroups,
    removedCardOrder,
    turnTypeOrder,
    enableStrategyCustomizations,
    strategyCustomizations,
    enableCardPriorities,
    prioritySkillCardIds,
    priorityCustomizations,
    priorityValues,
  } = loadout;
  const searchParams = new URLSearchParams();
  searchParams.set("stage", stageId);
  if (produceExamIdOf(stageId)) {
    const { turnTypes } = getStage(stageId, customStage);
    searchParams.set("turns", serializeTurnTypes(turnTypes));
    if (pDrinkIds?.some((id) => id)) {
      searchParams.set("drinks", serializeIds(pDrinkIds));
      if (pDrinkTurns?.some((turn, i) => pDrinkIds[i] && turn > 0)) {
        searchParams.set(
          "drink_turns",
          serializeIds(pDrinkIds.map((id, i) => (id && pDrinkTurns[i]) || 0)),
        );
      }
    }
    if (startStamina != null) {
      searchParams.set("start_stamina", startStamina);
    }
  }
  if (enterPercents) searchParams.set("enter_percents", "1");
  if (supportBonus != null) {
    searchParams.set("support_bonus", supportBonus);
  }
  searchParams.set("params", serializeIds(params));
  searchParams.set("items", serializeIds(pItemIds));
  searchParams.set("cards", skillCardIdGroups.map(serializeIds).join("_"));
  searchParams.set(
    "customizations",
    skillCardIdGroups
      .map((_, i) => serializeCustomizations(customizationGroups?.[i]))
      .join("_")
  );
  if (Stages.getById(stageId)?.type === "exam") {
    searchParams.set("drinks", serializeIds(pDrinkIds));
    searchParams.set("effects", serializeIds(startingEffects));
    searchParams.set("hif_abilities", serializeIds(hifAbilityIds));
  }
  if (enableSkillCardOrder) {
    searchParams.set("order_cards", skillCardIdOrderGroups.map(serializeIds).join("_"));
    searchParams.set(
      "order_customs",
      customizationOrderGroups.map(serializeCustomizations).join("_")
    );
    if (removedCardOrder) {
      searchParams.set("order_removed", removedCardOrder == "random" ? "0" : "1");
    }
    if (turnTypeOrder) {
      searchParams.set(
        "order_turns",
        turnTypeOrder.map((t) => ["none", "vocal", "dance", "visual"].indexOf(t)).join("-")
      );
    }
  }
  if (enableStrategyCustomizations) {
    searchParams.set("strategy_customs", serializeStrategyCustomizations(strategyCustomizations));
  }
  if (enableCardPriorities) {
    searchParams.set("pri_cards", serializeIds(prioritySkillCardIds));
    searchParams.set("pri_customs", serializeCustomizations(priorityCustomizations));
    searchParams.set("pri_values", serializeIds(priorityValues.map((v) => v || 100)));
  }
  return searchParams;
}

export function loadoutsFromSearchParams(searchParams) {
  if (searchParams.get("params2")) {
    return loadoutsFromSearchParamsLegacy(searchParams);
  }
  let loadouts = [];
  let firstLoadout = null;
  const loadoutParams = searchParams.getAll("loadout");
  for (let param of loadoutParams) {
    let paramString;
    try {
      paramString = decodeURIComponent(param);
    } catch {
      continue;
    }
    const paramSearchParams = new URLSearchParams(paramString);
    const loadout = loadoutFromSearchParams(paramSearchParams);
    loadouts.push(loadout);
    if (!firstLoadout) {
      firstLoadout = loadout;
    } else {
      loadout.removedCardOrder = firstLoadout.removedCardOrder;
      loadout.turnTypeOrder = firstLoadout.turnTypeOrder;
    }
  }
  return loadouts;
}

export function loadoutsToSearchParams(loadouts) {
  const searchParams = new URLSearchParams();
  let firstLoadout = true;
  for (let loadout of loadouts) {
    const loadoutSearchParams = loadoutToSearchParams({
      ...loadout,
      supportBonus: null,
      removedCardOrder: firstLoadout ? loadout.removedCardOrder : null,
      turnTypeOrder: firstLoadout ? loadout.turnTypeOrder : null,
    });
    searchParams.append(
      "loadout",
      encodeURIComponent(loadoutSearchParams.toString())
    );
  }
  return searchParams;
}
