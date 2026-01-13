import { PItems, SkillCards, PDrinks } from "gakumas-data";

export const EntityTypes = {
  P_ITEM: "P_ITEM",
  SKILL_CARD: "SKILL_CARD",
  P_DRINK: "P_DRINK",
};

export const ENTITY_DATA_BY_TYPE = {
  [EntityTypes.P_ITEM]: PItems,
  [EntityTypes.SKILL_CARD]: SkillCards,
  [EntityTypes.P_DRINK]: PDrinks,
};
