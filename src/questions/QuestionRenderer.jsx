import React from "react";
import MultipleChoiceQ from "./MultipleChoiceQ.jsx";
import BooleanQ from "./BooleanQ.jsx";
import BinaryQ from "./BinaryQ.jsx";
import BugHuntQ from "./BugHuntQ.jsx";
import TraceQ from "./TraceQ.jsx";
import BuildLoopQ from "./BuildLoopQ.jsx";
import MatchPairsQ from "./MatchPairsQ.jsx";
import FillInBlankQ from "./FillInBlankQ.jsx";
import ClickToLocateBugQ from "./ClickToLocateBugQ.jsx";
import OrderStepsQ from "./OrderStepsQ.jsx";

/**
 * Routes a question to the right type-specific renderer.
 * All renderers receive the same props: { q, locked, picked, onAnswer }.
 *
 * To add a new question type:
 *   1. Make src/questions/<NewType>Q.jsx
 *   2. Import it here and add a case below.
 *   3. Add a correctness branch in QuizScreen.handleAnswer.
 *   4. Add a missed-question display branch in ResultScreen.MissedCard.
 */
export default function QuestionRenderer({ q, locked, picked, onAnswer }) {
  const props = { q, locked, picked, onPick: onAnswer, onSubmit: onAnswer };
  switch (q.type) {
    case "multiple_choice":     return <MultipleChoiceQ {...props} />;
    case "boolean":             return <BooleanQ {...props} />;
    case "binary":              return <BinaryQ {...props} />;
    case "bug_hunt":            return <BugHuntQ {...props} />;
    case "trace":               return <TraceQ {...props} />;
    case "build_loop":          return <BuildLoopQ {...props} />;
    case "match_pairs":         return <MatchPairsQ {...props} />;
    case "fill_in_blank":       return <FillInBlankQ {...props} />;
    case "click_to_locate_bug": return <ClickToLocateBugQ {...props} />;
    case "order_steps":         return <OrderStepsQ {...props} />;
    default:
      return <div>Unknown question type: {q.type}</div>;
  }
}
