import PreviewPItems from "./PreviewPItems";
import PreviewSkillCardGroup from "./PreviewSkillCardGroup";
import PreviewPDrinks from "./PreviewPDrinks";
import styles from "./Preview.styles";

export default function Preview({
  stage,
  itemIds,
  skillCardIdGroups,
  customizationGroups,
  drinkIds,
  idolId,
  isEmpty,
  imageMap,
}) {
  return stage?.type !== "exam" ? (
    <div style={styles.preview}>
      <PreviewPItems itemIds={itemIds.slice(0, 4)} imageMap={imageMap} stage={stage} />
      {skillCardIdGroups.slice(0, 4).map((cards, groupIndex) => (
        <PreviewSkillCardGroup
          key={groupIndex}
          cards={cards}
          customizationGroup={customizationGroups?.[groupIndex]}
          idolId={idolId}
          isEmpty={isEmpty}
          imageMap={imageMap}
          showCost={true}
        />
      ))}
    </div>
  ) : (
    <div style={styles.preview}>
      <PreviewPItems itemIds={itemIds.slice(0, 8)} imageMap={imageMap} />
      {[...Array(Math.min(4, Math.ceil(skillCardIdGroups[0].length/6)))].map((_, i) => (
        <PreviewSkillCardGroup
          cards={skillCardIdGroups[0].slice(i*6, i*6+6)}
          customizationGroup={customizationGroups?.[0].slice(i*6, i*6+6)}
          idolId={idolId}
          isEmpty={isEmpty}
          imageMap={imageMap}
          showCost={false}
        />
      ))}
      <div style={styles.cardCount}>
        <span style={styles.costPill}>
          Count:{" "}
          {skillCardIdGroups[0].filter((id) => id).length}
        </span>
      </div>
      <PreviewPDrinks drinkIds={drinkIds} imageMap={imageMap} stage={stage} />
    </div>
  );
}
