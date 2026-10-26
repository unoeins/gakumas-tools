import { test } from "node:test";
import assert from "node:assert/strict";
import { Stages } from "gakumas-data";
import { FALLBACK_STAGE } from "../gakumas-tools/simulator/constants.js";
import {
  getSimulatorUrl,
  getStage,
  knownStageId,
  loadoutFromSearchParams,
} from "../gakumas-tools/utils/simulator.js";

const UNKNOWN_ID = 999999;
const knownStage = Stages.getAll()[0];
const customStage = { ...FALLBACK_STAGE, name: "Mine" };

test("getStage resolves known, custom and missing stages", () => {
  assert.equal(getStage(knownStage.id), knownStage);
  assert.equal(getStage("custom", customStage), customStage);
  assert.equal(getStage(null), FALLBACK_STAGE);
});

test("getStage falls back for an unknown stage id", () => {
  assert.equal(getStage(UNKNOWN_ID), FALLBACK_STAGE);
});

test("knownStageId drops unknown ids", () => {
  assert.equal(knownStageId(knownStage.id), knownStage.id);
  assert.equal(knownStageId("custom"), "custom");
  assert.equal(knownStageId(UNKNOWN_ID), null);
  assert.equal(knownStageId(undefined), null);
});

test("loadoutFromSearchParams drops an unknown stage id", () => {
  const loadout = loadoutFromSearchParams(
    new URLSearchParams(`stage=${UNKNOWN_ID}`)
  );
  assert.equal(loadout.stageId, null);
  assert.ok(loadout.hasDataFromParams);
});

test("getSimulatorUrl has no URL for a stage it can't resolve", () => {
  const loadout = loadoutFromSearchParams(new URLSearchParams());
  assert.equal(getSimulatorUrl({ ...loadout, stageId: UNKNOWN_ID }, []), null);
  assert.match(getSimulatorUrl(loadout, [loadout]), /stage=/);
});
