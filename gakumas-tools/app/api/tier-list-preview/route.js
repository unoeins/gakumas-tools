import { readFile } from "fs/promises";
import path from "path";
import TierListPreview from "@/components/TierListPreview";
import {
  ITEM_SIZE,
  PREVIEW_WIDTH,
  previewHeight,
} from "@/components/TierListPreview/TierListPreview.styles";
import {
  ENTITY_DATA_BY_TYPE,
  EntityTypes,
  resolveEntityIcon,
} from "@/utils/entities";
import {
  loadFonts,
  PREVIEW_CACHE_CONTROL,
  PREVIEW_RETRY_CACHE_CONTROL,
  renderImage,
} from "@/utils/og";
import { createPngCache, fetchAsPng } from "@/utils/pngCache";
import { clampList, decodeList, EMPTY_LIST } from "@/utils/tierList";

const MAX_ITEMS_PER_TIER = 16;

const cachedPng = createPngCache(500);

function iconToFetchUrl(icon, origin) {
  if (!icon) return null;
  if (typeof icon === "string") return icon;
  return `${origin}${icon.src}`;
}

function loadRankPng(rank) {
  return cachedPng(`rank:${rank}`, async () => {
    try {
      const file = path.join(process.cwd(), "public", "ranks", `${rank}.png`);
      const buf = await readFile(file);
      return `data:image/png;base64,${buf.toString("base64")}`;
    } catch (err) {
      console.warn(`tier-list-preview: rank ${rank}:`, err?.message || err);
      return null;
    }
  });
}

function iconKey(icon) {
  if (!icon) return null;
  return typeof icon === "string" ? icon : icon.src;
}

function fetchAll(entries) {
  return Promise.all(
    entries.map(async ([k, url]) => [
      k,
      await cachedPng(url, () => fetchAsPng(url, ITEM_SIZE)),
    ]),
  );
}

export async function GET(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const ENTITY_DATA = ENTITY_DATA_BY_TYPE[type];
  if (!ENTITY_DATA) {
    return new Response("Invalid type", { status: 400 });
  }

  const list = clampList(
    decodeList(url.searchParams.get("d")) || EMPTY_LIST,
    MAX_ITEMS_PER_TIER,
  );
  if (!list.tiers.length) {
    return new Response("No valid tiers", { status: 400 });
  }

  const itemEntries = [];
  for (const rank of list.tiers) {
    for (const id of list.items[rank]) {
      const entity = ENTITY_DATA.getById(id);
      if (!entity) continue;
      const icon = resolveEntityIcon(entity);
      const fetchUrl = iconToFetchUrl(icon, url.origin);
      const key = iconKey(icon);
      if (key && fetchUrl) itemEntries.push([id, key, fetchUrl]);
    }
  }

  const [rankPairs, iconPairs] = await Promise.all([
    Promise.all(list.tiers.map(async (r) => [r, await loadRankPng(r)])),
    fetchAll(itemEntries.map(([, key, fetchUrl]) => [key, fetchUrl])),
  ]);
  const rankSrc = Object.fromEntries(rankPairs.filter(([, v]) => v));
  const iconCache = Object.fromEntries(iconPairs.filter(([, v]) => v));
  const anyFailed = [...rankPairs, ...iconPairs].some(([, v]) => !v);

  const itemSrc = {};
  for (const [id, key] of itemEntries) {
    if (iconCache[key]) itemSrc[id] = iconCache[key];
  }

  return renderImage(
    <TierListPreview list={list} rankSrc={rankSrc} itemSrc={itemSrc} />,
    {
      width: PREVIEW_WIDTH,
      height: previewHeight(list),
      fonts: await loadFonts(),
      headers: {
        "Cache-Control": anyFailed
          ? PREVIEW_RETRY_CACHE_CONTROL
          : PREVIEW_CACHE_CONTROL,
      },
    },
  );
}
