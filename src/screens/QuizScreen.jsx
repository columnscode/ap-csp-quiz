import { useState } from "react";
import { TOPICS } from "../data/topics.js";
import { evaluateAnswer } from "../lib.js";
import QuestionRenderer from "../questions/QuestionRenderer.jsx";

export default function QuizScreen({ deck, onFinish, onExit }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // { qIdx, picked, correct, q }
  const [picked, setPicked] = useState(null);
  const [locked, setLocked] = useState(false);

  const q = deck[idx];
  const topic = TOPICS[q.topic];

  function handleAnswer(submitted) {
    if (locked) return;
    const correct = evaluateAnswer(q, submitted);
    setPicked(submitted);
    setLocked(true);
    setAnswers([...answers, { qIdx: idx, picked: submitted, correct, q }]);
  }

  function next() {
    if (idx + 1 >= deck.length) {
      onFinish(answers);
    } else {
      setIdx(idx + 1);
      setPicked(null);
      setLocked(false);
    }
  }

  const progress = ((idx + (locked ? 1 : 0)) / deck.length) * 100;
  const isLast = idx + 1 >= deck.length;

  return (
    <div className="qz-fadein" key={idx}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button className="qz-btn qz-btn-ghost" onClick={onExit}>◄ Exit</button>
        <div className="qz-mono qz-uppercase" style={{ fontSize: "0.78rem", color: "var(--ink-dim)" }}>
          {idx + 1} / {deck.length}
        </div>
      </div>
      <div className="qz-progress-track" style={{ marginBottom: 24 }}>
        <div className="qz-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Topic chip */}
      <div style={{ marginBottom: 18 }}>
        <span className="qz-chip">
          <span className="qz-chip-dot" style={{ background: topic.color }}></span>
          {topic.name}
        </span>
      </div>

      {/* Question card */}
      <div className="qz-panel" style={{ padding: "26px 26px 24px" }}>
        <QuestionRenderer
          key={idx}
          q={q}
          locked={locked}
          picked={picked}
          onAnswer={handleAnswer}
        />

        {locked && (() => {
          const last = answers[answers.length - 1];
          const isCorrect = last && last.correct;
          return (
            <>
              <div className={"qz-feedback " + (isCorrect ? "good" : "bad")}>
                <div className="qz-feedback-title">
                  {isCorrect ? "✓ Correct" : "✗ Not quite"}
                </div>
                <div>{q.explanation}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
                <button className="qz-btn qz-btn-primary" onClick={next}>
                  {isLast ? "See Results ►" : "Next ►"}
                </button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
