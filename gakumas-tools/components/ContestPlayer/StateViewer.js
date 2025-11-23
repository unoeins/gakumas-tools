import { memo } from "react";
import { useTranslations } from "next-intl";
import { S } from "gakumas-engine/constants";
import c from "@/utils/classNames";
import styles from "./ContestPlayer.module.scss";

function StateViewer({ state, idolId, plan }) {
  const t = useTranslations("ContestPlayer");

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

  return (
    <div className={styles.stateViewer}>
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
