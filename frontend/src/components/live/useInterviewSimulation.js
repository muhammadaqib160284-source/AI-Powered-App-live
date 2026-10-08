import { useEffect, useState } from "react";

const LISTEN_MS = 7000;

// Local simulation of the interview loop (AI speaks → candidate answers → next question).
// Replace with realtime events (AI audio start/end, transcript) when the interview engine is connected.
export function useInterviewSimulation(questions, { running }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("speaking");
  const [chars, setChars] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const text = questions[index]?.text || "";

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (phase === "speaking") {
      if (chars < text.length) {
        const t = setTimeout(() => setChars((c) => c + 1), 32);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("listening"), 900);
      return () => clearTimeout(t);
    }
    if (index >= questions.length - 1) return;
    const t = setTimeout(() => { setIndex((i) => i + 1); setChars(0); setPhase("speaking"); }, LISTEN_MS);
    return () => clearTimeout(t);
  }, [running, phase, chars, text, index, questions.length]);

  return { index, phase, typed: text.slice(0, chars), question: questions[index], elapsed, total: questions.length };
}
