import { memo } from "react";
import { useTranslations } from "next-intl";
import { S } from "gakumas-engine/constants";
import c from "@/utils/classNames";
import styles from "./StateViewer.module.scss";

function StateViewer({ state, idolId, plan }) {
  const t = useTranslations("ContestPlayer");

  const COMMON_FIELDS = [
    {name: "score", type: "number"},
    {name: "stamina", type: "number"},
    {name: "genki", type: "number"},
  ];

  const SENSE_FIELDS = [
    {name: "goodConditionTurns", type: "number"},
    {name: "perfectConditionTurns", type: "number"},
    {name: "concentration", type: "number"},
    {name: "goodConditionTurnsBuffs", type: "buffs"},
    {name: "concentrationBuffs", type: "buffs"},
  ];

  const LOGIC_FIELDS = [
    {name: "goodImpressionTurns", type: "number"},
    {name: "motivation", type: "number"},
    {name: "prideTurns", type: "number"},
    {name: "goodImpressionTurnsBuffs", type: "buffs"},
    {name: "goodImpressionTurnsEffectBuffs", type: "buffs"},
    {name: "motivationBuffs", type: "buffs"},
  ];

  const ANOMALY_FIELDS = [
    {name: "stance", type: "string"},
    {name: "fullPowerCharge", type: "number"},
    {name: "fullPowerChargeBuffs", type: "buffs"},
    {name: "enthusiasm", type: "number"},
    {name: "enthusiasmBonus", type: "number"},
    {name: "enthusiasmBuffs", type: "buffs"},
    {name: "lockStanceTurns", type: "number", style: "debuff"},
  ];
  
  const EXTRA_FIELDS = [
    {name: "scoreBuffs", type: "buffs"},
    {name: "scoreDebuffs", type: "buffs", style: "debuff"},
    {name: "halfCostTurns", type: "number"},
    {name: "doubleCostTurns", type: "number", style: "debuff"},
    {name: "costReduction", type: "number"},
    {name: "costIncrease", type: "number", style: "debuff"},
    {name: "doubleCardEffectCards", type: "number"},
    {name: "nullifyGenkiTurns", type: "number", style: "debuff"},
    {name: "nullifyDebuff", type: "number"},
    {name: "poorConditionTurns", type: "number", style: "debuff"},
    {name: "nullifyCostCards", type: "number"},
    {name: "nullifyCostActiveCards", type: "number"},
    {name: "nullifyCostMentalCards", type: "number"},
    {name: "cardUsesRemaining", type: "number"},
    {name: "noActiveTurns", type: "number", style: "debuff"},
    {name: "noMentalTurns", type: "number", style: "debuff"},
    {name: "uneaseTurns", type: "number", style: "debuff"},
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

  const viewFields = fieldsByPlan.filter((field) => {
    if (REQUIRED_FIELDS.includes(field.name)) return true;
    if (state[S[field.name]] == null) return false;
    if (field.type === "number") {
      return state[S[field.name]] !== 0;
    } else if (field.type === "buffs") {
      return state[S[field.name]].length > 0;
    } else if (field.type === "string") {
      return state[S[field.name]] !== "";
    } else {
      console.error("Unknown field type:", field.type);
      return false;
    }
  });
  const viewValues = viewFields.map((field) => {
    if (field.type === "number") {
      return String(state[S[field.name]]);
    } else if (field.type === "string") {
      return t(state[S[field.name]]);
    } else if (field.type === "buffs") {
      const buffs = state[S[field.name]].reduce((acc, cur) => {
        const existingBuff = acc.find((buff) => 
          (buff.amount === cur.amount && buff.turns === cur.turns)
        );
        if (existingBuff) {
          existingBuff.count += 1;
        } else {
          acc.push({ amount: cur.amount, turns: cur.turns, count: 1 });
        }
        return acc;
      }, []);
      return buffs.map(({ amount, turns, count }) => (
        <div key={`${amount}-${turns}-${count}`}>
          {`${Math.round(amount * 100 * count)}%` + (turns ? ` (${t("numTurns", { num: turns })})` : "")}
        </div>
      ));
    } else {
      console.error("Unknown field type:", field.type);
      return state[S[field.name]];
    }
  });

  return (
    <div className={styles.stateViewer}>
      {viewFields.map((field, i) => (
        <div key={field.name} className={styles.field}>
          <div className={styles.fieldName}>{t(field.name)}</div>
          <div className={c(styles.fieldValue, field.style)}>
            {viewValues[i]}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(StateViewer);
