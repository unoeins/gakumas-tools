import { memo } from "react";
import gkImg from "gakumas-images";
import Image from "@/components/Image";
import c from "@/utils/classNames";
import { ENTITY_DATA_BY_TYPE, EntityTypes } from "@/utils/entities";
import { useDrag, useDrop } from "@/utils/safeDnd";
import CustomizationCounts from "./CustomizationCounts";
import Indications from "./Indications";
import TierIndicator from "./TierIndicator";
import styles from "./EntityIcon.module.scss";

function EntityIcon({
  type,
  id,
  index,
  customizations,
  indications,
  idolId,
  size = "large",
  onClick,
  onSwap,
  showTier,
  label,
  argumentType = "entity",
}) {
  const entity = ENTITY_DATA_BY_TYPE[type].getById(id);
  const { icon } = gkImg(entity, idolId);

  const [{ isDragging }, dragRef] = useDrag({
    type: "ENTITY_ICON",
    item: { type, id, index },
  });

  const [, dropRef] = useDrop({
    accept: "ENTITY_ICON",
    drop: (item) => {
      if (item.type != type) {
        return;
      }
      if (onSwap) {
        onSwap(item.index, index);
      }
    },
  });

  let unwrappedElement = null;
  if (entity) {
    unwrappedElement = (
      <>
        <Image
          src={icon}
          alt={entity.name}
          title={entity.name}
          fill
          sizes="64px"
          draggable={false}
        />
        {showTier && type == EntityTypes.SKILL_CARD && (
          <TierIndicator skillCard={entity} />
        )}
        {!!customizations && (
          <CustomizationCounts customizations={customizations} />
        )}
        {!!indications && <Indications indications={indications} />}
      </>
    );
  } else if(label) {
    unwrappedElement = (<span className={styles.label}>{label}</span>);
  }

  const className = c(
    styles.entityIcon,
    styles[size],
    indications?.duplicate && styles.duplicate
  );

  if (onClick) {
    const onClickHandler = argumentType === "entity" ? 
      () => onClick(entity || {}) : () => onClick(id, customizations);
    return (
        <button ref={dragRef} className={className} onClick={onClickHandler}>
          <div ref={dropRef} className={styles.dropArea}>
            {unwrappedElement}
          </div>
      </button>
    );
  } else {
    return <div className={className}>{unwrappedElement}</div>;
  }
}

export default memo(EntityIcon);
