export const SYNC = false;
export const DEFAULT_NUM_RUNS = 1;
export const MIN_BUCKET_SIZE = 1000;
export const MAX_WORKERS = 8;

export const FALLBACK_STAGE = {
  id: "custom",
  type: "custom",
  plan: "free",
  turnCounts: { vocal: 4, dance: 4, visual: 4 },
  firstTurns: {
    vocal: 0.33,
    dance: 0.33,
    visual: 0.33,
  },
  criteria: {
    vocal: 0,
    dance: 0,
    visual: 0,
  },
  effects: [],
};
