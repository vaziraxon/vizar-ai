// Unit tests for the free visa photo tool's geometry.
//
//   node --experimental-strip-types --test scripts/site/visa-photo.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PHOTO_SPECS,
  PHOTO_SPEC_BY_ID,
  SHEET,
  START,
  brightness,
  coversFrame,
  guideLines,
  looksPlainLight,
  mmToPx,
  sheetLayout,
  sourceDpi,
} from "../../src/lib/site/visa-photo.ts";

const near = (actual, expected, eps = 0.01) => assert.ok(Math.abs(actual - expected) < eps, `${actual} ≉ ${expected}`);

test("every guide line falls inside its photo", () => {
  for (const spec of PHOTO_SPECS) {
    const g = guideLines(spec);
    assert.ok(g.topHigh > 0, `${spec.id}: top line above the edge`);
    assert.ok(g.topHigh < g.topLow && g.topLow < g.chin, `${spec.id}: lines out of order`);
    assert.ok(g.chin < spec.heightMm, `${spec.id}: chin below the edge`);
    near(g.topLow - g.topHigh, spec.head.maxMm - spec.head.minMm);
  }
});

test("Schengen: a mid-size face (chin to hairline) is centred", () => {
  const g = guideLines(PHOTO_SPEC_BY_ID.schengen);
  near(g.chin, 39.5);
  near((g.topHigh + g.topLow) / 2, 5.5);
});

test("US: the eye band sits between the top band and the chin", () => {
  const g = guideLines(PHOTO_SPEC_BY_ID.usa);
  assert.ok(g.eyes);
  near(g.eyes[0], 50.8 - 34.925);
  near(g.eyes[1], 50.8 - 28.575);
  assert.ok(g.topLow < g.eyes[0] && g.eyes[1] < g.chin);
  // The eyes of a mid-size head, about 45% down from its top, land inside the band.
  const top = (g.topHigh + g.topLow) / 2;
  const eyes = top + 0.45 * (g.chin - top);
  assert.ok(eyes > g.eyes[0] && eyes < g.eyes[1], `eyes at ${eyes}`);
});

test("millimetres to pixels", () => {
  assert.equal(mmToPx(35, 600), 827);
  assert.equal(mmToPx(45, 600), 1063);
  assert.equal(mmToPx(50.8, 300), 600);
});

test("copies on a 10×15 print, all inside it", () => {
  assert.equal(sheetLayout(PHOTO_SPEC_BY_ID.schengen).count, 8);
  assert.equal(sheetLayout(PHOTO_SPEC_BY_ID.japan).count, 6);
  assert.equal(sheetLayout(PHOTO_SPEC_BY_ID.usa).count, 2);
  for (const spec of PHOTO_SPECS) {
    for (const p of sheetLayout(spec).positions) {
      assert.ok(p.xMm >= 2 && p.xMm + spec.widthMm <= SHEET.widthMm - 2 + 1e-9, `${spec.id} x`);
      assert.ok(p.yMm >= 2 && p.yMm + spec.heightMm <= SHEET.heightMm - 2 + 1e-9, `${spec.id} y`);
    }
  }
});

// A 3:4 phone photo in a 35×45 frame
const iw = 3000;
const ih = 4000;

test("the picture covers the frame at the start, not when moved or tilted at zoom 1", () => {
  assert.equal(coversFrame(START, iw, ih, 35, 45), true);
  assert.equal(coversFrame({ ...START, dx: 0.1 }, iw, ih, 35, 45), false);
  assert.equal(coversFrame({ ...START, rotateDeg: 10 }, iw, ih, 35, 45), false);
});

test("zooming in leaves room to move and tilt", () => {
  assert.equal(coversFrame({ ...START, zoom: 1.3, dx: 0.1 }, iw, ih, 35, 45), true);
  assert.equal(coversFrame({ ...START, zoom: 1.3, rotateDeg: 10 }, iw, ih, 35, 45), true);
  assert.equal(coversFrame({ ...START, zoom: 1.3, dy: -0.2 }, iw, ih, 35, 45), false);
});

test("sharpness: source pixels per inch drop as you zoom in", () => {
  const schengen = PHOTO_SPEC_BY_ID.schengen;
  near(sourceDpi(schengen, iw, ih, 1), 3000 / (35 / 25.4), 0.5);
  assert.ok(sourceDpi(schengen, iw, ih, 6) > 300);
  assert.ok(sourceDpi(schengen, 600, 800, 2) < 300);
});

test("background: plain white passes, dark or patchy doesn't", () => {
  const fill = (values) => values.flatMap((v) => [v, v, v, 255]);
  assert.equal(looksPlainLight(brightness(fill(Array(50).fill(250)))), true);
  assert.equal(looksPlainLight(brightness(fill(Array(50).fill(120)))), false);
  const patchy = brightness(fill([...Array(25).fill(255), ...Array(25).fill(0)]));
  near(patchy.spread, 127.5, 0.5);
  assert.equal(looksPlainLight(patchy), false);
});
