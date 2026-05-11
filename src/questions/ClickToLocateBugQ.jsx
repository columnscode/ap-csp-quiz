import React, { useState } from "react";

// Simpler variant of bug_hunt: tap the line you think is buggy, get
// immediate feedback. No follow-up "what kind of bug" picker. Use when the
// teaching value is "spot the bug" rather than "name the bug class".
export default function ClickToLocateBugQ({ q, locked, picked, onSubmit }) {
  const [sel, setSel] = useState(null);
  const selectedLine = locked && picked ? picked.line : sel;

  function handleClick(i) {
    if (locked) return;
    setSel(i);
    onSubmit({ line: i, correct: i === q.buggyLine });
  }

  return (
    <div className="qz-fadein">
      <div style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 14 }}>
        {q.question || "Tap the line containing the bug."}
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
            <div key={i} className={cls} onClick={() => handleClick(i)}>
              <span className="qz-line-num">{String(i).padStart(2, " ")}</span>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
