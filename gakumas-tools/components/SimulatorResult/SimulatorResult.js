import { memo, useState } from "react";
import { useTranslations } from "next-intl";
import { FaDownload } from "react-icons/fa6";
import Button from "@/components/Button";
import ButtonGroup from "@/components/ButtonGroup";
import SimulatorLogs from "@/components/SimulatorLogs";
import SimulatorResultGraphs from "./SimulatorResultGraphs";
import SimulatorUseStats from "@/components/SimulatorUseStats";
import SimulatorConditionalUseStats from "@/components/SimulatorConditionalUseStats";
import SimulatorPriorityStats from "@/components/SimulatorPriorityStats";
import styles from "./SimulatorResult.module.scss";
import KofiAd from "../KofiAd";

function SimulatorResult({ data, listenerData, idolId, plan }) {
  const t = useTranslations("SimulatorResult");

  let options = [];
  options.push({value: "logs", label: t("logs")});
  if (listenerData && listenerData["UseStats"]) {
    options.push({value: "useStats", label: t("useStats")});
  }
  if (listenerData && listenerData["ConditionalUseStats"]) {
    options.push({value: "conditionalUseStats", label: t("conditionalUseStats")});
  }
  if (listenerData && listenerData["PriorityStats"]) {
    options.push({value: "priorityStats", label: t("priorityStats")});
  }
  const OPTIONS = options;

  const [activeLogType, setActiveLogType] = useState("logs");

  const hasListenerData = listenerData && Object.keys(listenerData).length > 0;

  function download() {
    let csvData = data.scores.toSorted((a, b) => a - b).join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulator_scores.csv";
    a.click();
  }

  return (
    <div id="simulator_result" className={styles.result}>
      <table className={styles.stats}>
        <thead>
          <tr>
            <th>{t("min")}</th>
            <th>{t("average")}</th>
            <th>{t("median")}</th>
            <th>{t("max")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.minRun.score}</td>
            <td>{data.averageScore}</td>
            <td>{data.medianScore}</td>
            <td>{data.maxRun.score}</td>
          </tr>
        </tbody>
      </table>

      <SimulatorResultGraphs data={data} plan={plan} />

      {data.scores && (
        <Button style="blue" onClick={download}>
          <FaDownload /> {t("downloadScores")}
        </Button>
      )}

      {!hasListenerData && (
        <>
          <label>{t("logs")}</label>
          <SimulatorLogs
            minRun={data.minRun}
            averageRun={data.averageRun}
            maxRun={data.maxRun}
            idolId={idolId}
          />
        </>
      )}

      {hasListenerData && (
        <>
          <ButtonGroup
            selected={activeLogType}
            options={OPTIONS}
            onChange={(value) => setActiveLogType(value == activeLogType ? null : value)}
          />

          {activeLogType == "logs" && (
            <>
              <label>{t("logs")}</label>
              <SimulatorLogs
                minRun={data.minRun}
                averageRun={data.averageRun}
                maxRun={data.maxRun}
                idolId={idolId}
              />
            </>
          )}
          {activeLogType == "useStats" && (
            <SimulatorUseStats
              useStats={listenerData["UseStats"]}
              idolId={idolId}
            />
          )}
          {activeLogType == "conditionalUseStats" && (
            <SimulatorConditionalUseStats
              conditionalUseStats={listenerData["ConditionalUseStats"]}
              idolId={idolId}
            />
          )}
          {activeLogType == "priorityStats" && (
            <SimulatorPriorityStats
              priorityStats={listenerData["PriorityStats"]}
              idolId={idolId}
            />
          )}
        </>
      )}

      <KofiAd />
    </div>
  );
}

export default memo(SimulatorResult);
