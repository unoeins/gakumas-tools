import { extractLines, getWhiteCanvas, loadImageFromFile } from "./common";

export async function getScoresFromFile(file, worker) {
  const img = await loadImageFromFile(file);
  const whiteCanvas = getWhiteCanvas(img, 190);
  const engWhitePromise = worker.recognize(whiteCanvas, {}, { blocks: true });
  const scores = extractScores(await engWhitePromise);
  return scores;
}

export async function getScoresFromImage(img, worker) {
  const whiteCanvas = getWhiteCanvas(img, 160);
  const result = await worker.recognize(whiteCanvas, {}, { blocks: true });
  const scores = extractScores(result);
  return scores;
}

export function extractScores(result) {
  let scores = [];

  const lines = extractLines(result);
  for (let i in lines) {
    const line = lines[i];
    if (line.confidence < 60) continue;

    if (!/^[\d\s,\.—\-]+$/.test(line.text)) continue;
    let words = [];
    const pattern = /(\d{1,3}(?:[,\.]\d{3})*|[—\-]+)\s*/y;
    let match = null;
    while ((match = pattern.exec(line.text)) !== null) {
      words.push(match[1]);
    }
    if (words.length != 3) continue;

    const stageScores = words.map(
      (word) => parseInt(word.replaceAll(/[^\d]/g, ""), 10) || ""
    );

    scores.push(stageScores);

    if (scores.length == 3) break;
  }

  return scores;
}
