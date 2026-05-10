import React from "react";

export default function BooleanQ({ q, locked, picked, onPick }) {
  return (
    <div className="qz-fadein">
      <div style={{ textAlign: "center", padding: "20px 10px" }}>
        <div className="qz-uppercase" style={{ fontSize: "0.72rem", color: "var(--ink-mute)", marginBottom: 10 }}>
          Evaluate
        </div>
        <div className="qz-mono" style={{ fontSize: "1.9rem", fontWeight: 700, color: "var(--ink)" }}>
          {q.expression}
        </div>
      </div>
      <div className="qz-bool-btns">
        {["true", "false"].map((v) => {
          let cls = `qz-bool-btn qz-bool-${v}`;
          if (locked) {
            cls += " disabled";
            if (picked === v) {
              cls += picked === q.answer ? " selected correct" : " selected wrong";
            }
          }
          return (
            <button key={v} className={cls} onClick={() => !locked && onPick(v)}>
              {v.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
