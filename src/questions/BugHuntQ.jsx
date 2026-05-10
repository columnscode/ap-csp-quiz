import React, { useEffect, useState } from "react";
import { LETTERS } from "../lib.js";

export default function BugHuntQ({ q, locked, picked, onSubmit }) {
  const [stage, setStage] = useState("line"); // line -> type
  const [selLineState, setSelLineState] = useState(null);

  // When locked, pull answer values directly from picked snapshot
  // (avoids any first-paint flash with stale local state).
  const selectedLine = locked && picked ? picked.line : selLineState;
  const pickedType   = locked && picked ? picked.type : null;

  useEffect(() => { if (locked) setStage("type"); }, [locked]);

  function handleLineClick(i) {
    if (locked) return;
    setSelLineState(i);
  }
  function confirmLine() {
    if (selLineState === null) return;
    setStage("type");
  }
  function pickType(i) {
    if (locked) return;
    const lineCorrect = selLineState === q.buggyLine;
    const typeCorrect = i === q.answer;
    onSubmit({ line: selLineState, type: i, lineCorrect, typeCorrect, correct: lineCorrect && typeCorrect });
  }

  return (
    <div className="qz-fadein">
      <div style={{ marginBottom: 14, fontWeight: 600 }}>
        {stage === "line" && !locked && "🔎 Click the buggy line:"}
        {stage === "type" && !locked && "Now identify the bug type:"}
        {locked && "Bug Hunt result:"}
      </div>
      <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid var(--border)", borderLeft: "3px solid var(--orange)", padding: "8px 0" }}>
        {q.code.map((line, i) => {
          let cls = "qz-bug-line";
          if (locked) {
            cls += " disabled";
            if (i === q.buggyLine) cls += " bug-actual";
            if (i === selectedLine && i !== q.buggyLine) cls += " bug-wrong";
            if (i === selectedLine && i === q.buggyLine) cls += " bug-correct";
          } else if (i === selectedLine) {
            cls += " selected";
          }
          return (
            <div key={i} className={cls} onClick={() => handleLineClick(i)}>
              <span className="qz-line-num">{String(i).padStart(2, " ")}</span>
              {line}
            </div>
          );
        })}
      </div>

      {stage === "line" && !locked && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button className="qz-btn qz-btn-primary" disabled={selectedLine === null} onClick={confirmLine}>
            Lock In Line
          </button>
        </div>
      )}

      {stage === "type" && (
        <div style={{ marginTop: 18 }}>
          <div className="qz-mc-grid">
            {q.options.map((opt, i) => {
              let cls = "qz-mc-option";
              if (locked) {
                cls += " disabled";
                if (i === q.answer)            cls += " correct";
                else if (i === pickedType)     cls += " wrong";
                else                           cls += " dimmed";
              }
              return (
                <div key={i} className={cls} onClick={() => pickType(i)}>
                  <div className="qz-mc-letter">{LETTERS[i]}</div>
                  <div>{opt}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
