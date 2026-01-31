import { memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import Input from "@/components/Input";
import styles from "./ParameterEstimator.module.scss";

const MIN = 0;
const MAX = 10000000;

function ScoresInput({
  scores,
  onChange,
  max = MAX,
}) {

  function handleChange(value, index) {
    let next = [...scores];
    next[index] = value;
    onChange(next);
  }

  return (
    <div className={styles.scoresInput}>
      {scores.map((score, i) => (
        <div key={i} className={styles.scoreInputWrapper}>
          <Input
            key={i}
            type="number"
            name={i+1}
            placeholder={i+1}
            round={false}
            min={MIN}
            max={max}
            step={0.01}
            value={parseFloat((score || 0).toFixed(2))}
            onChange={(val) => handleChange(parseFloat((val || 0).toFixed(2)), i)}
          />
          <div className={styles.scoreInputLabel}>{i + 1}</div>
        </div>
      ))}
    </div>
  );
}

export default memo(ScoresInput);
