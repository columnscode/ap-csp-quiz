// Progress persistence for the quiz app.
//
// Stored in localStorage under one key. Two reasons to live here, not in App:
//   1. Question selection (pickWeighted) needs to read history before any
//      React component mounts.
//   2. Backup export/import is portable across devices via a base64 string.
//
// On iOS Safari opened from email, localStorage usually persists per
// file:// origin but can be wiped by aggressive cache clears or different
// document URLs across opens. The clipboard backup is the safety net.

const STORAGE_KEY = "ap_csp_quiz_progress_v1";
const VERSION = 1;

// Stable per-question ID. Hash of the prompt-identifying content only —
// editing an explanation or shuffling distractors keeps the ID stable;
// rewording the question itself (intentionally) creates a new ID.
export function questionId(q) {
  const idKey = [
    q.type,
    q.topic,
    q.question || q.expression || q.title || (q.target != null ? `t${q.target}` : ""),
    // Disambiguate when title/prompt collides (e.g., several traces with
    // identical title). Code/blocks are content-defining for those types.
    Array.isArray(q.code) ? q.code.join("\n") : "",
    Array.isArray(q.blocks) ? q.blocks.join("\n") : "",
  ].join("§");
  return fnv1a(idKey);
}

// 32-bit FNV-1a, base36. ~7 char output. No crypto, no deps, file:// safe.
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(36);
}

function emptyProgress() {
  return { version: VERSION, questions: {}, topics: {}, quizzes: 0 };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    if (parsed?.version !== VERSION) return emptyProgress();
    return {
      version: VERSION,
      questions: parsed.questions || {},
      topics: parsed.topics || {},
      quizzes: parsed.quizzes || 0,
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

// Update per-question + per-topic counters from a finished quiz session.
// `answers` is the array QuizScreen builds: { q, picked, correct, qIdx }[].
export function recordSession(answers) {
  if (!answers?.length) return;
  const p = loadProgress();
  const now = Date.now();
  for (const a of answers) {
    const id = questionId(a.q);
    const s = p.questions[id] || { seen: 0, correct: 0, wrong: 0, lastSeen: 0 };
    s.seen += 1;
    if (a.correct) s.correct += 1;
    else s.wrong += 1;
    s.lastSeen = now;
    p.questions[id] = s;

    const t = a.q.topic;
    const ts = p.topics[t] || { seen: 0, correct: 0 };
    ts.seen += 1;
    if (a.correct) ts.correct += 1;
    p.topics[t] = ts;
  }
  p.quizzes += 1;
  saveProgress(p);
}

// Pick `count` questions, biased toward least-recently-seen.
// Strategy: sort all questions by lastSeen ascending (never-seen first),
// take a pool of 2× the requested count, shuffle, slice. Guarantees that
// recently-seen questions don't immediately reappear, while preserving
// variety within the stale pool.
export function pickWeighted(all, count, progress) {
  const p = progress || loadProgress();
  const enriched = all.map((q) => {
    const stat = p.questions[questionId(q)];
    return { q, lastSeen: stat?.lastSeen ?? 0 };
  });
  enriched.sort((a, b) => a.lastSeen - b.lastSeen);

  const poolSize = Math.min(enriched.length, Math.max(count * 2, count + 5));
  const pool = enriched.slice(0, poolSize);

  // Fisher-Yates shuffle within the pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map((p) => p.q);
}

// Summary used by the backup/progress UI on HomeScreen.
export function summarize(allQuestions) {
  const p = loadProgress();
  const seenCount = Object.keys(p.questions).length;
  let totalSeen = 0;
  let totalCorrect = 0;
  for (const s of Object.values(p.questions)) {
    totalSeen += s.seen;
    totalCorrect += s.correct;
  }
  return {
    quizzes: p.quizzes,
    seenCount,
    totalQuestions: allQuestions.length,
    totalAnswered: totalSeen,
    accuracyPct: totalSeen ? Math.round((totalCorrect / totalSeen) * 100) : null,
  };
}

// ----- Backup code (base64 of the JSON blob). -----

export function exportCode() {
  const p = loadProgress();
  const json = JSON.stringify(p);
  // btoa requires Latin-1; our content is pure ASCII (numbers + base36 ids).
  return btoa(json);
}

// Merge an imported code into local progress. Per-question stats are
// reconciled by taking the MAX of every counter and the MAX lastSeen —
// this approximates "combined history" without requiring per-event logs.
// Returns { ok: true, mergedCount } or { ok: false, error }.
export function importCode(code) {
  let decoded;
  try {
    decoded = JSON.parse(atob(code.trim()));
  } catch {
    return { ok: false, error: "Code is not valid base64 JSON." };
  }
  if (decoded?.version !== VERSION) {
    return { ok: false, error: `Unsupported version (${decoded?.version}).` };
  }

  const cur = loadProgress();
  let mergedCount = 0;
  for (const [id, s] of Object.entries(decoded.questions || {})) {
    const ex = cur.questions[id];
    if (!ex) {
      cur.questions[id] = { ...s };
      mergedCount += 1;
    } else {
      cur.questions[id] = {
        seen: Math.max(ex.seen || 0, s.seen || 0),
        correct: Math.max(ex.correct || 0, s.correct || 0),
        wrong: Math.max(ex.wrong || 0, s.wrong || 0),
        lastSeen: Math.max(ex.lastSeen || 0, s.lastSeen || 0),
      };
      mergedCount += 1;
    }
  }
  for (const [t, ts] of Object.entries(decoded.topics || {})) {
    const ex = cur.topics[t] || { seen: 0, correct: 0 };
    cur.topics[t] = {
      seen: Math.max(ex.seen, ts.seen || 0),
      correct: Math.max(ex.correct, ts.correct || 0),
    };
  }
  cur.quizzes = Math.max(cur.quizzes, decoded.quizzes || 0);
  if (!saveProgress(cur)) {
    return { ok: false, error: "localStorage write failed." };
  }
  return { ok: true, mergedCount };
}
