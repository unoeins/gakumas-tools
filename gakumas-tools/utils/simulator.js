import { PIdols, PItems, SkillCards, Stages } from "gakumas-data";
import { GRAPHED_FIELDS } from "gakumas-engine";
import { LISTENER_KEYS } from "gakumas-engine/constants";
import { MIN_BUCKET_SIZE } from "@/simulator/constants";
import {
  deserializeCustomizations,
  serializeCustomizations,
} from "./customizations";
import { deserializeIds, serializeIds } from "./ids";
import deepEqual from 'fast-deep-equal';

const DEFAULTS = {
  stageId: Stages.getAll().findLast((s) => s.type == "contest" && !s.preview)
    .id,
  supportBonus: "4",
  params: "1500-1500-1500-50",
  pItemIds: "0-0-0-0",
  skillCardIdGroups: "0-0-0-0-0-0_0-0-0-0-0-0",
  customizationGroups: "-----_-----",
  skillCardIdOrderGroups: "0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0",
  customizationOrderGroups: "-------------------",
  turnTypeOrder: "0-0-0-0-0-0-0-0-0-0-0-0",
  removedCardOrder: "0",
};

const SIMULATOR_BASE_URL = "https://gktools.ris.moe/simulator";

export function getSimulatorUrl(loadout) {
  const searchParams = loadoutToSearchParams(loadout);
  try {
    const protocol = window.location.protocol;
    const host = window.location.host;
    if(protocol && host) {
      return `${protocol}//${host}/simulator?${searchParams.toString()}`;
    }
  } catch(e) {
    // ignore
  }
  return `${SIMULATOR_BASE_URL}/?${searchParams.toString()}`;
}

export function loadoutFromSearchParams(searchParams) {
  let stageId = searchParams.get("stage");
  let supportBonus = searchParams.get("support_bonus");
  let params = searchParams.get("params");
  let pItemIds = searchParams.get("items");
  let skillCardIdGroups = searchParams.get("cards");
  let customizationGroups = searchParams.get("customizations");
  let skillCardIdOrderGroups = searchParams.get("order_cards");
  let customizationOrderGroups = searchParams.get("order_customs");
  let removedCardOrder = searchParams.get("order_removed");
  let turnTypeOrder = searchParams.get("order_turns");
  const hasDataFromParams =
    stageId || params || pItemIds || skillCardIdGroups || customizationGroups || 
    skillCardIdOrderGroups || customizationOrderGroups || turnTypeOrder;

  stageId = stageId || DEFAULTS.stageId;
  supportBonus = supportBonus || DEFAULTS.supportBonus;
  params = params || DEFAULTS.params;
  pItemIds = pItemIds || DEFAULTS.pItemIds;
  skillCardIdGroups = skillCardIdGroups || DEFAULTS.skillCardIdGroups;
  customizationGroups = customizationGroups || DEFAULTS.customizationGroups;
  skillCardIdOrderGroups = skillCardIdOrderGroups || DEFAULTS.skillCardIdOrderGroups;
  customizationOrderGroups = customizationOrderGroups || DEFAULTS.customizationOrderGroups;
  removedCardOrder = removedCardOrder || DEFAULTS.removedCardOrder;

  stageId = parseInt(stageId, 10) || null;
  supportBonus = parseFloat(supportBonus) || null;
  params = deserializeIds(params);
  pItemIds = deserializeIds(pItemIds);
  skillCardIdGroups = skillCardIdGroups.split("_").map(deserializeIds);
  customizationGroups = customizationGroups
    .split("_")
    .map(deserializeCustomizations);
  skillCardIdOrderGroups = skillCardIdOrderGroups
    .split("_")
    .map(deserializeIds);
  customizationOrderGroups = customizationOrderGroups
    .split("_")
    .map(deserializeCustomizations);
  removedCardOrder = removedCardOrder == "1" ? "skip" : "random";
  if (turnTypeOrder) {
    turnTypeOrder = turnTypeOrder.split("-")
      .map((x) => parseInt(x, 10) || 0)
      .map((i) => ["none", "vocal", "dance", "visual"][i]);
  } else {
    // init turn type order by stage
    if (stageId == null || stageId == "custom") {
      turnTypeOrder = new Array(12).fill("none");
    } else {
      const turnCounts = Stages.getById(stageId).turnCounts;
      turnTypeOrder = new Array(turnCounts.vocal + turnCounts.dance + turnCounts.visual).fill("none");
    }
  }

  // Ensure customizations are same shape as skill cards
  if (skillCardIdGroups.length != customizationGroups.length) {
    customizationGroups = skillCardIdGroups.map((g) => g.map(() => ({})));
  }

  // Ensure customization order are same shape as skill card order
  if (skillCardIdOrderGroups.length != customizationOrderGroups.length) {
    customizationOrderGroups = skillCardIdOrderGroups.map((g) => g.map(() => ({})));
  }

  return {
    stageId,
    supportBonus,
    params,
    pItemIds,
    skillCardIdGroups,
    customizationGroups,
    hasDataFromParams,
    skillCardIdOrderGroups,
    customizationOrderGroups,
    removedCardOrder,
    turnTypeOrder,
  };
}

export function loadoutToSearchParams(loadout) {
  const {
    stageId,
    supportBonus,
    params,
    pItemIds,
    skillCardIdGroups,
    customizationGroups,
    skillCardIdOrderGroups,
    customizationOrderGroups,
    removedCardOrder,
    turnTypeOrder,
  } = loadout;
  const searchParams = new URLSearchParams();
  searchParams.set("stage", stageId);
  searchParams.set("support_bonus", supportBonus);
  searchParams.set("params", serializeIds(params));
  searchParams.set("items", serializeIds(pItemIds));
  searchParams.set("cards", skillCardIdGroups.map(serializeIds).join("_"));
  searchParams.set(
    "customizations",
    customizationGroups.map(serializeCustomizations).join("_")
  );
  searchParams.set("order_cards", skillCardIdOrderGroups.map(serializeIds).join("_"));
  searchParams.set(
    "order_customs",
    customizationOrderGroups.map(serializeCustomizations).join("_")
  );
  searchParams.set("order_removed", removedCardOrder == "random" ? "0" : "1");
  searchParams.set(
    "order_turns",
    turnTypeOrder.map((t) => ["none", "vocal", "dance", "visual"].indexOf(t)).join("-")
  );
  return searchParams;
}

export function bucketScores(scores) {
  let data = {};

  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const bucketSize =
    MIN_BUCKET_SIZE *
    Math.max(Math.floor((maxScore - minScore) / MIN_BUCKET_SIZE / 100), 1);

  for (let score of scores) {
    const bucket = Math.floor(score / bucketSize);
    data[bucket] = (data[bucket] || 0) + 1;
  }

  const keys = Object.keys(data);
  const minKey = Math.min(...keys);
  const maxKey = Math.max(...keys);
  for (let i = minKey - 1; i <= maxKey + 1; i++) {
    if (!data[i]) data[i] = 0;
  }

  return {
    bucketedScores: data,
    bucketSize,
  };
}

export function getMedianScore(scores) {
  const sorted = [...scores].sort((a, b) => b - a);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : Math.floor((sorted[mid - 1] + sorted[mid]) / 2);
}

export function formatRun(run) {
  return {
    score: run.score,
    logs: [].concat(...run.logs),
  };
}

export function mergeResults(results) {
  let scores = [];
  for (let result of results) {
    scores = scores.concat(result.scores);
  }
  const averageScore = Math.round(
    scores.reduce((acc, cur) => acc + cur, 0) / scores.length
  );

  let minRun, averageRun, maxRun;
  for (let result of results) {
    if (!minRun || result.minRun.score < minRun.score) {
      minRun = result.minRun;
    }
    if (!maxRun || result.maxRun.score > maxRun.score) {
      maxRun = result.maxRun;
    }
    if (
      !averageRun ||
      Math.abs(result.averageRun.score - averageScore) <
        Math.abs(averageRun.score - averageScore)
    ) {
      averageRun = result.averageRun;
    }
  }

  const graphDatas = results.map((result) => result.graphData);
  const mergedGraphData = mergeGraphDatas(graphDatas);

  console.log("Merging results", results);
  const listenerDatas = results.map((result) => result.listenerData);
  const mergedListenerData = mergeListenerDatas(listenerDatas);

  return {
    graphData: mergedGraphData,
    minRun,
    averageRun,
    maxRun,
    averageScore,
    scores,
    listenerData: mergedListenerData,
  };
}

export function mergeGraphDatas(graphDatas) {
  let mergedGraphData = GRAPHED_FIELDS.reduce((acc, cur) => {
    acc[cur] = [];
    return acc;
  }, {});

  for (let graphData of graphDatas) {
    for (let field of GRAPHED_FIELDS) {
      for (let i = 0; i < graphData[field].length; i++) {
        if (!mergedGraphData[field][i]) mergedGraphData[field][i] = [];
        mergedGraphData[field][i].push(graphData[field][i]);
      }
    }
  }

  for (let field of GRAPHED_FIELDS) {
    for (let i = 0; i < mergedGraphData[field].length; i++) {
      mergedGraphData[field][i] =
        mergedGraphData[field][i].reduce((acc, cur) => acc + cur, 0) /
        mergedGraphData[field][i].length;
    }
  }

  return mergedGraphData;
}

export function mergeListenerDatas(listenerDatas) {
  console.log("Merging listener data", listenerDatas);
  let mergedListenerData = {};
  for (let key of LISTENER_KEYS) {
    const datas = listenerDatas.map((data) => data[key]).filter((d) => d);
    console.log("datas", datas);
    if (datas.length == 0) continue;
    switch (key) {
      case "UseStats":
        const mergedData = mergeUseStatsResults(datas);
        mergedListenerData[key] = mergedData;
        break;
      default:
        console.warn("No merge function for listener key", key);
        continue;
    }
  }

  return mergedListenerData;
}

function mergeUseStatsResults(statsArray) {
  const merged = { "data": [] };
  for (const stats of statsArray) {
    for (const [turn, cardsUsed] of stats.data.entries()) {
      merged.data[turn] = (merged.data[turn] || []);
      for (const { id, c, count } of cardsUsed) {
        const index = merged.data[turn].findIndex(
          (data) => data.id === id &&
                    (c ? deepEqual(c, data.c) : !data.c));
        if (index >= 0) {
          merged.data[turn][index].count += count;
        } else {
          merged.data[turn].push({ id, c, count });
        }
      }
    }
  }
  return merged;
}

export function getIndications(config, loadout) {
  const pIdolId = config.idol.pIdolId;
  const idolId = config.idol.idolId;
  const plan =
    config.stage.plan != "free" ? config.stage.plan : config.idol.plan;
  const dupeIndices = config.idol.dupeIndices;

  let pItemIndications = [];
  for (let id of loadout.pItemIds) {
    const pItem = PItems.getById(id);

    if (!pItem) {
      pItemIndications.push(null);
      continue;
    }

    let indications = {};

    // Plan mismatch
    if (plan && pItem.plan != "free" && pItem.plan != plan) {
      indications.planMismatch = true;
    }

    // P-idol mismatch
    if (pIdolId && pItem.sourceType == "pIdol" && pItem.pIdolId != pIdolId) {
      indications.pIdolMismatch = true;
    }
    pItemIndications.push(indications);
  }

  let skillCardIndicationGroups = [];
  let curIndex = 0;
  for (let i = 0; i < loadout.skillCardIdGroups.length; i++) {
    let skillCardIndications = [];
    for (let id of loadout.skillCardIdGroups[i]) {
      const skillCard = SkillCards.getById(id);

      if (!skillCard) {
        skillCardIndications.push(null);
        curIndex++;
        continue;
      }

      let indications = {};

      // Plan mismatch
      if (plan && skillCard.plan != "free" && skillCard.plan != plan) {
        indications.planMismatch = true;
      }

      // Idol mismatch
      if (
        idolId &&
        skillCard.sourceType == "pIdol" &&
        PIdols.getById(skillCard.pIdolId).idolId != idolId
      ) {
        indications.idolMismatch = true;
      }

      // Duplicate
      if (dupeIndices.includes(curIndex)) {
        indications.duplicate = true;
      }

      skillCardIndications.push(indications);
      curIndex++;
    }
    skillCardIndicationGroups.push(skillCardIndications);
  }

  return {
    pItemIndications,
    skillCardIndicationGroups,
  };
}
