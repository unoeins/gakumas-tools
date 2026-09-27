import { memo, useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AiOutlineAreaChart,
  AiOutlineBarChart,
  AiOutlineBoxPlot,
  AiOutlineTool,
} from "react-icons/ai";
import ButtonGroup from "@/components/ButtonGroup";
import { AreaPlot, BoxPlot, DistributionPlot } from "@/components/Charts";
import SimulatorResultTools from "./SimulatorResultTools";
import c from "@/utils/classNames";
import styles from "./SimulatorResult.module.scss";

const HISTOGRAM = <AiOutlineBarChart />;
const BOXPLOT = <AiOutlineBoxPlot />;
const AREA = <AiOutlineAreaChart />;
const TOOL = <AiOutlineTool />;

function SimulatorResultGraphs({ data, plan }) {
  const t = useTranslations("SimulatorResultGraphs");

  const [graphType, setGraphTypeState] = useState("histogram");
  const [switched, setSwitched] = useState(false);
  const setGraphType = useCallback((value) => {
    setGraphTypeState(value);
    setSwitched(true);
  }, []);
  const label = `${t("score")} (n=${data.scores.length})`;
  const boxPlotLabels = useMemo(() => [label], [label]);
  const boxPlotData = useMemo(
    () => [{ label, data: [data.scores] }],
    [label, data.scores]
  );

  return (
    <div>
      <div data-export-hide="true">
        <ButtonGroup
          className={styles.graphSelect}
          options={[
            { value: "histogram", label: HISTOGRAM },
            { value: "boxplot", label: BOXPLOT },
            { value: "area", label: AREA },
            { value: "tool", label: TOOL },
        ]}
          selected={graphType}
          onChange={setGraphType}
        />
      </div>
      <div key={graphType} className={c(switched && styles.graphPanelEnter)}>
        {graphType == "histogram" && (
          <DistributionPlot
            label={label}
            data={data.bucketedScores}
            bucketSize={data.bucketSize}
            highlight={data.medianScore}
          />
        )}
        {graphType == "boxplot" && (
          <BoxPlot
            labels={boxPlotLabels}
            data={boxPlotData}
            showXAxis={false}
          />
        )}
        {graphType == "area" && (
          <AreaPlot data={data.graphData} plan={plan} />
        )}
        {graphType == "tool" && (
          <SimulatorResultTools data={data} />
        )}
      </div>
    </div>
  );
}

export default memo(SimulatorResultGraphs);
