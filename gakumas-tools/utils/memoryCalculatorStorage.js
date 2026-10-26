import { COST_RANGES_BY_RANK } from "./contestPower";

export const MEMORY_CALCULATOR_STORAGE_KEY = "gakumas-tools.memoryCalculator";

const ARRAY_FIELDS = [
  "targetSkillCardIds",
  "alternateSkillCardIds",
  "targetNegations",
  "acquiredSkillCardIds",
];

export function loadMemoryCalculatorState(storage) {
  let data;
  try {
    const targetStorage = storage ?? globalThis.localStorage;
    const raw = targetStorage?.getItem(MEMORY_CALCULATOR_STORAGE_KEY);
    if (raw == null) return {};
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!data || typeof data !== "object") return {};

  const state = {};
  for (const field of ARRAY_FIELDS) {
    if (Array.isArray(data[field])) state[field] = data[field];
  }
  if (Object.hasOwn(COST_RANGES_BY_RANK, data.rank)) state.rank = data.rank;
  return state;
}

export function saveMemoryCalculatorState(state, storage) {
  try {
    const targetStorage = storage ?? globalThis.localStorage;
    targetStorage?.setItem(MEMORY_CALCULATOR_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
