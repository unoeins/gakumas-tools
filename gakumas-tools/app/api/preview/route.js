import { IdolConfig } from "gakumas-engine";
import gkImg from "gakumas-images";
import { Stages } from "gakumas-data";
import Preview from "@/components/Preview";
import { CARD_SIZE, previewLayout } from "@/components/Preview/Preview.styles";
import { collectIcons, MAX_GROUPS } from "@/components/Preview/previewIcons";
import {
  loadFonts,
  OG_SIZE,
  PREVIEW_CACHE_CONTROL,
  PREVIEW_RETRY_CACHE_CONTROL,
  renderImage,
} from "@/utils/og";
import { createPngCache, fetchAsPng } from "@/utils/pngCache";
import { loadoutFromSearchParams } from "@/utils/simulator";

const cachedPng = createPngCache(500);

export async function GET(request) {
  const url = new URL(request.url);
  const loadout = loadoutFromSearchParams(url.searchParams);
  const idolConfig = new IdolConfig(loadout);
  const { stageId, pItemIds, skillCardIdGroups, customizationGroups, pDrinkIds } = loadout;

  const stage = Stages.getById(stageId);
  const isEmpty = skillCardIdGroups.every((g) => g.every((c) => c == 0));

  const isExam = stage?.type === "exam";
  const groupCount = Math.min(isExam ? Math.ceil(skillCardIdGroups[0].length / 6) : skillCardIdGroups.length, MAX_GROUPS);
  const layout = previewLayout(groupCount, isEmpty, isExam);
  const iconSize = Math.ceil(CARD_SIZE * layout.scale);

  const icons = collectIcons(loadout, url.origin, isExam, {
    itemIcon: (item) => gkImg(item).icon,
    cardIcon: (card) => gkImg(card, idolConfig.idolId).icon,
    drinkIcon: (drink) => gkImg(drink).icon,
  });
  const entries = await Promise.all(
    [...icons].map(async ([key, fetchUrl]) => [
      key,
      await cachedPng(`${fetchUrl}@${iconSize}`, () =>
        fetchAsPng(fetchUrl, iconSize),
      ),
    ])
  );
  const imageMap = Object.fromEntries(entries.filter(([, v]) => v));
  const anyFailed = entries.length > Object.keys(imageMap).length;
  const fonts = await loadFonts();

  return renderImage(
    (
      <Preview
        stage={stage}
        itemIds={pItemIds}
        skillCardIdGroups={skillCardIdGroups}
        customizationGroups={customizationGroups}
        drinkIds={pDrinkIds}
        idolId={idolConfig.idolId}
        isEmpty={isEmpty}
        imageMap={imageMap}
        layout={layout}
      />
    ),
    {
      ...OG_SIZE,
      fonts,
      headers: {
        "Cache-Control": anyFailed
          ? PREVIEW_RETRY_CACHE_CONTROL
          : PREVIEW_CACHE_CONTROL,
      },
    }
  );
}
