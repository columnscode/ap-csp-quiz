import React, { useState } from "react";
import { pickQuestions } from "./lib.js";
import { recordSession } from "./progress.js";
import HomeScreen from "./screens/HomeScreen.jsx";
import QuizScreen from "./screens/QuizScreen.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";

/**
 * Three-screen state machine: home → quiz → result → (home or quiz again).
 * No router lib — just a `screen` string. Keeps things simple.
 */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [deck, setDeck] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [lastLength, setLastLength] = useState(10);

  function start(n) {
    setLastLength(n);
    setDeck(pickQuestions(n));
    setAnswers([]);
    setScreen("quiz");
  }

  function finish(allAnswers) {
    recordSession(allAnswers);
    setAnswers(allAnswers);
    setScreen("result");
  }

  function restart() {
    setDeck(pickQuestions(lastLength));
    setAnswers([]);
    setScreen("quiz");
  }

  return (
    <div className="qz-root">
      <div className="qz-shell">
        {screen === "home" && <HomeScreen onStart={start} />}
        {screen === "quiz" && (
          <QuizScreen
            deck={deck}
            onFinish={finish}
            onExit={() => setScreen("home")}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            answers={answers}
            onRestart={restart}
            onHome={() => setScreen("home")}
          />
        )}
      </div>
    </div>
  );
}
