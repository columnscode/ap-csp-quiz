import React, { useState } from "react";

// Code with {{N}} placeholders. Each placeholder is filled by a dropdown
// pick from a small option set. Native <select> is used because it gives a
// proper iOS picker on phones.
export default function FillInBlankQ({ q, locked, picked, onSubmit }) {
  const [chosen, setChosen] = useState(() => q.blanks.map(() => null));

  const live = locked && picked?.picked ? picked.picked : chosen;
  const allFilled = live.every((v) => v != null);

  function handleChange(blankIdx, value) {
    if (locked) return;
    const v = value === "" ? null : Number(value);
    const next = [...chosen];
    next[blankIdx] = v;
    setChosen(next);
  }

  function submit() {
    const correct = q.blanks.every((b, i) => chosen[i] === b.answer);
    onSubmit({ picked: [...chosen], correct });
  }

  return (
    <div className="qz-fadein">
      <div style={{ fontSize: "1.05rem", lineHeight: 1.45, fontWeight: 600, marginBottom: 14 }}>
        {q.question}
      </div>
      <div className="qz-code qz-fib-code">
        {q.code.map((line, i) => (
          <div key={i} className="qz-fib-line">
            {renderLine(line, q.blanks, live, locked, handleChange)}
          </div>
        ))}
      </div>
      {!locked && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button className="qz-btn qz-btn-primary" disabled={!allFilled} onClick={submit}>
            Submit
          </button>
        </div>
      )}
      {locked && (
        <div className="qz-fib-summary">
          {q.blanks.map((b, i) => {
            const isRight = live[i] === b.answer;
            return (
              <div key={i} className={"qz-fib-row " + (isRight ? "good" : "bad")}>
                <span className="qz-fib-tag">Blank {i + 1}</span>
                <span>
                  Picked: <code>{live[i] != null ? b.options[live[i]] : "—"}</code>
                  {!isRight && <> · Correct: <code>{b.options[b.answer]}</code></>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Splits a line on {{N}} tokens, alternating between text spans and selects.
function renderLine(line, blanks, live, locked, onChange) {
  const parts = line.split(/(\{\{\d+\}\})/g);
  return parts.map((p, i) => {
    const m = p.match(/^\{\{(\d+)\}\}$/);
    if (!m) return <span key={i}>{p}</span>;
    const blankIdx = Number(m[1]);
    const blank = blanks[blankIdx];
    if (!blank) return <span key={i}>{p}</span>;
    const v = live[blankIdx];
    let cls = "qz-fib-select";
    if (locked) cls += v === blank.answer ? " good" : " bad";
    return (
      <select
        key={i}
        className={cls}
        value={v == null ? "" : v}
        onChange={(e) => onChange(blankIdx, e.target.value)}
        disabled={locked}
      >
        <option value="">▾ pick…</option>
        {blank.options.map((opt, oi) => (
          <option key={oi} value={oi}>{opt}</option>
        ))}
      </select>
    );
  });
}
