import { memo, useState } from "react";
import { useTranslations } from "next-intl";
import ButtonGroup from "@/components/ButtonGroup";
import SimulatorLogs from "@/components/SimulatorLogs";
import SimulatorResultGraphs from "./SimulatorResultGraphs";
import SimulatorUseStats from "@/components/SimulatorUseStats";
import SimulatorConditionalUseStats from "@/components/SimulatorConditionalUseStats";
import SimulatorPriorityStats from "@/components/SimulatorPriorityStats";
import SimulatorScoreStats from "@/components/SimulatorScoreStats";
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
  if (listenerData && listenerData["ScoreStats"]) {
    options.push({value: "scoreStats", label: t("scoreStats")});
  }
  const OPTIONS = options;

  const [activeLogType, setActiveLogType] = useState("logs");

  const hasListenerData = listenerData && Object.keys(listenerData).length > 0;

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
          {activeLogType == "useStats" && listenerData["UseStats"] && (
            <SimulatorUseStats
              useStats={listenerData["UseStats"]}
              idolId={idolId}
            />
          )}
          {activeLogType == "conditionalUseStats" && listenerData["ConditionalUseStats"] && (
            <SimulatorConditionalUseStats
              conditionalUseStats={listenerData["ConditionalUseStats"]}
              idolId={idolId}
            />
          )}
          {activeLogType == "priorityStats" && listenerData["PriorityStats"] && (
            <SimulatorPriorityStats
              priorityStats={listenerData["PriorityStats"]}
              idolId={idolId}
            />
          )}
          {activeLogType == "scoreStats" && listenerData["ScoreStats"] && (
            <SimulatorScoreStats
              scoreStats={listenerData["ScoreStats"]}
              idolId={idolId}
            />
          )}
        </>
      )}

      {/* <KofiAd /> */}
    </div>
  );
}

export default memo(SimulatorResult);
