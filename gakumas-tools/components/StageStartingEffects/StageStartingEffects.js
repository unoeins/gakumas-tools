import { memo, use } from "react";
import { useTranslations } from "next-intl";
import { STARTING_EFFECTS } from "gakumas-engine/constants";
import Input from "@/components/Input";
import styles from "./StageStartingEffects.module.scss";

function StageStartingEffects({ startingEffects, replaceStartingEffect, plan }) {
  const t = useTranslations("StageStartingEffects");
  const targetPlan = ["free", plan];
  let effects = [];
  for (let i = 0; i < startingEffects.length; i++) {
    if (targetPlan.includes(STARTING_EFFECTS[i].plan)) {
      effects.push({
        ...STARTING_EFFECTS[i],
        index: i,
        value: startingEffects[i]
      });
    }
  }

  return (
    <>
      <label>{t("startingEffects")}</label>
      <div className={styles.stageStartingEffects}>
        {effects.map((effect) => (
          <div className={styles.stageStartingEffect} key={effect.index}>
            <label>{t(effect.name)}</label>
            <div className={styles.startingEffectInput}>
              <Input
                type="number"
                round="true"
                min={0}
                max={999}
                value={effect.value}
                onChange={(value) =>
                  replaceStartingEffect(effect.index, value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default memo(StageStartingEffects);
