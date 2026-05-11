import { PItems, PIdols, SkillCards, Stages, deserializeEffectSequence } from "gakumas-data";
import { deepCopy, RECOMMENDED_EFFECT_MAPPINGS } from "gakumas-engine/utils";

export function inferPIdolId(pItemIds, skillCardIdGroups) {
  const signatureSkillCardId = skillCardIdGroups.flat().find(
    (id) => SkillCards.getById(id)?.sourceType == "pIdol"
  );
  if (signatureSkillCardId)
    return SkillCards.getById(signatureSkillCardId).pIdolId;

  const signaturePItemId = pItemIds.find(
    (id) => PItems.getById(id)?.sourceType == "pIdol"
  );
  if (signaturePItemId) return PItems.getById(signaturePItemId).pIdolId;

  return null;
}

const CRITERIA_BY_IDOL = {
  1: [0.27, 0.33, 0.4], 
  2: [0.5, 0.3, 0.2],
  3: [0.15, 0.45, 0.4],
  4: [0.45, 0.15, 0.4],
  5: [0.27, 0.33, 0.4],
  6: [0.2, 0.5, 0.3],
  7: [0.2, 0.5, 0.3],
  8: [0.4, 0.33, 0.27],
  9: [0.27, 0.33, 0.4],
  10: [0.33, 0.4, 0.27],
  11: [0.33, 0.27, 0.4],
  12: [0.5, 0.2, 0.3],
  13: [0.3, 0.5, 0.2],
};

const FIRST_TURNS_BY_IDOL = {
  1: [0, 0.1, 0.9], 
  2: [1, 0, 0],
  3: [0, 1, 0],
  4: [1, 0, 0],
  5: [0, 0.1, 0.9],
  6: [0, 1, 0],
  7: [0, 1, 0],
  8: [0.9, 0.1, 0],
  9: [0, 0.1, 0.9],
  10: [0.1, 0.9, 0],
  11: [0.1, 0, 0.9],
  12: [1, 0, 0],
  13: [0, 1, 0],
};

const TURN_COUNTS_BY_TURNS_IDOL = {
  18: { // STAGE 24
    1: [5, 6, 7],
    2: [8, 6, 4],
    3: [3, 8, 7],
    4: [8, 3, 7],
    5: [5, 6, 7],
    6: [4, 8, 6],
    7: [4, 8, 6],
    8: [7, 6, 5],
    9: [5, 6, 7],
    10: [6, 7, 5],
    11: [6, 5, 7],
    12: [8, 4, 6],
    13: [5, 9, 4],
  },
};

function addSupportEffectSource(effect) {
  return {
    ...effect,
    source: { type: "default", id: "応援効果" },
  };
}

const SUPPORT_EFFECTS_BY_STAGE_EFFECT = {
  24: {
    goodConditionTurns: [
      "at:cardUsed[active] { copySelectedToBottomOfDeckUpto[hand]; limit:5 }",
      "at:turnSkipped { at:turn { drawCard; limit:1 } }",

      "at:startOfTurn { if:turnsElapsed==1 & goodConditionTurns>=1 { concentration+=10 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns<=4 { noActiveTurns+=5 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==9 & goodConditionTurns>=17 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==12 & goodConditionTurns>=24 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==15 & goodConditionTurns>=32 { setScoreBuff(0.8) }; limit:1 }",
    ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
    concentration: [
      "at:cardUsed[active] { copySelectedToBottomOfDeckUpto[hand]; limit:5 }",
      "at:turnSkipped { at:turn { drawCard; limit:1 } }",

      "at:startOfTurn { if:turnsElapsed==1 & concentration>=1 { setConcentrationBuff(0.5) }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==4 & concentration<=5 { noActiveTurns+=5 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==9 & concentration>=18 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==12 & concentration>=25 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==15 & concentration>=32 { setScoreBuff(0.8) }; limit:1 }",
    ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
    goodImpressionTurns: [
      "at:cardUsed[active] { copySelectedToBottomOfDeckUpto[hand]; limit:5 }",
      "at:turnSkipped { at:turn { drawCard; limit:1 } }",

      "at:startOfTurn { if:turnsElapsed==1 & goodImpressionTurns>=2 { motivation+=10 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==4 & goodImpressionTurns<=6 { noActiveTurns+=5 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==9 & goodImpressionTurns>=24 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==12 & goodImpressionTurns>=33 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==15 & goodImpressionTurns>=43 { setScoreBuff(0.8) }; limit:1 }",
    ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
    motivation: [
      "at:cardUsed[active] { copySelectedToBottomOfDeckUpto[hand]; motivation+=2; limit:4 }",
      "at:turnSkipped { at:turn { drawCard(2); limit:1 } }",

      "at:startOfTurn { if:turnsElapsed==1 & motivation>=2 { goodImpressionTurns+=10 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==4 & motivation<=7 { noActiveTurns+=5 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==9 & motivation>=25 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==12 & motivation>=35 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==15 & motivation>=46 { setScoreBuff(0.8) }; limit:1 }",
    ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
    strength: [
      "at:cardUsed[active] { copySelectedToBottomOfDeckUpto[hand]; limit:5 }",
      "at:turnSkipped { at:turn { drawCard; limit:1 } }",

      "at:startOfTurn { if:turnsElapsed==1 & isPreservation { at:startOfTurn { fullPowerCharge+=1 } }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==4 & lastUsedCardType==active { noActiveTurns+=5 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==9 & stanceChangedTimes>=7 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==12 & stanceChangedTimes>=9 { cardUsesRemaining+=1 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==15 & stanceChangedTimes>=13 { setScoreBuff(0.8) }; limit:1 }",
    ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
    fullPower: [
      "at:cardUsed[active] { copySelectedToBottomOfDeckUpto[hand]; limit:5 }",
      "at:turnSkipped { at:turn { drawCard; limit:1 } }",

      "at:startOfTurn { if:turnsElapsed==1 & isPreservation { target:all { g.score+=10 } }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==4 & lastUsedCardType==active { noActiveTurns+=5 }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==9 & cumulativeFullPowerCharge>=19 { target:effect(fullPowerCharge) { g.scoreTimes+=1 } }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==12 & cumulativeFullPowerCharge>=26 { target:effect(fullPowerCharge) { g.scoreTimes+=1 } }; limit:1 }",
      "at:startOfTurn { if:turnsElapsed==15 & cumulativeFullPowerCharge>=34 { setScoreBuff(0.8) }; limit:1 }",
    ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  },
};

export function getIdolRoadStage(stageId, pIdolId) {
  const stage = Stages.getById(stageId);
  if (stage?.type === "idolRoad") {
    const pIdol = PIdols.getById(pIdolId);
    if (!pIdol) return stage;
    const idolRoadStage = deepCopy(stage);
    idolRoadStage.plan = pIdol.plan;
    const recommendedEffect = RECOMMENDED_EFFECT_MAPPINGS[pIdol.id] || pIdol.recommendedEffect;
    idolRoadStage.effects = SUPPORT_EFFECTS_BY_STAGE_EFFECT[stage.stage][recommendedEffect];

    const criteria = CRITERIA_BY_IDOL[pIdol.idolId];
    idolRoadStage.criteria = { vocal: criteria[0], dance: criteria[1], visual: criteria[2] };
    const totalTurns = stage.turnCounts.vocal + stage.turnCounts.dance + stage.turnCounts.visual;
    const turnCounts = TURN_COUNTS_BY_TURNS_IDOL[totalTurns][pIdol.idolId];
    idolRoadStage.turnCounts = { vocal: turnCounts[0], dance: turnCounts[1], visual: turnCounts[2] };
    const firstTurns = FIRST_TURNS_BY_IDOL[pIdol.idolId];
    idolRoadStage.firstTurns = { vocal: firstTurns[0], dance: firstTurns[1], visual: firstTurns[2] };

    // console.log("idolRoadStage:", idolRoadStage);
    return idolRoadStage;
  } else {
    return stage;
  }
}
