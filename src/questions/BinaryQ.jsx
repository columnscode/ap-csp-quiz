import React, { useEffect, useState } from "react";

export default function BinaryQ({ q, locked, picked, onSubmit }) {
  const [bits, setBits] = useState(Array(8).fill(0));
  const places = [128, 64, 32, 16, 8, 4, 2, 1];
  const cur = bits.reduce((s, b, i) => s + b * places[i], 0);
  const match = cur === q.target;

  useEffect(() => {
    if (locked && picked && picked.bits) setBits(picked.bits);
  }, [locked, picked]);

  function toggle(i) {
    if (locked) return;
    const nb = [...bits];
    nb[i] = nb[i] ? 0 : 1;
    setBits(nb);
  }

  return (
    <div className="qz-fadein">
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div className="qz-uppercase" style={{ fontSize: "0.72rem", color: "var(--ink-mute)" }}>
          Flip the bits to match the target
        </div>
      </div>
      <div className="qz-binary-display">
        <div>
          <div className="qz-uppercase" style={{ fontSize: "0.7rem", color: "var(--ink-mute)" }}>Current</div>
          <div className={"qz-binary-cur" + (match ? " match" : "")}>{cur}</div>
        </div>
        <div style={{ color: "var(--ink-mute)", fontSize: "1.4rem" }}>=</div>
        <div>
          <div className="qz-uppercase" style={{ fontSize: "0.7rem", color: "var(--ink-mute)" }}>Target</div>
          <div className="qz-binary-target">{q.target}</div>
        </div>
      </div>
      <div className="qz-bits">
        {bits.map((b, i) => (
          <div
            key={i}
            className={"qz-bit" + (b ? " on" : "") + (locked ? " disabled" : "")}
            onClick={() => toggle(i)}
          >
            {b}
          </div>
        ))}
      </div>
      <div className="qz-bits" style={{ marginTop: -10 }}>
        {places.map((p, i) => <div key={i} className="qz-place">{p}</div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
        <button
          className="qz-btn qz-btn-primary"
          disabled={locked}
          onClick={() => onSubmit({ bits, value: cur, correct: match })}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
