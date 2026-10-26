import { PItems, SkillCards, PDrinks } from "gakumas-data";

export const MAX_ITEMS = 8;
export const MAX_DRINKS = 4;
export const MAX_GROUPS = 4;
export const MAX_CARDS_PER_GROUP = 6;

// gkImg().icon is either a CDN URL string (when NEXT_PUBLIC_GK_IMG_BASE_URL
// is set) or a bundled image object { src: "/_next/static/media/..." } when
// unset. Normalize to a lookup key + absolute fetch URL the server can hit.
function iconKeyAndUrl(icon, origin) {
  if (!icon) return null;
  if (typeof icon === "string") return [icon, icon];
  return [icon.src, `${origin}${icon.src}`];
}

export function collectIcons(loadout, origin, isExam, { itemIcon, cardIcon, drinkIcon }) {
  const map = new Map();
  const add = (icon) => {
    const pair = iconKeyAndUrl(icon, origin);
    if (pair && !map.has(pair[0])) map.set(pair[0], pair[1]);
  };
  for (const id of loadout.pItemIds.slice(0, MAX_ITEMS)) {
    const item = PItems.getById(id);
    if (item) add(itemIcon(item));
  }
  for (const group of loadout.skillCardIdGroups.slice(0, MAX_GROUPS)) {
    for (const id of group.slice(0, isExam ? MAX_CARDS_PER_GROUP * MAX_GROUPS : MAX_CARDS_PER_GROUP)) {
      const card = SkillCards.getById(id);
      if (card) add(cardIcon(card));
    }
  }
  if (loadout.pDrinkIds) {
    for (const id of loadout.pDrinkIds.slice(0, MAX_DRINKS)) {
      const drink = PDrinks.getById(id);
      if (drink) add(drinkIcon(drink));
    }
  }
  return map;
}
