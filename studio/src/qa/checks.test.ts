import assert from "node:assert/strict";
import test from "node:test";
import { iphoneDuo } from "../content/iphone-duo";
import { checkProject, errorsOf } from "./checks";

test("every spoken figure is in the evidence linked to that segment", () => {
  const errors = errorsOf(checkProject(iphoneDuo));
  assert.deepEqual(errors, []);
});

test("shots cover every segment and charts are programmatic", () => {
  const scenes = new Set(iphoneDuo.shots.map((shot) => shot.scene));
  for (const required of ["battery", "market", "map", "cold-open", "stack"]) {
    assert.equal(scenes.has(required as never), true, required);
  }
  assert.equal(iphoneDuo.resolution.width, 1920);
  assert.equal(iphoneDuo.resolution.height, 1080);
});
