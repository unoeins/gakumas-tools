import { PDrinks } from "gakumas-data";
import gkImg from "gakumas-images";
import { formatStageShortName } from "@/utils/stages";
import { iconSrc } from "./iconSrc";
import styles from "./Preview.styles";

export default function PreviewPDrinks({ drinkIds, imageMap, stage }) {
  return (
    <div style={styles.row}>
      {drinkIds
        .slice(0, 4)
        .map(PDrinks.getById)
        .map((item, index) => {
          const icon = item && gkImg(item).icon;
          const src = iconSrc(icon, imageMap);
          return (
            <div key={index} style={styles.item}>
              {src && <img src={src} width={48} height={48} />}
            </div>
          );
        })}
      {stage && (
        <div style={styles.url}>
          {formatStageShortName(stage, null)}
        </div>
      )}
    </div>
  );
}
