import { Footer, Page } from "@/components/OgImage/parts";
import { SITE_HOST } from "@/components/OgImage/theme";
import { Raised } from "@/components/OgImage/parts";
import { COLORS } from "@/components/OgImage/theme";
import PreviewPItems from "./PreviewPItems";
import PreviewSkillCardGroup from "./PreviewSkillCardGroup";
import PreviewPDrinks from "./PreviewPDrinks";
import styles, { FOOTER_SIZE } from "./Preview.styles";

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
    <Page style={styles.preview}>
      <div style={styles.card}>
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
      <Footer size={FOOTER_SIZE} host={SITE_HOST} style={styles.footer} />
    </Page>
  ) : (
    <Page style={styles.preview}>
      <div style={styles.card}>
        <PreviewPItems itemIds={itemIds.slice(0, 8)} imageMap={imageMap} />
        {[...Array(Math.min(4, Math.ceil(skillCardIdGroups[0].length/6)))].map((_, i) => (
          <PreviewSkillCardGroup
            key={i}
            cards={skillCardIdGroups[0].slice(i*6, i*6+6)}
            customizationGroup={customizationGroups?.[0].slice(i*6, i*6+6)}
            idolId={idolId}
            isEmpty={isEmpty}
            imageMap={imageMap}
            showCost={false}
          />
        ))}
        <div style={styles.row}>
          <Raised radius={999} edge={COLORS.edge} style={styles.costChip}>
            <span>Card Count</span>
            <span style={styles.costValue}>
              {skillCardIdGroups[0].filter((id) => id).length}
            </span>
          </Raised>
        </div>
        <PreviewPDrinks drinkIds={drinkIds} imageMap={imageMap} stage={stage} />
      </div>
      <Footer size={FOOTER_SIZE} host={SITE_HOST} style={styles.footer} />
    </Page>
  );
}
