// Shared utilities used across screens and question components.

import questionData from "./data/questions.json";
import { pickWeighted } from "./progress.js";

// Strip documentation entries (anything starting with _ or labelled _section)
// from the array. The runtime question list is everything else.
export const QUESTIONS = (questionData.questions || []).filter(
  (q) => !q._section && q.type
);

export const LETTERS = ["A", "B", "C", "D"];

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Picks `count` questions weighted toward least-recently-seen, so the
// student doesn't get the same items twice in a row across sessions.
// Falls back to plain random when no progress is recorded yet.
export function pickQuestions(count) {
  return pickWeighted(QUESTIONS, Math.min(count, QUESTIONS.length));
}

// Determine if a given submitted answer for a question is correct.
// `submitted` is whatever the question component passed to onAnswer.
export function evaluateAnswer(q, submitted) {
  switch (q.type) {
    case "multiple_choice":
    case "trace":
      return submitted === q.answer;
    case "boolean":
      return submitted === q.answer;
    case "binary":
    case "bug_hunt":
    case "build_loop":
    case "match_pairs":
    case "fill_in_blank":
    case "click_to_locate_bug":
    case "order_steps":
      return !!submitted?.correct;
    default:
      return false;
  }
}
