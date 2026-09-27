import { PDrinks } from "gakumas-data";
import gkImg from "gakumas-images";
import { formatStageShortName } from "@/utils/stages";
import { iconSrc } from "./iconSrc";
import PreviewIcon from "./PreviewIcon";
import styles, { ITEM_SIZE } from "./Preview.styles";

export default function PreviewPDrinks({ drinkIds, imageMap, stage }) {
  return (
    <div style={styles.row}>
      {drinkIds
        .slice(0, 4)
        .map(PDrinks.getById)
        .map((item, index) => (
          <PreviewIcon
            key={index}
            src={item && iconSrc(gkImg(item).icon, imageMap)}
            size={ITEM_SIZE}
          />
        ))}
      {stage && (
        <div style={styles.stage}>
          {formatStageShortName(stage, null)}
        </div>
      )}
    </div>
  );
}
