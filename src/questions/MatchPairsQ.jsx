import React, { useState } from "react";

// Tap a left item, then tap a right item to pair them. Tap an already-paired
// item to unpair. When every left has a pair, hit Submit. Designed for touch
// (no drag/drop), since the student studies on his phone.
export default function MatchPairsQ({ q, locked, picked, onSubmit }) {
  const [pairs, setPairs] = useState({});       // { leftIdx: rightIdx, ... }
  const [activeLeft, setActiveLeft] = useState(null);

  const livePairs = locked && picked?.pairs ? picked.pairs : pairs;

  // For each right index, find which left points at it (or null). Used to
  // dim taken right cells and to support tap-to-unpair from either side.
  const rightOwner = {};
  for (const [l, r] of Object.entries(livePairs)) rightOwner[r] = Number(l);

  function handleLeft(i) {
    if (locked) return;
    if (i in pairs) {
      const next = { ...pairs };
      delete next[i];
      setPairs(next);
      setActiveLeft(null);
      return;
    }
    setActiveLeft(i === activeLeft ? null : i);
  }

  function handleRight(j) {
    if (locked) return;
    if (activeLeft == null) {
      // No left selected — if this right is already taken, allow unpairing
      // by tapping it.
      const owner = rightOwner[j];
      if (owner != null) {
        const next = { ...pairs };
        delete next[owner];
        setPairs(next);
      }
      return;
    }
    // Auto-unpair any other left currently using this right.
    const next = { ...pairs };
    const owner = rightOwner[j];
    if (owner != null && owner !== activeLeft) delete next[owner];
    next[activeLeft] = j;
    setPairs(next);
    setActiveLeft(null);
  }

  function submit() {
    const answer = q.answer;
    const correct = answer.every((rIdx, lIdx) => pairs[lIdx] === rIdx);
    onSubmit({ pairs: { ...pairs }, correct });
  }

  const allPaired = q.left.every((_, i) => i in pairs);

  return (
    <div className="qz-fadein">
      <div style={{ fontSize: "1.05rem", lineHeight: 1.45, fontWeight: 600, marginBottom: 16 }}>
        {q.prompt}
      </div>
      <div className="qz-match-grid">
        <div className="qz-match-col">
          {q.left.map((item, i) => {
            const pairedTo = livePairs[i];
            const correctTo = q.answer[i];
            let cls = "qz-match-cell qz-match-left";
            if (locked) {
              cls += " disabled";
              if (pairedTo === correctTo) cls += " correct";
              else cls += " wrong";
            } else if (i === activeLeft) {
              cls += " active";
            } else if (pairedTo != null) {
              cls += " paired";
            }
            return (
              <div key={i} className={cls} onClick={() => handleLeft(i)}>
                <span className="qz-match-letter">{i + 1}</span>
                <span className="qz-match-text">{item}</span>
                {pairedTo != null && (
                  <span className="qz-match-tag">↦ {labelFor(pairedTo)}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="qz-match-col">
          {q.right.map((item, j) => {
            const taken = rightOwner[j] != null;
            let cls = "qz-match-cell qz-match-right";
            if (locked) {
              cls += " disabled";
              // Correct positions on the right side: highlight when this right
              // is paired correctly with its left.
              if (taken && q.answer[rightOwner[j]] === j) cls += " correct";
              else if (taken) cls += " wrong";
            } else if (taken) {
              cls += " paired";
            }
            return (
              <div key={j} className={cls} onClick={() => handleRight(j)}>
                <span className="qz-match-letter">{labelFor(j)}</span>
                <span className="qz-match-text">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
      {!locked && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button className="qz-btn qz-btn-primary" disabled={!allPaired} onClick={submit}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

// Right-side labels: A, B, C, ... for visual distinction from the numbered left.
function labelFor(idx) {
  return String.fromCharCode(65 + idx);
}
