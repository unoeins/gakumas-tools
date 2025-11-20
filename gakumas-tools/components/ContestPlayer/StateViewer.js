import { memo } from "react";
import { useTranslations } from "next-intl";
import { S } from "gakumas-engine/constants";
import TurnTypeIcon from "@/components/TurnTypeOrder/TurnTypeIcon";
import c from "@/utils/classNames";
import styles from "./ContestPlayer.module.scss";

function StateViewer({ state, idolId, plan }) {
  const t = useTranslations("ContestPlayer");

  // const COMMON_FIELDS = [
  //   S.score,
  //   S.stamina,
  //   S.genki,
  // ];

  // const SENSE_FIELDS = [
  //   S.goodConditionTurns,
  //   S.perfectConditionTurns,
  //   S.concentration,

  // ];

  // const LOGIC_FIELDS = [
  //   S.goodImpressionTurns,
  //   S.motivation,
  //   S.prideTurns,
  // ];

  // const ANOMALY_FIELDS = [
  //   S.stance,
  //   S.fullPowerCharge,
  //   S.enthusiasm,
  //   S.enthusiasmBonus,
  //   S.enthusiasmMultiplier,
  //   S.lockStanceTurns,
  // ];
  
  // const EXTRA_FIELDS = [
  //   S.halfCostTurns,
  //   S.doubleCostTurns,
  //   S.costReduction,
  //   S.costIncrease,
  //   S.doubleCardEffectCards,
  //   S.nullifyGenkiTurns,
  //   S.nullifyDebuff,
  //   S.poorConditionTurns,
  //   S.nullifyCostCards,
  //   S.cardUsesRemaining,
  //   S.noActiveTurns,
  //   S.noMentalTurns,
  //   S.uneaseTurns,
  // ];

  const COMMON_FIELDS = [
    "score",
    "stamina",
    "genki",
  ];

  const SENSE_FIELDS = [
    "goodConditionTurns",
    "perfectConditionTurns",
    "concentration",

  ];

  const LOGIC_FIELDS = [
    "goodImpressionTurns",
    "motivation",
    "prideTurns",
  ];

  const ANOMALY_FIELDS = [
    "stance",
    "fullPowerCharge",
    "enthusiasm",
    "enthusiasmBonus",
    "enthusiasmMultiplier",
    "lockStanceTurns",
  ];
  
  const EXTRA_FIELDS = [
    "halfCostTurns",
    "doubleCostTurns",
    "costReduction",
    "costIncrease",
    "doubleCardEffectCards",
    "nullifyGenkiTurns",
    "nullifyDebuff",
    "poorConditionTurns",
    "nullifyCostCards",
    "cardUsesRemaining",
    "noActiveTurns",
    "noMentalTurns",
    "uneaseTurns",
  ];

  const REQUIRED_FIELDS = [
    "score",
    "stamina",
  ];

  const fieldsByPlan = 
    plan === "sense" ? [...COMMON_FIELDS, ...SENSE_FIELDS, ...EXTRA_FIELDS] : 
    plan === "logic" ? [...COMMON_FIELDS, ...LOGIC_FIELDS, ...EXTRA_FIELDS] : 
    plan === "anomaly" ? [...COMMON_FIELDS, ...ANOMALY_FIELDS, ...EXTRA_FIELDS] : 
    [];

  const viewFields = fieldsByPlan.filter((field) => 
    REQUIRED_FIELDS.includes(field) || 
    (state[S[field]] != null && state[S[field]] !== 0));

  const TEXT_FIELDS = [
    "stance",
  ]

  const turnTypes = Array.from({ length: state[S.turnsElapsed] + state[S.turnsRemaining] },
    (_, i) => state[S.turnTypes][Math.min(i, state[S.turnTypes].length - 1)]
  ); 

  return (
    <div className={styles.stateViewer}>
      <div className={styles.turnViewer}>
        {turnTypes.map((turnType, i) => (
          <TurnTypeIcon
            key={i}
            turnType={i >= state[S.turnsElapsed] ? turnType : "elapsed"}
            label={i + 1}
            size="fill"
          />
        ))}
        {/* <div className={styles.currentTurn}>({t("numTurns", { num: state[S.turnsElapsed] + 1 })})</div> */}
      </div>
      <div className={styles.fieldViewer}>
        {viewFields.map((field) => (
          <div key={field} className={styles.field}>
            <div className={styles.fieldName}>{t(field)}: </div>
            <div className={styles.fieldValue}>
              {TEXT_FIELDS.includes(field) ? t(state[S[field]]) : String(state[S[field]])}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(StateViewer);
