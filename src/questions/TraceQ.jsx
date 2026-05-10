import React, { useEffect, useState } from "react";
import { LETTERS } from "../lib.js";

export default function TraceQ({ q, locked, picked, onPick }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [phase, setPhase] = useState("trace"); // trace -> question

  const totalSteps = q.steps.length;
  const cur = q.steps[stepIdx] || q.steps[0];
  const traceDone = stepIdx >= totalSteps - 1;

  useEffect(() => { if (locked) setPhase("question"); }, [locked]);

  function next() { if (stepIdx < totalSteps - 1) setStepIdx(stepIdx + 1); }
  function prev() { if (stepIdx > 0) setStepIdx(stepIdx - 1); }

  if (phase === "trace") {
    return (
      <div className="qz-fadein">
        <div className="qz-section-header">{q.title}</div>
        <div className="qz-trace-grid">
          <div className="qz-panel" style={{ padding: "10px 0", overflowX: "auto" }}>
            {q.code.map((line, i) => (
              <div key={i} className={"qz-trace-line" + (cur.line === i ? " active" : "")}>
                <span className="qz-line-num">{String(i).padStart(2, " ")}</span>
                {line || " "}
              </div>
            ))}
          </div>
          <div className="qz-panel qz-vars">
            <div className="qz-uppercase" style={{ fontSize: "0.7rem", color: "var(--ink-mute)", marginBottom: 6 }}>
              Variables
            </div>
            {Object.entries(cur.vars).map(([k, v]) => (
              <div key={k} className="qz-var-row">
                <span className="qz-var-name">{k}</span>
                <span className="qz-var-val">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, gap: 12 }}>
          <button className="qz-btn qz-btn-ghost" onClick={prev} disabled={stepIdx === 0}>◄ Back</button>
          <div className="qz-mono" style={{ color: "var(--ink-dim)", fontSize: "0.85rem" }}>
            STEP {stepIdx + 1} / {totalSteps}
          </div>
          {!traceDone ? (
            <button className="qz-btn qz-btn-primary" onClick={next}>Next ►</button>
          ) : (
            <button className="qz-btn qz-btn-primary" onClick={() => setPhase("question")}>Answer ►</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="qz-fadein">
      <div className="qz-section-header">{q.title} — Result</div>
      <div className="qz-panel" style={{ padding: "10px 0", marginBottom: 14, opacity: 0.7 }}>
        {q.code.map((line, i) => (
          <div key={i} className="qz-trace-line">
            <span className="qz-line-num">{String(i).padStart(2, " ")}</span>
            {line || " "}
          </div>
        ))}
      </div>
      <div style={{ fontSize: "1.05rem", lineHeight: 1.45, fontWeight: 600, marginBottom: 14 }}>
        {q.question}
      </div>
      <div className="qz-mc-grid">
        {q.options.map((opt, i) => {
          let cls = "qz-mc-option";
          if (locked) {
            cls += " disabled";
            if (i === q.answer)       cls += " correct";
            else if (i === picked)    cls += " wrong";
            else                      cls += " dimmed";
          }
          return (
            <div key={i} className={cls} onClick={() => !locked && onPick(i)}>
              <div className="qz-mc-letter">{LETTERS[i]}</div>
              <div>{opt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
