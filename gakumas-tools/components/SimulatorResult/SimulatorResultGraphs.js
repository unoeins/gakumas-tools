import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AiOutlineAreaChart,
  AiOutlineBarChart,
  AiOutlineBoxPlot,
  AiOutlineTool,
} from "react-icons/ai";
import AreaPlot from "@/components/AreaPlot";
import BoxPlot from "@/components/BoxPlot";
import ButtonGroup from "@/components/ButtonGroup";
import DistributionPlot from "@/components/DistributionPlot";
import SimulatorResultTools from "./SimulatorResultTools";
import styles from "./SimulatorResult.module.scss";

const HISTOGRAM = <AiOutlineBarChart />;
const BOXPLOT = <AiOutlineBoxPlot />;
const AREA = <AiOutlineAreaChart />;
const TOOL = <AiOutlineTool />;

export default function SimulatorResultGraphs({ data, plan }) {
  const t = useTranslations("SimulatorResultGraphs");

  const [graphType, setGraphType] = useState("histogram");
  const label = `${t("score")} (n=${data.scores.length})`;

  return (
    <div>
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
      {graphType == "histogram" && (
        <DistributionPlot
          label={label}
          data={data.bucketedScores}
          bucketSize={data.bucketSize}
        />
      )}
      {graphType == "boxplot" && (
        <BoxPlot
          labels={[label]}
          data={[{ label, data: [data.scores] }]}
          showXAxis={false}
        />
      )}
      {graphType == "area" && <AreaPlot data={data.graphData} plan={plan} />}
      {graphType == "tool" && (
        <SimulatorResultTools data={data} />
      )}
    </div>
  );
}
