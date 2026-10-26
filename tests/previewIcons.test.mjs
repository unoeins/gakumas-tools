import { test } from "node:test";
import assert from "node:assert/strict";
import { PItems, SkillCards } from "gakumas-data";
import { collectIcons } from "../gakumas-tools/components/Preview/previewIcons.js";
import { createPngCache } from "../gakumas-tools/utils/pngCache.js";

const lookups = {
  itemIcon: (item) => `https://cdn.test/items/${item.id}.png`,
  cardIcon: (card) => `https://cdn.test/cards/${card.id}.png`,
};

test("collects icons only for the items, groups and cards the preview draws", () => {
  const pItemIds = PItems.getAll()
    .slice(0, 10)
    .map((item) => item.id);
  const ids = SkillCards.getAll()
    .slice(0, 400)
    .map((card) => card.id);
  const skillCardIdGroups = Array.from({ length: 50 }, (_, g) =>
    ids.slice(g * 8, g * 8 + 8),
  );
  const icons = collectIcons(
    { pItemIds, skillCardIdGroups },
    "https://origin.test",
    lookups,
  );
  const expected = [
    ...pItemIds.slice(0, 4).map((id) => `https://cdn.test/items/${id}.png`),
    ...skillCardIdGroups
      .slice(0, 4)
      .flatMap((group) => group.slice(0, 6))
      .map((id) => `https://cdn.test/cards/${id}.png`),
  ];
  assert.deepEqual([...icons.keys()], expected);
});

test("resolves bundled icons against the request origin", () => {
  const [card] = SkillCards.getAll();
  const icons = collectIcons(
    { pItemIds: [], skillCardIdGroups: [[card.id]] },
    "https://origin.test",
    { ...lookups, cardIcon: () => ({ src: "/_next/static/media/a.png" }) },
  );
  assert.deepEqual(
    [...icons],
    [
      [
        "/_next/static/media/a.png",
        "https://origin.test/_next/static/media/a.png",
      ],
    ],
  );
});

test("a failed load is retried on the next request", async () => {
  const get = createPngCache(10);
  let calls = 0;
  const load = async () => (++calls === 1 ? null : "data:ok");
  assert.equal(await get("a", load), null);
  assert.equal(await get("a", load), "data:ok");
  assert.equal(await get("a", load), "data:ok");
  assert.equal(calls, 2);
});

test("evicts the least recently used entry past the limit", async () => {
  const get = createPngCache(2);
  const loads = [];
  const load = (key) => async () => {
    loads.push(key);
    return `data:${key}`;
  };
  await get("a", load("a"));
  await get("b", load("b"));
  await get("a", load("a"));
  await get("c", load("c"));
  await get("a", load("a"));
  await get("b", load("b"));
  assert.deepEqual(loads, ["a", "b", "c", "b"]);
});
