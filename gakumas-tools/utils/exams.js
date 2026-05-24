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

const CRITERIA_HAJIME_BY_IDOL = {
  1: [0.27, 0.33, 0.4], 
  2: [0.5, 0.3, 0.2],
  3: [0.15, 0.45, 0.4],
  4: [0.45, 0.15, 0.4],
  5: [0.27, 0.33, 0.4],
  6: [0.2, 0.5, 0.3],
  7: [0.17, 0.6, 0.23],
  8: [0.4, 0.33, 0.27],
  9: [0.27, 0.33, 0.4],
  10: [0.33, 0.4, 0.27],
  11: [0.33, 0.27, 0.4],
  12: [0.5, 0.2, 0.3],
  13: [0.3, 0.5, 0.2],
};

const CRITERIA_NIA_BY_IDOL = {
  1: [0.21, 0.35, 0.44], 
  2: [0.5, 0.31, 0.19],
  3: [0.19, 0.5, 0.31],
  4: [0.5, 0.19, 0.31],
  5: [0.21, 0.35, 0.44],
  6: [0.19, 0.5, 0.31],
  7: [0.19, 0.5, 0.31],
  8: [0.44, 0.35, 0.21],
  9: [0.21, 0.35, 0.44],
  10: [0.35, 0.44, 0.21],
  11: [0.35, 0.21, 0.44],
  12: [0.5, 0.19, 0.31],
  13: [0.31, 0.5, 0.19],
};

const FIRST_TURNS_10 = {
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
}

const FIRST_TURNS_12 = {
  1: [0, 0.12, 0.88], 
  2: [1, 0, 0],
  3: [0, 1, 0],
  4: [1, 0, 0],
  5: [0, 0.12, 0.88],
  6: [0, 1, 0],
  7: [0, 1, 0],
  8: [0.88, 0.12, 0],
  9: [0, 0.12, 0.88],
  10: [0.12, 0.88, 0],
  11: [0.12, 0, 0.88],
  12: [1, 0, 0],
  13: [0, 1, 0],
}

const FIRST_TURNS_15 = {
  1: [0, 0.15, 0.85], 
  2: [1, 0, 0],
  3: [0, 1, 0],
  4: [1, 0, 0],
  5: [0, 0.15, 0.85],
  6: [0, 1, 0],
  7: [0, 1, 0],
  8: [0.85, 0.15, 0],
  9: [0, 0.15, 0.85],
  10: [0.15, 0.85, 0],
  11: [0.15, 0, 0.85],
  12: [1, 0, 0],
  13: [0, 1, 0],
}

const FIRST_TURNS_BY_TURN_IDOL = {
  9: FIRST_TURNS_15,
  10: FIRST_TURNS_12,
  12: FIRST_TURNS_10,
};

const TURN_COUNTS_HAJIME_BY_TERM_PLAN_IDOL = {
  1: { // Midterm exam
    logic: {
      1: [2, 3, 4],
      2: [5, 2, 2],
      3: [2, 4, 3],
      4: [4, 2, 3],
      5: [2, 3, 4],
      6: [2, 5, 2],
      7: [2, 5, 2],
      8: [4, 3, 2],
      9: [2, 3, 4],
      10: [3, 4, 2],
      11: [3, 2, 4],
      12: [5, 2, 2],
      13: [2, 5, 2],
    },
    other: {
      1: [2, 3, 4],
      2: [5, 2, 2],
      3: [2, 4, 3],
      4: [4, 2, 3],
      5: [2, 3, 4],
      6: [2, 5, 2],
      7: [2, 5, 2],
      8: [4, 3, 2],
      9: [2, 3, 4],
      10: [3, 4, 2],
      11: [3, 2, 4],
      12: [5, 2, 2],
      13: [2, 5, 2],
    },
  },
  2: { // Final exam
    logic: {
      1: [3, 3, 5],
      2: [5, 3, 3],
      3: [2, 5, 4],
      4: [5, 2, 4],
      5: [3, 3, 5],
      6: [3, 5, 3],
      7: [2, 6, 3],
      8: [5, 3, 3],
      9: [3, 3, 5],
      10: [3, 5, 3],
      11: [3, 3, 5],
      12: [5, 3, 3],
      13: [3, 5, 3],
    },
    other: {
      1: [3, 4, 5],
      2: [6, 3, 3],
      3: [2, 6, 4],
      4: [6, 2, 4],
      5: [3, 4, 5],
      6: [3, 6, 3],
      7: [2, 7, 3],
      8: [5, 4, 3],
      9: [3, 4, 5],
      10: [4, 5, 3],
      11: [4, 3, 5],
      12: [6, 3, 3],
      13: [3, 6, 3],
    },
  },
};

const TURN_COUNTS_BY_TURN_IDOL = {
  9: {
    1: [2, 3, 4],
    2: [4, 3, 2],
    3: [2, 4, 3],
    4: [4, 2, 3],
    5: [2, 3, 4],
    6: [2, 4, 3],
    7: [2, 4, 3],
    8: [4, 3, 2],
    9: [2, 3, 4],
    10: [3, 4, 2],
    11: [3, 2, 4],
    12: [4, 2, 3],
    13: [3, 4, 2],
  },
  10: {
    1: [2, 3, 5],
    2: [5, 3, 2],
    3: [2, 5, 3],
    4: [5, 2, 3],
    5: [2, 3, 5],
    6: [2, 5, 3],
    7: [2, 5, 3],
    8: [5, 3, 2],
    9: [2, 3, 5],
    10: [3, 5, 2],
    11: [3, 2, 5],
    12: [5, 2, 3],
    13: [3, 5, 2],
  },
  11: {
    1: [3, 3, 5],
    2: [5, 3, 3],
    3: [2, 5, 4],
    4: [5, 2, 4],
    5: [3, 3, 5],
    6: [3, 5, 3],
    7: [2, 6, 3],
    8: [5, 3, 3],
    9: [3, 3, 5],
    10: [3, 5, 3],
    11: [3, 3, 5],
    12: [5, 3, 3],
    13: [3, 5, 3],
  },
  12: {
    1: [3, 4, 5],
    2: [6, 3, 3],
    3: [3, 6, 3],
    4: [6, 3, 3],
    5: [3, 4, 5],
    6: [3, 6, 3],
    7: [3, 6, 3],
    8: [5, 4, 3],
    9: [3, 4, 5],
    10: [4, 5, 3],
    11: [4, 3, 5],
    12: [6, 3, 3],
    13: [3, 6, 3],
  },
};

function addSupportEffectSource(effect) {
  return {
    ...effect,
    source: { type: "default", id: "応援効果" },
  };
}

const SUPPORT_EFFECTS_HAJIME_REGULAR_MID = {
  goodConditionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_REGULAR_FINAL = {
  goodConditionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_PRO_MID = {
  goodConditionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_PRO_FINAL = {
  goodConditionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_MASTER_MID = {
  goodConditionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_MASTER_FINAL = {
  goodConditionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_FINALE = {
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:concentrationIncreased { if:goodConditionTurns>=3 { concentration+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns>=6 { goodConditionTurns+=6 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & concentration>=12 { concentration+=4 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:goodConditionTurnsIncreased { if:goodConditionTurns>=8 { goodConditionTurns+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & concentration>=8 { concentration+=6 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & goodConditionTurns>0 { goodConditionTurns+=4 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:goodImpressionTurnsIncreased { goodImpressionTurns+=2 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodImpressionTurns>=15 { goodImpressionTurns+=7 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodImpressionTurns>=23 { goodImpressionTurns+=7 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & goodImpressionTurns>=35 { goodImpressionTurns*=1.5 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn { if:turnsElapsed==0 { at:genkiIncreased { if:motivation>=12 { score+=motivation*1.5 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & motivation>=8 { motivation+=7 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & motivation>=17 { motivation+=7 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & genki>=50 { setScoreBuff(0.25) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn { if:turnsElapsed==0 { at:afterActiveCardUsed { if:isStrength { target:all { g.score+=2 } } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & strengthTimes>=2 { target:all { g.score+=13 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & cumulativeFullPowerCharge>=5 { target:all { g.score+=8 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & strengthTimes>=3 { setScoreBuff(0.25) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==9 & strengthTimes>=4 { setScoreBuff(0.5) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn { if:turnsElapsed==0 { at:fullPowerChargeIncreased { target:all { g.score+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & cumulativeFullPowerCharge>=8 { target:all { g.score+=13 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & strengthTimes>=1 { target:all { g.score+=8 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & preservationTimes>=2 { setScoreBuff(0.25) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==9 & fullPowerTimes>=2 { setScoreBuff(0.5) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_QUARTET = {
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { goodConditionTurns+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns>=10 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & concentration>=10 { goodConditionTurns+=3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { concentration+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & concentration>=12 { goodConditionTurns+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & goodConditionTurns>=5 { concentration+=3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { goodImpressionTurns+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodImpressionTurns>=9 { goodImpressionTurns+=6 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodImpressionTurns>=15 { goodImpressionTurns+=6 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & goodImpressionTurns>=25 { goodImpressionTurns*=1.5 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { motivation+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & motivation>=16 { at:activeCardUsed { score+=motivation } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & genki>=50 { setScoreBuff(0.25) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%5==4 { target:all { g.score+=3 } } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & cumulativeFullPowerCharge>=5 { target:all { g.score+=5 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & strengthTimes>=2 { setScoreBuff(0.25) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==9 & strengthTimes>=3 { setScoreBuff(0.5) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%5==4 { target:all { g.score+=3 } } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & strengthTimes>=1 { target:all { g.score+=5 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & cumulativeFullPowerCharge>=10 { setScoreBuff(0.25) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==9 & fullPowerTimes>=1 { setScoreBuff(0.5) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_GALAXY = {
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%2==1 { goodConditionTurns+=1 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns>=6 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & concentration>=7 { goodConditionTurns+=3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%2==1 { concentration+=1 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & concentration>=8 { goodConditionTurns+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & goodConditionTurns>=3 { concentration+=3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%2==1 { goodImpressionTurns+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodImpressionTurns>=11 { goodImpressionTurns+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & goodImpressionTurns>=22 { goodImpressionTurns*=1.3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%2==1 { score+=genki*0.35 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & genki>=50 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%3==2 { target:all { g.score+=2 } } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & cumulativeFullPowerCharge>=5 { target:all { g.score+=10 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & preservationTimes>=2 { setScoreBuff(0.15) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & strengthTimes>=4 { setScoreBuff(0.2) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%3==2 { target:all { g.score+=2 } } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & strengthTimes>=1 { target:all { g.score+=10 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & cumulativeFullPowerCharge>=10 { setScoreBuff(0.15) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & cumulativeFullPowerCharge>=13 { setScoreBuff(0.2) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_MELOBANG = {
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:goodConditionTurnsIncreased { concentration+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns>=6 { concentration+=2 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:concentrationIncreased { goodConditionTurns+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & concentration>=5 { goodConditionTurns+=2 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:goodImpressionTurnsIncreased { goodImpressionTurns+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodImpressionTurns>=9 { goodImpressionTurns+=12 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodImpressionTurns>=22 { goodImpressionTurns*=1.3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn { if:turnsElapsed==0 { at:motivationIncreased { score+=genki*0.25 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & motivation>=12 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn { if:turnsElapsed==0 { at:stanceChanged { if:isStrength { target:all { g.score+=2 } } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & strengthTimes>=1 { setScoreBuff(0.1) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & strengthTimes>=2 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn { if:turnsElapsed==0 { at:fullPowerChargeIncreased { target:all { g.score+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & cumulativeFullPowerCharge>=5 { setScoreBuff(0.1) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==9 & cumulativeFullPowerCharge>=8 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_MUSICORDER = {
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { goodConditionTurns+=1 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns>=5 { concentration+=3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { concentration+=1 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & concentration>=7 { goodConditionTurns+=3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { goodImpressionTurns+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodImpressionTurns>=9 { goodImpressionTurns+=2 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodImpressionTurns>=16 { goodImpressionTurns*=1.3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { score+=genki*0.35 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & motivation>=12 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%5==4 { target:all { g.score+=2 } } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & strengthTimes>=1 { setScoreBuff(0.15) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & strengthTimes>=2 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%5==4 { target:all { g.score+=2 } } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & cumulativeFullPowerCharge>=5 { setScoreBuff(0.15) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==9 & cumulativeFullPowerCharge>=8 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_FINALE = {
  ...SUPPORT_EFFECTS_NIA_PRO_FINALE,
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:concentrationIncreased { if:goodConditionTurns>=3 { concentration+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodConditionTurns>=6 { goodConditionTurns+=6 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & concentration>=12 { concentration+=4 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & goodConditionTurns>=15 { setScoreBuff(0.25) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:goodConditionTurnsIncreased { if:goodConditionTurns>=8 { goodConditionTurns+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & concentration>=8 { concentration+=6 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodConditionTurns>=7 { goodConditionTurns+=4 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & concentration>=18 { setScoreBuff(0.25) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_QUARTET = {
  ...SUPPORT_EFFECTS_NIA_PRO_QUARTET,
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { goodConditionTurns+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodConditionTurns>=6 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & concentration>=10 { goodConditionTurns+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & goodConditionTurns>=10 { setScoreBuff(0.25) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { concentration+=2 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & concentration>=8 { goodConditionTurns+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodConditionTurns>=5 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & concentration>=12 { setScoreBuff(0.25) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_GALAXY = {
  ...SUPPORT_EFFECTS_NIA_PRO_GALAXY,
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%2==1 { goodConditionTurns+=1 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns>=6 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & goodConditionTurns>=8 { setScoreBuff(0.15) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & concentration>=7 { goodConditionTurns+=3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:cardUsed { if:examCardUsed%2==1 { concentration+=1 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & concentration>=8 { goodConditionTurns+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & concentration>=10 { setScoreBuff(0.15) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & goodConditionTurns>=3 { concentration+=3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_MELOBANG = {
  ...SUPPORT_EFFECTS_NIA_PRO_MELOBANG,
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:goodConditionTurnsIncreased { concentration+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodConditionTurns>=6 { concentration+=2 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodConditionTurns>=6 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:concentrationIncreased { goodConditionTurns+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & concentration>=7 { goodConditionTurns+=2 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & concentration>=8 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_MUSICORDER = {
  ...SUPPORT_EFFECTS_NIA_PRO_MUSICORDER,
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { goodConditionTurns+=1 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodConditionTurns>=5 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodConditionTurns>=6 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { examCardUsed+=1 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==0 { at:mentalCardUsed { if:examCardUsed%3==2 { concentration+=1 } } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & concentration>=7 { goodConditionTurns+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & concentration>=8 { setScoreBuff(0.15) }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_LEGEND_FINAL = {
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==2 & goodConditionTurns>=1 { goodConditionTurns+=2 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns>=8 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & goodConditionTurns>=12 { concentration+=4 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & goodConditionTurns>=17 { goodConditionTurns+=6 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==2 & concentration>=3 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & concentration>=10 { goodConditionTurns+=5 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & concentration>=15 { goodConditionTurns+=6 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & concentration>=22 { concentration+=9 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn { if:turnsElapsed==1 { goodImpressionTurns+=8 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==3 & goodImpressionTurns>=14 { goodImpressionTurns+=15 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & goodImpressionTurns>=24 { setGoodImpressionTurnsEffectBuff(0.5) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==7 & goodImpressionTurns>=28 { goodImpressionTurns*=1.3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn { if:turnsElapsed==2 & motivation>=3 { motivation+=5 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==5 & motivation>=16 { motivation+=10 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & motivation>=24 { genki+=8 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn { if:turnsElapsed==0 { setScoreBuff(0.2) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==2 & preservationTimes>=1 { target:all { g.score+=3 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & strengthTimes>=2 { target:all { g.score+=5 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & preservationTimes>=2 { target:all { g.score+=8 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & strengthTimes>=4 { target:all { g.score+=15 } }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn { if:turnsElapsed==0 { setScoreBuff(0.1) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==2 & preservationTimes>=1 { fullPowerCharge+=5 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & fullPowerTimes>=1 { target:all { g.score+=5 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & preservationTimes>=2 { target:all { g.score+=8 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==8 & fullPowerTimes>=2 { target:all { g.score+=15 } }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_LEGEND_MID = {
  goodConditionTurns: [
    "at:startOfTurn { if:turnsElapsed==2 & goodConditionTurns>=1 { goodConditionTurns+=1 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodConditionTurns>=4 { goodConditionTurns+=2 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & goodConditionTurns>=9 { goodConditionTurns+=4 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn { if:turnsElapsed==2 & concentration>=3 { concentration+=2 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & concentration>=6 { concentration+=3 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & concentration>=11 { concentration+=6 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn { if:turnsElapsed==2 & goodImpressionTurns>=1 { goodImpressionTurns+=10 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & goodImpressionTurns>=15 { goodImpressionTurns*=1.3 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn { if:turnsElapsed==2 & motivation>=3 { motivation+=2 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & genki>=7 { motivation+=4 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & motivation>=13 { genki+=7 }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn { if:turnsElapsed==0 { setScoreBuff(0.2) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==2 & strengthTimes>=1 { target:all { g.score+=2 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & preservationTimes>=2 { target:all { g.score+=4 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & strengthTimes>=2 { target:all { g.score+=7 } }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn { if:turnsElapsed==0 { setScoreBuff(0.2) }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==2 & cumulativeFullPowerCharge>=5 { target:all { g.score+=4 } }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==4 & preservationTimes>=2 { fullPowerCharge+=5 }; limit:1 }",
    "at:startOfTurn { if:turnsElapsed==6 & fullPowerTimes>=1 { target:all { g.score+=7 } }; limit:1 }",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_BY_SEASON_STAGE_EFFECT = {
  1: {
    1: SUPPORT_EFFECTS_HAJIME_REGULAR_MID,
    2: SUPPORT_EFFECTS_HAJIME_REGULAR_FINAL,
  },
  2: {
    1: SUPPORT_EFFECTS_HAJIME_PRO_MID,
    2: SUPPORT_EFFECTS_HAJIME_PRO_FINAL,
  },
  3: {
    1: SUPPORT_EFFECTS_HAJIME_MASTER_MID,
    2: SUPPORT_EFFECTS_HAJIME_MASTER_FINAL,
  },
  4: {
    1: SUPPORT_EFFECTS_NIA_PRO_MELOBANG,
    2: SUPPORT_EFFECTS_NIA_PRO_MUSICORDER,
    3: SUPPORT_EFFECTS_NIA_PRO_MUSICORDER,
    4: SUPPORT_EFFECTS_NIA_PRO_GALAXY,
    5: SUPPORT_EFFECTS_NIA_PRO_MELOBANG,
    6: SUPPORT_EFFECTS_NIA_PRO_MELOBANG,
    7: SUPPORT_EFFECTS_NIA_PRO_FINALE,
    8: SUPPORT_EFFECTS_NIA_PRO_QUARTET,
    9: SUPPORT_EFFECTS_NIA_PRO_GALAXY,
    10: SUPPORT_EFFECTS_NIA_PRO_GALAXY,
  },
  5: {
    1: SUPPORT_EFFECTS_NIA_MASTER_MELOBANG,
    2: SUPPORT_EFFECTS_NIA_MASTER_MUSICORDER,
    3: SUPPORT_EFFECTS_NIA_MASTER_MUSICORDER,
    4: SUPPORT_EFFECTS_NIA_MASTER_GALAXY,
    5: SUPPORT_EFFECTS_NIA_MASTER_MELOBANG,
    6: SUPPORT_EFFECTS_NIA_MASTER_MELOBANG,
    7: SUPPORT_EFFECTS_NIA_MASTER_FINALE,
    8: SUPPORT_EFFECTS_NIA_MASTER_QUARTET,
    9: SUPPORT_EFFECTS_NIA_MASTER_GALAXY,
    10: SUPPORT_EFFECTS_NIA_MASTER_GALAXY,
  },
  6: {
    1: SUPPORT_EFFECTS_HAJIME_LEGEND_MID,
    2: SUPPORT_EFFECTS_HAJIME_LEGEND_FINAL,
  },
};

export function getExamStage(stageId, pIdolId) {
  const stage = Stages.getById(stageId);
  if (stage?.type === "exam") {
    const pIdol = PIdols.getById(pIdolId);
    if (!pIdol) return stage;
    const examStage = deepCopy(stage);
    examStage.plan = pIdol.plan;
    const totalTurns = examStage.turnCounts.vocal + examStage.turnCounts.dance + examStage.turnCounts.visual;
    const firstTurns = FIRST_TURNS_BY_TURN_IDOL[totalTurns][pIdol.idolId];
    examStage.firstTurns = { vocal: firstTurns[0], dance: firstTurns[1], visual: firstTurns[2] };
    const recommendedEffect = RECOMMENDED_EFFECT_MAPPINGS[pIdol.id] || pIdol.recommendedEffect;
    examStage.effects = SUPPORT_EFFECTS_BY_SEASON_STAGE_EFFECT[stage.season]?.[stage.stage]?.[recommendedEffect] || [];
    if (stage.season < 4) { // Hajime
      const criteria = CRITERIA_HAJIME_BY_IDOL[pIdol.idolId];
      examStage.criteria = { vocal: criteria[0], dance: criteria[1], visual: criteria[2] };
      const turnCounts = TURN_COUNTS_HAJIME_BY_TERM_PLAN_IDOL[stage.stage][pIdol.plan == "logic" ? "logic" : "other"][pIdol.idolId];
      examStage.turnCounts = { vocal: turnCounts[0], dance: turnCounts[1], visual: turnCounts[2] };
    } else { // NIA and later
      const criteria = CRITERIA_NIA_BY_IDOL[pIdol.idolId];
      examStage.criteria = { vocal: criteria[0], dance: criteria[1], visual: criteria[2] };
      const turnCounts = TURN_COUNTS_BY_TURN_IDOL[totalTurns][pIdol.idolId];
      examStage.turnCounts = { vocal: turnCounts[0], dance: turnCounts[1], visual: turnCounts[2] };
    }
    // console.log("examStage:", examStage);
    return examStage;
  } else {
    return stage;
  }
}
