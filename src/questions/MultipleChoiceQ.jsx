import React from "react";
import { LETTERS } from "../lib.js";

export default function MultipleChoiceQ({ q, locked, picked, onPick }) {
  return (
    <div className="qz-fadein">
      <div style={{ fontSize: "1.15rem", lineHeight: 1.45, fontWeight: 600, marginBottom: 14 }}>
        {q.question}
      </div>
      {q.code && <div className="qz-code" style={{ marginBottom: 18 }}>{q.code}</div>}
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
