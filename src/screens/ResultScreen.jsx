import { useEffect, useState } from "react";
import { TOPICS } from "../data/topics.js";
import { LETTERS } from "../lib.js";

export default function ResultScreen({ answers, onRestart, onHome }) {
  const total = answers.length;
  const correct = answers.filter(a => a.correct).length;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  // Per-topic breakdown
  const byTopic = {};
  answers.forEach(a => {
    const t = a.q.topic;
    if (!byTopic[t]) byTopic[t] = { right: 0, total: 0 };
    byTopic[t].total += 1;
    if (a.correct) byTopic[t].right += 1;
  });

  const missed = answers.filter(a => !a.correct);
  const [showMissed, setShowMissed] = useState(missed.length > 0);

  // Animate the score number on mount
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const dur = 900;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimScore(Math.round(pct * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct]);

  // Score ring SVG
  const ringR = 96;
  const circ = 2 * Math.PI * ringR;
  const dash = circ * (animScore / 100);

  let label = "Keep going";
  let labelColor = "var(--ink-dim)";
  if (pct === 100) { label = "Flawless"; labelColor = "var(--lime)"; }
  else if (pct >= 85) { label = "Crushing it"; labelColor = "var(--good)"; }
  else if (pct >= 70) { label = "On track"; labelColor = "var(--blue)"; }
  else if (pct >= 50) { label = "Building up"; labelColor = "var(--orange)"; }
  else { label = "Drill more"; labelColor = "var(--bad)"; }

  // Render each missed question's "your answer" / "correct" pair.
  // When adding new question types, extend this so it shows useful text.
  function describeMissed(m) {
    const q = m.q;
    let yourAnswer = "—";
    let correctAnswer = "—";
    if (q.type === "multiple_choice" || q.type === "trace") {
      yourAnswer = m.picked != null ? `${LETTERS[m.picked]}: ${q.options[m.picked]}` : "(no answer)";
      correctAnswer = `${LETTERS[q.answer]}: ${q.options[q.answer]}`;
    } else if (q.type === "boolean") {
      yourAnswer = String(m.picked).toUpperCase();
      correctAnswer = String(q.answer).toUpperCase();
    } else if (q.type === "binary") {
      yourAnswer = `${m.picked.value}`;
      correctAnswer = `${q.target}`;
    } else if (q.type === "bug_hunt") {
      yourAnswer = `Line ${m.picked.line}, ${LETTERS[m.picked.type] ?? "?"}`;
      correctAnswer = `Line ${q.buggyLine}, ${LETTERS[q.answer]}: ${q.options[q.answer]}`;
    } else if (q.type === "build_loop") {
      yourAnswer = "Wrong order";
      correctAnswer = "See blocks above";
    }
    return { yourAnswer, correctAnswer };
  }

  return (
    <div className="qz-fadein">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <button className="qz-btn qz-btn-ghost" onClick={onHome}>◄ Home</button>
      </div>

      <div className="qz-uppercase" style={{ textAlign: "center", color: "var(--blue)", fontSize: "0.78rem", marginBottom: 6 }}>
        Run Complete
      </div>
      <h2 className="qz-display" style={{
        textAlign: "center",
        fontSize: "clamp(2rem, 5vw, 3rem)",
        margin: "0 0 28px",
        color: labelColor,
      }}>
        {label}
      </h2>

      {/* Score ring */}
      <div className="qz-score-ring">
        <svg viewBox="0 0 220 220" width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id="scoregrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="60%" stopColor="#ff2db7" />
              <stop offset="100%" stopColor="#c4ff00" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r={ringR} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
          <circle
            cx="110" cy="110" r={ringR}
            fill="none"
            stroke="url(#scoregrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ filter: "drop-shadow(0 0 12px rgba(0, 212, 255, 0.6))" }}
          />
        </svg>
        <div className="qz-score-num">
          <div className="qz-score-big">{animScore}%</div>
          <div className="qz-score-frac">{correct} / {total}</div>
        </div>
      </div>

      {/* Per-topic breakdown */}
      <div style={{ marginTop: 36 }}>
        <div className="qz-section-header" style={{ marginBottom: 14 }}>By Topic</div>
        <div className="qz-panel" style={{ padding: "14px 20px" }}>
          {Object.entries(byTopic)
            .sort(([, a], [, b]) => (a.right / a.total) - (b.right / b.total))
            .map(([k, v]) => {
              const tpct = (v.right / v.total) * 100;
              const t = TOPICS[k];
              return (
                <div key={k} className="qz-topic-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="qz-chip-dot" style={{ background: t.color }}></div>
                    <span className="qz-uppercase" style={{ fontSize: "0.72rem" }}>{t.short}</span>
                  </div>
                  <div className="qz-topic-bar">
                    <div className="qz-topic-bar-fill" style={{
                      width: `${tpct}%`,
                      background: tpct >= 75 ? "linear-gradient(90deg, var(--good), var(--lime))" :
                                  tpct >= 50 ? "linear-gradient(90deg, var(--blue), var(--pink))" :
                                              "linear-gradient(90deg, var(--bad), var(--orange))",
                    }}></div>
                  </div>
                  <div className="qz-mono" style={{ fontSize: "0.85rem", textAlign: "right", color: "var(--ink-dim)" }}>
                    {v.right}/{v.total}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Missed review */}
      {missed.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="qz-section-header" style={{ margin: 0 }}>
              {missed.length} Missed — Review
            </div>
            <button className="qz-btn qz-btn-ghost" onClick={() => setShowMissed(!showMissed)}>
              {showMissed ? "Hide" : "Show"}
            </button>
          </div>
          {showMissed && (
            <div>
              {missed.map((m, i) => {
                const q = m.q;
                const t = TOPICS[q.topic];
                const { yourAnswer, correctAnswer } = describeMissed(m);
                return (
                  <div key={i} className="qz-missed-card">
                    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span className="qz-chip" style={{ fontSize: "0.62rem" }}>
                        <span className="qz-chip-dot" style={{ background: t.color }}></span>
                        {t.short}
                      </span>
                      <span className="qz-chip" style={{ fontSize: "0.62rem", background: "rgba(255,255,255,0.04)" }}>
                        {q.type.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="qz-missed-q">
                      {q.question || q.expression || q.title || (q.type === "binary" ? `Target: ${q.target}` : "")}
                    </div>
                    {q.code && Array.isArray(q.code) && (
                      <div className="qz-code" style={{ fontSize: "0.82rem", marginBottom: 8 }}>
                        {q.code.join("\n")}
                      </div>
                    )}
                    {q.code && typeof q.code === "string" && (
                      <div className="qz-code" style={{ fontSize: "0.82rem", marginBottom: 8 }}>{q.code}</div>
                    )}
                    <div className="qz-missed-meta">
                      <span style={{ color: "var(--bad)" }}>Your answer:</span> {yourAnswer}
                      <span style={{ margin: "0 10px", color: "var(--ink-mute)" }}>·</span>
                      <span style={{ color: "var(--good)" }}>Correct:</span> {correctAnswer}
                    </div>
                    <div className="qz-missed-body">{q.explanation}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 36, flexWrap: "wrap" }}>
        <button className="qz-btn qz-btn-primary" onClick={onRestart}>
          ► Run Again
        </button>
        <button className="qz-btn qz-btn-pink" onClick={onHome}>
          New Length
        </button>
      </div>
    </div>
  );
}
