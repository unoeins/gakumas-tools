import { PItems, PIdols, SkillCards, Stages, deserializeEffectSequence } from "gakumas-data";
import { deepCopy } from "gakumas-engine/utils";

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
  6: [0.2, 0.5, 0.33],
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

const FIRST_TURNS_HAJIME_BY_TERM_IDOL = {
  1: { // Midterm exam
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
  },
  2: { // Final exam
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
  },
};

const FIRST_TURNS_NIA_BY_TERM_IDOL = {
  1: { // First audition
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
        
  },
  2: { // Second and final audition
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
  },
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

const TURN_COUNTS_NIA_BY_TERM_IDOL = {
  1: { // First exam
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
  2: { // Second and final exam
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

const TURN_COUNTS_HAJIME_LEGEND_BY_TERM_IDOL = {
  1: { // Midterm exam
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
  2: { // Final exam
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
  preservation: [  // TODO
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
  preservation: [  // TODO
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
  preservation: [  // TODO
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
  preservation: [  // TODO
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
  preservation: [  // TODO
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
  preservation: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [  // TODO
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_FINALE = {
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:concentrationIncreased,if:goodConditionTurns>=3,do:concentration+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:goodConditionTurns>=6,do:goodConditionTurns+=6,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:concentration>=12,do:concentration+=4,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:goodConditionTurnsIncreased,if:goodConditionTurns>=8,do:goodConditionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:concentration>=8,do:concentration+=6,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:goodConditionTurns>0,do:goodConditionTurns+=4,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:goodImpressionTurnsIncreased,do:goodImpressionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:goodImpressionTurns>=15,do:goodImpressionTurns+=7,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodImpressionTurns>=23,do:goodImpressionTurns+=7,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:goodImpressionTurns>=35,do:goodImpressionTurns*=1.5,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:genkiIncreased,if:motivation>=12,do:score+=motivation*1.5",
    "at:startOfTurn,if:turnsElapsed==3,if:motivation>=8,do:motivation+=7,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:motivation>=17,do:motivation+=7,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:genki>=50,do:setScoreBuff(0.25),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:afterActiveCardUsed,if:isStrength,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:strengthTimes>=2,target:all,do:g.score+=13,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:cumulativeFullPowerCharge>=5,target:all,do:g.score+=8,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:strengthTimes>=3,do:setScoreBuff(0.25),limit:1",
    "at:startOfTurn,if:turnsElapsed==9,if:strengthTimes>=4,do:setScoreBuff(0.5),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  preservation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:afterActiveCardUsed,if:isStrength,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:strengthTimes>=2,target:all,do:g.score+=13,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:cumulativeFullPowerCharge>=5,target:all,do:g.score+=8,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:strengthTimes>=3,do:setScoreBuff(0.25),limit:1",
    "at:startOfTurn,if:turnsElapsed==9,if:strengthTimes>=4,do:setScoreBuff(0.5),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:fullPowerChargeIncreased,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:cumulativeFullPowerCharge>=8,target:all,do:g.score+=13,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:strengthTimes>=1,target:all,do:g.score+=8,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:preservationTimes>=2,do:setScoreBuff(0.25),limit:1",
    "at:startOfTurn,if:turnsElapsed==9,if:fullPowerTimes>=2,do:setScoreBuff(0.5),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_QUARTET = {
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:goodConditionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:goodConditionTurns>=10,do:concentration+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:concentration>=10,do:goodConditionTurns+=3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:concentration+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:concentration>=12,do:goodConditionTurns+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:goodConditionTurns>=5,do:concentration+=3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:goodImpressionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:goodImpressionTurns>=9,do:goodImpressionTurns+=6,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodImpressionTurns>=15,do:goodImpressionTurns+=6,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:goodImpressionTurns>=25,do:goodImpressionTurns*=1.5,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:motivation+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:motivation>=16,limit:1;at:activeCardUsed,do:score+=motivation",
    "at:startOfTurn,if:turnsElapsed==7,if:genki>=50,do:setScoreBuff(0.25),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%5==4,target:all,do:g.score+=3",
    "at:startOfTurn,if:turnsElapsed==3,if:cumulativeFullPowerCharge>=5,target:all,do:g.score+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:strengthTimes>=2,do:setScoreBuff(0.25),limit:1",
    "at:startOfTurn,if:turnsElapsed==9,if:strengthTimes>=3,do:setScoreBuff(0.5),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  preservation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%5==4,target:all,do:g.score+=3",
    "at:startOfTurn,if:turnsElapsed==3,if:cumulativeFullPowerCharge>=5,target:all,do:g.score+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:strengthTimes>=2,do:setScoreBuff(0.25),limit:1",
    "at:startOfTurn,if:turnsElapsed==9,if:strengthTimes>=3,do:setScoreBuff(0.5),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%5==4,target:all,do:g.score+=3",
    "at:startOfTurn,if:turnsElapsed==3,if:strengthTimes>=1,target:all,do:g.score+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:cumulativeFullPowerCharge>=10,do:setScoreBuff(0.25),limit:1",
    "at:startOfTurn,if:turnsElapsed==9,if:fullPowerTimes>=1,do:setScoreBuff(0.5),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_GALAXY = {
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%2==1,do:goodConditionTurns+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:goodConditionTurns>=6,do:concentration+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:concentration>=7,do:goodConditionTurns+=3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%2==1,do:concentration+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:concentration>=8,do:goodConditionTurns+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:goodConditionTurns>=3,do:concentration+=3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%2==1,do:goodImpressionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:goodImpressionTurns>=11,do:goodImpressionTurns+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:goodImpressionTurns>=22,do:goodImpressionTurns*=1.3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%2==1,do:score+=genki*0.35",
    "at:startOfTurn,if:turnsElapsed==5,if:genki>=50,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%3==2,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:cumulativeFullPowerCharge>=5,target:all,do:g.score+=10,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:preservationTimes>=2,do:setScoreBuff(0.15),limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:strengthTimes>=4,do:setScoreBuff(0.2),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  preservation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%3==2,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:cumulativeFullPowerCharge>=5,target:all,do:g.score+=10,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:preservationTimes>=2,do:setScoreBuff(0.15),limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:strengthTimes>=4,do:setScoreBuff(0.2),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%3==2,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:strengthTimes>=1,target:all,do:g.score+=10,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:cumulativeFullPowerCharge>=10,do:setScoreBuff(0.15),limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:cumulativeFullPowerCharge>=13,do:setScoreBuff(0.2),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_MELOBANG = {
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:goodConditionTurnsIncreased,do:concentration+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:goodConditionTurns>=6,do:concentration+=2,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:concentrationIncreased,do:goodConditionTurns+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:concentration>=5,do:goodConditionTurns+=2,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:goodImpressionTurnsIncreased,do:goodImpressionTurns+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:goodImpressionTurns>=9,do:goodImpressionTurns+=12,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodImpressionTurns>=22,do:goodImpressionTurns*=1.3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:motivationIncreased,do:score+=genki*0.25",
    "at:startOfTurn,if:turnsElapsed==5,if:motivation>=12,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:stanceChanged,if:isStrength,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:strengthTimes>=1,do:setScoreBuff(0.1),limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:strengthTimes>=2,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  preservation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:stanceChanged,if:isStrength,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:strengthTimes>=1,do:setScoreBuff(0.1),limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:strengthTimes>=2,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:fullPowerChargeIncreased,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:cumulativeFullPowerCharge>=5,do:setScoreBuff(0.1),limit:1",
    "at:startOfTurn,if:turnsElapsed==9,if:cumulativeFullPowerCharge>=8,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_PRO_MUSICORDER = {
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:goodConditionTurns+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:goodConditionTurns>=5,do:concentration+=3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:concentration+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:concentration>=7,do:goodConditionTurns+=3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:goodImpressionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:goodImpressionTurns>=9,do:goodImpressionTurns+=2,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodImpressionTurns>=16,do:goodImpressionTurns*=1.3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:score+=genki*0.35",
    "at:startOfTurn,if:turnsElapsed==5,if:motivation>=12,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%5==4,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:strengthTimes>=1,do:setScoreBuff(0.15),limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:strengthTimes>=2,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  preservation: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%5==4,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:strengthTimes>=1,do:setScoreBuff(0.15),limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:strengthTimes>=2,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%5==4,target:all,do:g.score+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:cumulativeFullPowerCharge>=5,do:setScoreBuff(0.15),limit:1",
    "at:startOfTurn,if:turnsElapsed==9,if:cumulativeFullPowerCharge>=8,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_FINALE = {
  ...SUPPORT_EFFECTS_NIA_PRO_FINALE,
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:concentrationIncreased,if:goodConditionTurns>=3,do:concentration+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:goodConditionTurns>=6,do:goodConditionTurns+=6,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:concentration>=12,do:concentration+=4,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:goodConditionTurns>=15,do:setScoreBuff(0.25),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:goodConditionTurnsIncreased,if:goodConditionTurns>=8,do:goodConditionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:concentration>=8,do:concentration+=6,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodConditionTurns>=7,do:goodConditionTurns+=4,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:concentration>=18,do:setScoreBuff(0.25),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_QUARTET = {
  ...SUPPORT_EFFECTS_NIA_PRO_QUARTET,
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:goodConditionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:goodConditionTurns>=6,do:concentration+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:concentration>=10,do:goodConditionTurns+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:goodConditionTurns>=10,do:setScoreBuff(0.25),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:concentration+=2",
    "at:startOfTurn,if:turnsElapsed==3,if:concentration>=8,do:goodConditionTurns+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodConditionTurns>=5,do:concentration+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:concentration>=12,do:setScoreBuff(0.25),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_GALAXY = {
  ...SUPPORT_EFFECTS_NIA_PRO_GALAXY,
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%2==1,do:goodConditionTurns+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:goodConditionTurns>=6,do:concentration+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:goodConditionTurns>=8,do:setScoreBuff(0.15),limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:concentration>=7,do:goodConditionTurns+=3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:cardUsed,if:examCardUsed%2==1,do:concentration+=1",
    "at:startOfTurn,if:turnsElapsed==4,if:concentration>=8,do:goodConditionTurns+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:concentration>=10,do:setScoreBuff(0.15),limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:goodConditionTurns>=3,do:concentration+=3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_MELOBANG = {
  ...SUPPORT_EFFECTS_NIA_PRO_MELOBANG,
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:goodConditionTurnsIncreased,do:concentration+=1",
    "at:startOfTurn,if:turnsElapsed==3,if:goodConditionTurns>=6,do:concentration+=2,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodConditionTurns>=6,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:concentrationIncreased,do:goodConditionTurns+=1",
    "at:startOfTurn,if:turnsElapsed==3,if:concentration>=7,do:goodConditionTurns+=2,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:concentration>=8,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_NIA_MASTER_MUSICORDER = {
  ...SUPPORT_EFFECTS_NIA_PRO_MUSICORDER,
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:goodConditionTurns+=1",
    "at:startOfTurn,if:turnsElapsed==3,if:goodConditionTurns>=5,do:concentration+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodConditionTurns>=6,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,do:examCardUsed+=1",
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:mentalCardUsed,if:examCardUsed%3==2,do:concentration+=1",
    "at:startOfTurn,if:turnsElapsed==3,if:concentration>=7,do:goodConditionTurns+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:concentration>=8,do:setScoreBuff(0.15),limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_LEGEND_FINAL = {
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==2,if:goodConditionTurns>=1,do:goodConditionTurns+=2,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:goodConditionTurns>=8,do:concentration+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:goodConditionTurns>=12,do:concentration+=4,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:goodConditionTurns>=17,do:goodConditionTurns+=6,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [  // TODO
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:goodConditionTurnsIncreased,if:goodConditionTurns>=8,do:goodConditionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:concentration>=8,do:concentration+=6,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:goodConditionTurns>0,do:goodConditionTurns+=4,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn,if:turnsElapsed==1,do:goodImpressionTurns+=8,limit:1",
    "at:startOfTurn,if:turnsElapsed==3,if:goodImpressionTurns>=14,do:goodImpressionTurns+=15,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:goodImpressionTurns>=24,do:setGoodImpressionTurnsEffectBuff(0.5),limit:1",
    "at:startOfTurn,if:turnsElapsed==7,if:goodImpressionTurns>=28,do:goodImpressionTurns*=1.3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn,if:turnsElapsed==2,if:motivation>=3,do:motivation+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==5,if:motivation>=16,do:motivation+=10,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:motivation>=24,do:genki+=8,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn,if:turnsElapsed==0,do:setScoreBuff(0.2),limit:1",
    "at:startOfTurn,if:turnsElapsed==2,if:preservationTimes>=1,target:all,do:g.score+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:strengthTimes>=2,target:all,do:g.score+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:preservationTimes>=2,target:all,do:g.score+=8,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:strengthTimes>=4,target:all,do:g.score+=15,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  preservation: [
    "at:startOfTurn,if:turnsElapsed==0,do:setScoreBuff(0.2),limit:1",
    "at:startOfTurn,if:turnsElapsed==2,if:preservationTimes>=1,target:all,do:g.score+=3,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:strengthTimes>=2,target:all,do:g.score+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:preservationTimes>=2,target:all,do:g.score+=8,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:strengthTimes>=4,target:all,do:g.score+=15,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn,if:turnsElapsed==0,do:setScoreBuff(0.1),limit:1",
    "at:startOfTurn,if:turnsElapsed==2,if:preservationTimes>=1,do:fullPowerCharge+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:fullPowerTimes>=1,target:all,do:g.score+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:preservationTimes>=2,target:all,do:g.score+=8,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:fullPowerTimes>=2,target:all,do:g.score+=15,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
};

const SUPPORT_EFFECTS_HAJIME_LEGEND_MID = {
  goodConditionTurns: [
    "at:startOfTurn,if:turnsElapsed==2,if:goodConditionTurns>=1,do:goodConditionTurns+=1,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:goodConditionTurns>=4,do:goodConditionTurns+=2,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:goodConditionTurns>=9,do:goodConditionTurns+=4,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  concentration: [  // TODO
    "at:startOfTurn,if:turnsElapsed==0,limit:1;at:goodConditionTurnsIncreased,if:goodConditionTurns>=8,do:goodConditionTurns+=2",
    "at:startOfTurn,if:turnsElapsed==4,if:concentration>=8,do:concentration+=6,limit:1",
    "at:startOfTurn,if:turnsElapsed==8,if:goodConditionTurns>0,do:goodConditionTurns+=4,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  goodImpressionTurns: [
    "at:startOfTurn,if:turnsElapsed==2,if:goodImpressionTurns>=1,do:goodImpressionTurns+=10,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:goodImpressionTurns>=15,do:goodImpressionTurns*=1.3,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  motivation: [
    "at:startOfTurn,if:turnsElapsed==2,if:motivation>=3,do:motivation+=2,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:genki>=7,do:motivation+=4,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:motivation>=13,do:genki+=7,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  strength: [
    "at:startOfTurn,if:turnsElapsed==0,do:setScoreBuff(0.2),limit:1",
    "at:startOfTurn,if:turnsElapsed==2,if:strengthTimes>=1,target:all,do:g.score+=2,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:preservationTimes>=2,target:all,do:g.score+=4,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:strengthTimes>=2,target:all,do:g.score+=7,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  preservation: [
    "at:startOfTurn,if:turnsElapsed==0,do:setScoreBuff(0.2),limit:1",
    "at:startOfTurn,if:turnsElapsed==2,if:strengthTimes>=1,target:all,do:g.score+=2,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:preservationTimes>=2,target:all,do:g.score+=4,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:strengthTimes>=2,target:all,do:g.score+=7,limit:1",
  ].map(deserializeEffectSequence).flat().map(addSupportEffectSource),
  fullPower: [
    "at:startOfTurn,if:turnsElapsed==0,do:setScoreBuff(0.2),limit:1",
    "at:startOfTurn,if:turnsElapsed==2,if:cumulativeFullPowerCharge>=5,target:all,do:g.score+=4,limit:1",
    "at:startOfTurn,if:turnsElapsed==4,if:preservationTimes>=2,do:fullPowerCharge+=5,limit:1",
    "at:startOfTurn,if:turnsElapsed==6,if:fullPowerTimes>=1,target:all,do:g.score+=7,limit:1",
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
    examStage.effects = SUPPORT_EFFECTS_BY_SEASON_STAGE_EFFECT[stage.season][stage.stage][pIdol.recommendedEffect];
    if (stage.season < 4) { // Hajime
      const criteria = CRITERIA_HAJIME_BY_IDOL[pIdol.idolId];
      examStage.criteria = { vocal: criteria[0], dance: criteria[1], visual: criteria[2] };
      const turnCounts = TURN_COUNTS_HAJIME_BY_TERM_PLAN_IDOL[stage.stage][pIdol.plan == "logic" ? "logic" : "other"][pIdol.idolId];
      examStage.turnCounts = { vocal: turnCounts[0], dance: turnCounts[1], visual: turnCounts[2] };
      const firstTurns = FIRST_TURNS_HAJIME_BY_TERM_IDOL[stage.stage][pIdol.idolId];
      examStage.firstTurns = { vocal: firstTurns[0], dance: firstTurns[1], visual: firstTurns[2] };
    } else { // NIA and later
      const criteria = CRITERIA_NIA_BY_IDOL[pIdol.idolId];
      examStage.criteria = { vocal: criteria[0], dance: criteria[1], visual: criteria[2] };
      const firstTurns = FIRST_TURNS_NIA_BY_TERM_IDOL[stage.stage == 1 ? 1 : 2][pIdol.idolId];
      examStage.firstTurns = { vocal: firstTurns[0], dance: firstTurns[1], visual: firstTurns[2] };
      if (stage.season < 7) { // NIA
        const turnCounts = TURN_COUNTS_NIA_BY_TERM_IDOL[stage.stage == 1 ? 1 : 2][pIdol.idolId];
        examStage.turnCounts = { vocal: turnCounts[0], dance: turnCounts[1], visual: turnCounts[2] };
      } else { // Hajime Legend
        const turnCounts = TURN_COUNTS_HAJIME_LEGEND_BY_TERM_IDOL[stage.stage][pIdol.idolId];
        examStage.turnCounts = { vocal: turnCounts[0], dance: turnCounts[1], visual: turnCounts[2] };
      }
    }
    console.log("examStage:", examStage);
    return examStage;
  } else {
    return stage;
  }
}
