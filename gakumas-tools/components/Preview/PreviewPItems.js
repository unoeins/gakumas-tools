import { PItems } from "gakumas-data";
import gkImg from "gakumas-images";
import { formatStageShortName } from "@/utils/stages";
import { iconSrc } from "./iconSrc";
import PreviewIcon from "./PreviewIcon";
import styles, { ITEM_SIZE } from "./Preview.styles";

export default function PreviewPItems({ itemIds, imageMap, stage }) {
  return (
    <div style={styles.row}>
      {itemIds
        .slice(0, 8)
        .map(PItems.getById)
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
