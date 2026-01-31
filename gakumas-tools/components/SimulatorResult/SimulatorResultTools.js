import { useContext } from "react";
import { useTranslations } from "next-intl";
import { FaDownload } from "react-icons/fa6";
import { GrOptimize } from "react-icons/gr";
import { S } from "gakumas-engine";
import LoadoutContext from "@/contexts/LoadoutContext";
import ParameterEstimatorContext from "@/contexts/ParameterEstimatorContext";
import Button from "@/components/Button";
import { useRouter } from "@/i18n/routing";
import { calculateTypeMultipliers, calculateTurnTypes } from "@/utils/estimator";
import styles from "./SimulatorResult.module.scss";

export default function SimulatorResultTools({ data }) {
  const t = useTranslations("SimulatorResultTools");
  const router = useRouter();
  const {
    loadout,
    stage,
  } = useContext(LoadoutContext);
  const {
    setSupportBonus,
    setTotalParams,
    setExtraTurns,
    setScores,
  } = useContext(ParameterEstimatorContext);

  function downloadScores() {
    let csvData = data.scores.toSorted((a, b) => a - b).join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulator_scores.csv";
    a.click();
  }

  function estimateParameters() {
    const totalParams = loadout.params[0] + loadout.params[1] + loadout.params[2];
    const averageScores = data.graphData[S.score];
    const scoreDiffs = new Array(averageScores.length - 1);
    const stageTurns = stage.turnCounts.vocal + stage.turnCounts.dance + stage.turnCounts.visual;
    const extraTurns = scoreDiffs.length - stageTurns;
    const turnTypes = calculateTurnTypes(stage, extraTurns);
    const typeMultipliers = calculateTypeMultipliers({
      vocal: loadout.params[0],
      dance: loadout.params[1],
      visual: loadout.params[2],
    }, stage, loadout.supportBonus);
    for (let i = 0; i + 1 < averageScores.length; i++) {
      const multiplier = 
        turnTypes[i].vocal * typeMultipliers.vocal +
        turnTypes[i].dance * typeMultipliers.dance +
        turnTypes[i].visual * typeMultipliers.visual;
      scoreDiffs[i] = parseFloat(((averageScores[i + 1] - averageScores[i]) / multiplier).toFixed(2));
    }
    console.log("estimateParameters averageScores scoreDiffs", averageScores, scoreDiffs);
    console.log("estimateParameters turnTypes typeMultipliers", turnTypes, typeMultipliers);
    setSupportBonus(() => loadout.supportBonus);
    setTotalParams(() => totalParams);
    setExtraTurns(() => extraTurns);
    setScores(() => scoreDiffs);
    router.push("/estimator");
  }

  return (
    <div className={styles.tools}>
      <Button style="blue" onClick={downloadScores}>
        <FaDownload /> {t("downloadScores")}
      </Button>
      <Button style="blue" onClick={estimateParameters}>
        <GrOptimize /> {t("estimateParameters")}
      </Button>
    </div>
  );
}
