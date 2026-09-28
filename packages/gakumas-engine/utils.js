import { ALL_FIELDS, COPY_ON_WRITE_FIELDS, DEBUG, S } from "./constants";

const seed = 610397104;

// Public domain
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let randomBufferEnabled = [];
let randomBuffer = [];
let randomPosition = [];

function nextRandom(state) {
  const runId = state?.[S.runId];
  // if (randomBuffer[runId]) {
  //   console.log("random enabled buf pos", randomBufferEnabled[runId], randomBuffer[runId], randomPosition[runId]);
  // }
  if (!runId || !randomBufferEnabled[runId]) {
    return Math.random();
  } else if (randomBuffer[runId].length > randomPosition[runId]) {
    // console.log("random reuse", runId, randomBuffer[runId][randomPosition[runId]]);
    return randomBuffer[runId][randomPosition[runId]++];
  } else {
    const next = Math.random();
    randomBuffer[runId].push(next);
    randomPosition[runId]++;
    // console.log("random new", runId, next);
    return next;
  }
}

let _getRand = DEBUG ? mulberry32(seed) : nextRandom;
let _getRandCount = 0;

export function getRand(state) {
  // console.log((new Error()).stack?.split("\n")[2]?.trim());//.split(" ")[1]);
  _getRandCount++;
  return _getRand(state);
}

export function getRandCallCount() {
  return _getRandCount;
}

export function isRandomBufferEnabled(state) {
  const runId = state[S.runId];
  return !!(runId && randomBufferEnabled[runId]);
}

export function enableRandomBuffer(state) {
  const runId = state[S.runId];
  if (runId) {
    randomBufferEnabled[runId] = true;
    if (!randomBuffer[runId]) {
      resetRandomBuffer(state);
    }
  }
}

export function disableRandomBuffer(state) {
  const runId = state[S.runId];
  if (runId) {
    randomBufferEnabled[runId] = false;
  }
}

export function resetRandomBuffer(state) {
  const runId = state[S.runId];
  if (runId) {
    randomBuffer[runId] = [];
    randomPosition[runId] = 0;
  }
}

export function flipRandomBuffer(state) {
  const runId = state[S.runId];
  if (runId) {
    randomPosition[runId] = 0;
  }
}

// Seed the RNG for deterministic runs. DEBUG only controls the *default*
// RNG; calling resetRand always switches to the seeded stream — parity
// tests rely on this.
export function resetRand(customSeed) {
  _getRand = mulberry32(customSeed ?? seed);
  _getRandCount = 0;
}

export function shuffle(arr, state) {
  let currentIndex = arr.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(getRand(state) * currentIndex);
    currentIndex--;

    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }

  return arr;
}

export function formatDiffField(value) {
  if (isNaN(value)) return value;
  // Most diffed fields are integer-valued. toFixed+parseFloat is a string
  // round-trip we want to skip for those; only non-integer numerics need
  // the 2-decimal truncation.
  if (Number.isInteger(value)) return value;
  return parseFloat(value.toFixed(2));
}

// Math.ceil with float-precision correction — snaps results that are within
// 1e-9 of an integer to that integer before ceiling, so artifacts like
// `Math.ceil(40 * 0.2 * 3)` rounding 24.000000000000004 up to 25 don't
// leak into integer-domain score results.
export function safeCeil(value) {
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 1e-9) return rounded;
  return Math.ceil(value);
}

export function shallowCopy(state) {
  // `.slice()` is meaningfully faster than `[...state]` for a 90-slot
  // array in V8 (native memcpy vs. iterator-protocol spread).
  return state.slice();
}

// Recursive clone for state slots that aren't copy-on-write.
// Arrays are shallow-sliced: primitive arrays (card piles, logs) are
// mutated in place, while object arrays (effects, cardMap) only ever have
// entries replaced, never mutated, so sharing entries is safe.
function cloneValue(v) {
  if (Array.isArray(v)) return v.slice();
  // Effects and cardMap entries are replaced, never mutated.
  if (v.effectInstanceId !== undefined) return v;
  if (v.baseId !== undefined) return v;
  const out = {};
  for (const k in v) {
    const val = v[k];
    if (val === null || typeof val !== "object") {
      out[k] = val;
    } else {
      out[k] = cloneValue(val);
    }
  }
  return out;
}

const SHARED_SLOTS = new Uint8Array(ALL_FIELDS.length);
for (const field of COPY_ON_WRITE_FIELDS) SHARED_SLOTS[field] = 1;

export function deepCopy(state) {
  const out = state.slice();
  for (let i = 0; i < out.length; i++) {
    if (SHARED_SLOTS[i]) continue;
    const v = out[i];
    if (v !== null && typeof v === "object") {
      out[i] = cloneValue(v);
    }
  }
  return out;
}

export function getBaseId(entity) {
  if (entity.upgraded) return entity.id - 1;
  return entity.id;
}

export function equalCustomizations(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (const key in a) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export const RECOMMENDED_EFFECT_MAPPINGS = {
  91: "fullPower",
  92: "strength",
  93: "fullPower",
};
