export const MAX_PARAMS_BY_DIFFICULTY = {
  regular: 1000,
  pro: 1500,
  master: 1800,
  legend: 2800,
};

export const PARAM_BONUS_BY_PLACE = {
  1: 30,
  2: 20,
  3: 10,
  4: 0,
};

export const PARAM_BONUS_BY_PLACE_LEGEND = {
  1: 120,
  2: 0, // TODO
  3: 0,
  4: 0,
};

export const RATING_BY_PLACE = {
  1: 1700,
  2: 900,
  3: 500,
  4: 0,
};

export const TARGET_RATING_BY_RANK = {
  S4: 26000,
  "SSS+": 23000,
  SSS: 20000,
  "SS+": 18000,
  SS: 16000,
  "S+": 14500,
  S: 13000,
  "A+": 11500,
  A: 10000,
  "B+": 8000,
  B: 6000,
  "C+": 4500,
  C: 3000,
};

export const REVERSE_RATING_REGIMES = [
  { threshold: 5250, base: 200000, multiplier: 0 },
  { threshold: 3650, base: 40000, multiplier: 0.01 },
  { threshold: 3450, base: 30000, multiplier: 0.02 },
  { threshold: 3050, base: 20000, multiplier: 0.04 },
  { threshold: 2250, base: 10000, multiplier: 0.08 },
  { threshold: 1500, base: 5000, multiplier: 0.15 },
  { threshold: 0, base: 0, multiplier: 0.3 },
];

export const REVERSE_RATING_REGIMES_LEGEND = [
  { threshold: 8700, base: 2000000, multiplier: 0 },
  { threshold: 7300, base: 600000, multiplier: 0.001 },
  { threshold: 6500, base: 500000, multiplier: 0.008 },
  { threshold: 4500, base: 300000, multiplier: 0.01 },
  { threshold: 0, base: 0, multiplier: 0.015 },
];

export const RATING_REGIMES_LEGEND_MIDDLE = [
  { threshold: 200000, multiplier: 0, constant: 2670 },
  { threshold: 60000, multiplier: 0.001, constant: 2470 },
  { threshold: 50000, multiplier: 0.002, constant: 2410 },
  { threshold: 40000, multiplier: 0.003, constant: 2360 },
  { threshold: 30000, multiplier: 0.008, constant: 2160 },
  { threshold: 20000, multiplier: 0.05, constant: 900 },
  { threshold: 10000, multiplier: 0.08, constant: 300 },
  { threshold: 0, multiplier: 0.11, constant: 0 },
];

export function calculateRatingExExamScore(place, params, maxParams, difficulty, actualMiddleScore) {
  const placeParamBonus = difficulty === "legend" ? 
    PARAM_BONUS_BY_PLACE_LEGEND[place] : 
    PARAM_BONUS_BY_PLACE[place];
  const placeRating = RATING_BY_PLACE[place];
  const paramRating = Math.floor(
    params.reduce(
      (acc, cur) => acc + Math.min(cur + placeParamBonus, maxParams),
      0
    ) * (difficulty === "legend" ? 2.1 : 2.3)
  );
  const middleScoreBonus = difficulty === "legend" && actualMiddleScore ?
    calculateMiddleScoreBonus(RATING_REGIMES_LEGEND_MIDDLE, actualMiddleScore) : 
    0;
  return placeRating + paramRating + middleScoreBonus;
}

export function calculateMiddleScoreBonus(ratingRegimes, score) {
  for (let j = 0; j < ratingRegimes.length; j++) {
    const { threshold, multiplier, constant } = ratingRegimes[j];
    if (score > threshold) {
      return Math.floor(score * multiplier + constant);
    }
  }
  return 0;
}

export function calculateTargetScores(ratingExExamScore, difficulty) {
  const targetRatingByRank = TARGET_RATING_BY_RANK;
  const reverseRatingRegimes = difficulty === "legend" ? 
    REVERSE_RATING_REGIMES_LEGEND : 
    REVERSE_RATING_REGIMES;
  return Object.keys(targetRatingByRank).map((rank) => {
    const targetRating = targetRatingByRank[rank] - ratingExExamScore;
    for (let { threshold, base, multiplier } of reverseRatingRegimes) {
      if (targetRating <= threshold) continue;
      if (multiplier === 0) {
        return { rank, score: "-" };
      }
      return {
        rank,
        score: Math.ceil(base + (targetRating - threshold) / multiplier),
      };
    }
    return { rank, score: 0 };
  });
}

export function calculateActualRating(actualScore, ratingExExamScore, difficulty) {
  let calcScore = actualScore;
  let actualRating = 0;
  const reverseRatingRegimes = difficulty === "legend" ? 
    REVERSE_RATING_REGIMES_LEGEND : 
    REVERSE_RATING_REGIMES;
  for (let { base, multiplier } of reverseRatingRegimes) {
    if (calcScore > base) {
      actualRating += (calcScore - base) * multiplier;
      calcScore = base;
    }
  }
  return Math.floor(actualRating) + ratingExExamScore;
}

export function getRank(rating) {
  for (let rank in TARGET_RATING_BY_RANK) {
    if (rating >= TARGET_RATING_BY_RANK[rank]) return rank;
  }
  return null;
}
