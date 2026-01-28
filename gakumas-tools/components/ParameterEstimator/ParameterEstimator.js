"use client";
import { memo, useContext, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FaTrophy } from "react-icons/fa6";
import StageSelect from "@/components/StageSelect";
import Input from "@/components/Input";
import ParametersInput from "@/components/ParametersInput";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import ScoresInput from "./ScoresInput";
import ParameterEstimatorContext from "@/contexts/ParameterEstimatorContext";
import LoadoutContext from "@/contexts/LoadoutContext";
import { useRouter } from "@/i18n/routing";
import { calculateTypeMultipliers, calculateTurnTypes } from "@/utils/estimator";
import styles from "./ParameterEstimator.module.scss";

function ParameterEstimator() {
  const t = useTranslations("ParameterEstimator");
  const router = useRouter();
  const {
    stage,
    setParams,
  } = useContext(LoadoutContext);
  const {
    supportBonus,
    setSupportBonus,
    totalParams,
    setTotalParams,
    maxParams,
    setMaxParams,
    minParams,
    setMinParams,
    extraTurns,
    setExtraTurns,
    scores,
    setScores,
    estimatedParams,
    setEstimatedParams,
    estimatedScore,
    setEstimatedScore,
  } = useContext(ParameterEstimatorContext);
  const [running, setRunning] = useState(false);

  const turnTypes = useMemo(() => {
    return calculateTurnTypes(stage, extraTurns);
  }, [stage, extraTurns]);

  const estimatedMultipliers = useMemo(() => {
    if (!estimatedParams) return null;
    return calculateTypeMultipliers({
      vocal: estimatedParams[0],
      dance: estimatedParams[1],
      visual: estimatedParams[2],
    }, stage, supportBonus);
  }, [estimatedParams]);

  useEffect(() => {
    const totalTurns = stage.turnCounts.vocal + stage.turnCounts.dance + stage.turnCounts.visual + extraTurns;
    if (scores.length !== totalTurns) {
      setScores((cur) => {
        let next = [...cur];
        if (next.length > totalTurns) {
          next.length = totalTurns;
        } else {
          next = next.concat(new Array(totalTurns - next.length).fill(0));
        }
        return next;
      });
    }
  }, [stage, extraTurns]);

  const DIRECTIONS_100 = [
    [100, -100, 0],
    [100, 0, -100],
    [0, 100, -100],
    [-100, 100, 0],
    [-100, 0, 100],
    [0, -100, 100],
  ];
  const DIRECTIONS_10 = DIRECTIONS_100.map(dir => dir.map(v => v / 10));
  const DIRECTIONS_1 = DIRECTIONS_100.map(dir => dir.map(v => v / 100));

  function calculateScore(params) {
    const { vocal, dance, visual } = calculateTypeMultipliers(params, stage, supportBonus);
    let totalScore = 0;
    for (let i = 0; i < scores.length; i++) {
      totalScore += scores[i] * 
         (vocal * turnTypes[i].vocal + 
          dance * turnTypes[i].dance + 
          visual * turnTypes[i].visual);
    }
    return totalScore;
  }

  async function runEstimation() {
    setRunning(true);

    console.time("estimation");

    let params = {
      vocal: minParams[0],
      dance: minParams[1],
      visual: minParams[2],
    };
    let remainingParams = totalParams - (minParams[0] + minParams[1] + minParams[2]);
    if (remainingParams > 0) {
      if (maxParams[0] - params.vocal < remainingParams) {
        remainingParams -= maxParams[0] - params.vocal;
        params.vocal = maxParams[0];
      } else {
        params.vocal += remainingParams;
        remainingParams = 0;
      }
    }
    if (remainingParams > 0) {
      if (maxParams[1] - params.dance < remainingParams) {
        remainingParams -= maxParams[1] - params.dance;
        params.dance = maxParams[1];
      } else {
        params.dance += remainingParams;
        remainingParams = 0;
      }
    }
    if (remainingParams > 0) {
      if (maxParams[2] - params.visual < remainingParams) {
        remainingParams -= maxParams[2] - params.visual;
        params.visual = maxParams[2];
      } else {
        params.visual += remainingParams;
        remainingParams = 0;
      }
    }
    let score = calculateScore(params);

    let stepSizes = [100, 10, 1];
    for (let stepSize of stepSizes) {
      let improved = true;
      while (improved) {
        improved = false;
        for (let direction of (stepSize === 100 ? DIRECTIONS_100 : stepSize === 10 ? DIRECTIONS_10 : DIRECTIONS_1)) {
          let newParams = {
            vocal: params.vocal + direction[0],
            dance: params.dance + direction[1],
            visual: params.visual + direction[2],
          };
          if (newParams.vocal < minParams[0] || newParams.vocal > maxParams[0]) continue;
          if (newParams.dance < minParams[1] || newParams.dance > maxParams[1]) continue;
          if (newParams.visual < minParams[2] || newParams.visual > maxParams[2]) continue;
          let newScore = calculateScore(newParams);
          if (newScore > score) {
            params = newParams;
            score = newScore;
            improved = true;
          }
        }
      }
    }

    console.timeEnd("estimation");
    setRunning(false);
    setEstimatedParams([params.vocal, params.dance, params.visual]);
    setEstimatedScore(score);
  }

  function reflectParametersAndGoToSimulator() {
    setParams((cur) => 
      [estimatedParams[0], estimatedParams[1], estimatedParams[2], cur[3]]);
    router.push("/simulator");
  }

  return (
    <div className={styles.parameterEstimator}>
        <p>{t("note")}</p>

        <StageSelect />
        {stage.type === "contest" ? (
          <div className={styles.supportBonusInput}>
            <label>{t("supportBonus")}</label>
            <Input
              type="number"
              value={parseFloat(
                ((supportBonus || 0) * 100).toFixed(2)
              )}
              onChange={(value) =>
                setSupportBonus(parseFloat((value / 100).toFixed(4)))
              }
            />
          </div>
        ) : t("notContestWarning")}

        <div className={styles.totalParamsInput}>
          <label>{t("totalParams")}</label>
          <Input
            type="number"
            value={totalParams}
            min={0}
            max={10000}
            onChange={(value) =>
              setTotalParams(value)
            }
          />
        </div>

        <label>{t("maxParams")}</label>
        <div className={styles.maxParams}>
          <ParametersInput
            parameters={maxParams}
            onChange={setMaxParams}
            withStamina={false}
            max={10000}
          />
        </div>

        <label>{t("minParams")}</label>
        <div className={styles.minParams}>
          <ParametersInput
            parameters={minParams}
            onChange={setMinParams}
            withStamina={false}
            max={10000}
          />
        </div>

        <div className={styles.extraTurnsInput}>
          <label>{t("extraTurns")}</label>
          <Input
            type="number"
            value={extraTurns}
            min={0}
            max={10}
            onChange={(value) =>
              setExtraTurns(value)
            }
          />
        </div>

        <label>{t("scores")}</label>
        <ScoresInput
          scores={scores}
          stage={stage}
          onChange={setScores}
          max={10000000}
        />

        <Button style="blue" onClick={runEstimation} disabled={running}>
          {running ? <Loader /> : `${t("estimate")}`}
        </Button>

      {estimatedScore !== null && (
        <>
          <label>{t("estimatedParams")}</label>
          <div className={styles.parameters}>
            <div className={styles.parameter}>{Math.round(estimatedParams[0])}</div>
            <div className={styles.parameter}>{Math.round(estimatedParams[1])}</div>
            <div className={styles.parameter}>{Math.round(estimatedParams[2])}</div>
          </div>
          <div className={styles.typeMultipliers}>
            <div className={styles.typeMultiplier}>{Math.round(estimatedMultipliers.vocal * 100)}%</div>
            <div className={styles.typeMultiplier}>{Math.round(estimatedMultipliers.dance * 100)}%</div>
            <div className={styles.typeMultiplier}>{Math.round(estimatedMultipliers.visual * 100)}%</div>
          </div>
          <div className={styles.estimatedScore}>
            <label>{t("estimatedScore")}</label>
            <div className={styles.estimatedScoreValue}>{Math.round(estimatedScore)}</div>
          </div>
          <Button style="blue" onClick={reflectParametersAndGoToSimulator}>
            <FaTrophy /> {t("reflectParametersAndGoToSimulator")}
          </Button>
        </>
      )}
    </div>
  );
}

export default memo(ParameterEstimator);
