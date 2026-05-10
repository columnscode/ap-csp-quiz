#!/usr/bin/env node
/**
 * Validates src/data/questions.json against the schemas defined in its
 * own _typeGuide section. Prints a report and exits non-zero on errors.
 *
 * Usage:  npm run validate-questions
 *
 * Run this every time you add or change questions. CI-friendly.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = join(__dirname, "..", "src", "data", "questions.json");

const data = JSON.parse(readFileSync(path, "utf8"));

const validTopics = new Set(Object.keys(data._meta?.topics ?? {}));
if (validTopics.size === 0) {
  console.error("✗ No topics defined in _meta.topics");
  process.exit(1);
}

const errors = [];
const warnings = [];

function err(qIdx, msg, q) {
  errors.push(`Q[${qIdx}] ${q?.type ?? "?"} (${q?.topic ?? "?"}): ${msg}`);
}
function warn(qIdx, msg) {
  warnings.push(`Q[${qIdx}] ${msg}`);
}

const questions = (data.questions ?? []).filter((q) => !q._section);

questions.forEach((q, i) => {
  if (!q.type) return err(i, "missing 'type'", q);
  if (!q.topic) return err(i, "missing 'topic'", q);
  if (!validTopics.has(q.topic)) {
    err(i, `unknown topic '${q.topic}'. Valid: ${[...validTopics].join(", ")}`, q);
  }
  if (!q.explanation || typeof q.explanation !== "string") {
    err(i, "missing or non-string 'explanation'", q);
  }

  switch (q.type) {
    case "multiple_choice":
      if (!q.question || typeof q.question !== "string")
        err(i, "missing 'question'", q);
      if (!Array.isArray(q.options) || q.options.length !== 4)
        err(i, `'options' must be an array of EXACTLY 4 strings (got ${q.options?.length})`, q);
      if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3)
        err(i, `'answer' must be 0..3 (got ${q.answer})`, q);
      if (q.code != null && typeof q.code !== "string")
        err(i, "'code' must be a string when present", q);
      break;

    case "trace":
      if (!q.title) err(i, "missing 'title'", q);
      if (!Array.isArray(q.code)) err(i, "'code' must be an array of strings", q);
      if (!Array.isArray(q.steps) || q.steps.length === 0)
        err(i, "'steps' must be a non-empty array", q);
      else {
        q.steps.forEach((s, si) => {
          if (typeof s.line !== "number") err(i, `step ${si}: 'line' must be a number`, q);
          if (s.line < 0 || s.line >= (q.code?.length ?? 0))
            err(i, `step ${si}: line ${s.line} out of bounds (code has ${q.code?.length} lines)`, q);
          if (!s.vars || typeof s.vars !== "object")
            err(i, `step ${si}: 'vars' must be an object`, q);
        });
      }
      if (!Array.isArray(q.options) || q.options.length !== 4)
        err(i, "'options' must be an array of 4 strings", q);
      if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3)
        err(i, `'answer' must be 0..3`, q);
      if (q.steps && q.steps.length > 18)
        warn(i, `trace has ${q.steps.length} steps — consider trimming, students lose focus past ~15`);
      break;

    case "binary":
      if (typeof q.target !== "number" || q.target < 0 || q.target > 255 || !Number.isInteger(q.target))
        err(i, `'target' must be integer 0..255 (got ${q.target})`, q);
      if (q.target === 0 || q.target === 255)
        warn(i, `target=${q.target} is trivial — consider a more interesting value`);
      break;

    case "bug_hunt":
      if (!Array.isArray(q.code)) err(i, "'code' must be an array of strings", q);
      if (typeof q.buggyLine !== "number")
        err(i, "'buggyLine' must be a number", q);
      else if (q.buggyLine < 0 || q.buggyLine >= (q.code?.length ?? 0))
        err(i, `buggyLine ${q.buggyLine} out of bounds (code has ${q.code?.length} lines)`, q);
      if (!Array.isArray(q.options) || q.options.length !== 4)
        err(i, "'options' must be 4 strings", q);
      if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3)
        err(i, "'answer' must be 0..3", q);
      break;

    case "boolean":
      if (!q.expression || typeof q.expression !== "string")
        err(i, "missing 'expression'", q);
      if (q.answer !== "true" && q.answer !== "false")
        err(i, `'answer' must be the string 'true' or 'false' (got ${JSON.stringify(q.answer)})`, q);
      if (q.expression && q.expression.length > 35)
        warn(i, `expression is ${q.expression.length} chars — keep under ~30 for visual clarity`);
      break;

    case "build_loop":
      if (!q.title) err(i, "missing 'title'", q);
      if (!q.description) err(i, "missing 'description'", q);
      if (!Array.isArray(q.blocks) || q.blocks.length < 2)
        err(i, "'blocks' must be array of 2+ strings", q);
      if (q.blocks && q.blocks.length > 10)
        warn(i, `${q.blocks.length} blocks — keep under ~8 for usability`);
      break;

    default:
      err(i, `unknown type '${q.type}'`, q);
  }
});

// Distribution report
const byType = {};
const byTopic = {};
questions.forEach((q) => {
  byType[q.type] = (byType[q.type] ?? 0) + 1;
  byTopic[q.topic] = (byTopic[q.topic] ?? 0) + 1;
});

console.log(`\nQuestion bank: ${questions.length} questions\n`);
console.log("By type:");
Object.entries(byType)
  .sort(([, a], [, b]) => b - a)
  .forEach(([k, v]) => console.log(`  ${k.padEnd(18)} ${v}`));
console.log("\nBy topic:");
Object.entries(byTopic)
  .sort(([, a], [, b]) => b - a)
  .forEach(([k, v]) => console.log(`  ${k.padEnd(14)} ${v}`));

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  warnings.forEach((w) => console.log("  ⚠ " + w));
}

if (errors.length) {
  console.log(`\nErrors (${errors.length}):`);
  errors.forEach((e) => console.log("  ✗ " + e));
  console.log("");
  process.exit(1);
}

console.log("\n✓ All questions valid.\n");
