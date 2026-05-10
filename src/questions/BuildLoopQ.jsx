import React, { useEffect, useState } from "react";
import { shuffle } from "../lib.js";

export default function BuildLoopQ({ q, locked, picked, onSubmit }) {
  // `order` holds ORIGINAL indices in the user's current arrangement.
  // [0,1,2,3] means in-order (correct).
  const [order, setOrder] = useState(() => {
    const idx = q.blocks.map((_, i) => i);
    let shuffled = shuffle(idx);
    if (shuffled.every((v, i) => v === i)) {
      shuffled = [...shuffled.slice(1), shuffled[0]];
    }
    return shuffled;
  });

  useEffect(() => {
    if (locked && picked && picked.order) setOrder(picked.order);
  }, [locked, picked]);

  function move(idx, dir) {
    if (locked) return;
    const newOrder = [...order];
    const target = idx + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
    setOrder(newOrder);
  }

  function submit() {
    const correct = order.every((origIdx, i) => origIdx === i);
    onSubmit({ order, correct });
  }

  return (
    <div className="qz-fadein">
      <div className="qz-section-header">{q.title}</div>
      <div style={{ marginBottom: 12, color: "var(--ink-dim)", fontSize: "0.95rem" }}>
        {q.description}
      </div>
      <div className="qz-blocks">
        {order.map((origIdx, i) => {
          let cls = "qz-block";
          if (locked) cls += origIdx === i ? " correct-pos" : " wrong-pos";
          return (
            <div key={i} className={cls}>
              <button className="qz-block-mover" onClick={() => move(i, -1)} disabled={locked || i === 0}>▲</button>
              <button className="qz-block-mover" onClick={() => move(i, 1)} disabled={locked || i === order.length - 1}>▼</button>
              <div className="qz-block-text">{q.blocks[origIdx]}</div>
            </div>
          );
        })}
      </div>
      {!locked && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button className="qz-btn qz-btn-primary" onClick={submit}>Submit</button>
        </div>
      )}
    </div>
  );
}
