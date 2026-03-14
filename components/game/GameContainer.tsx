"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LetterMode from "./LetterMode";
import WordMode from "./WordMode";
import BookMode from "./BookMode";
import GameOver from "./GameOver";
import { useSound } from "@/lib/useSound";

type GameMode = "LETTERS" | "WORDS" | "BOOKS";

interface Assignment {
  id: string;
  mode: GameMode;
  targetScore: number | null;
  material: {
    id: string;
    title: string;
    content: unknown;
  } | null;
}

export default function GameContainer() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const studentId = searchParams.get("studentId") ?? "";
  const studentName = searchParams.get("studentName") ?? "Friend";

  const { playClick } = useSound();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<"pick" | "playing" | "done">("pick");
  const [finalScore, setFinalScore] = useState({ score: 0, maxScore: 0, duration: 0 });

  useEffect(() => {
    if (!studentId) {
      router.push("/play");
      return;
    }

    fetch(`/api/play/assignment?studentId=${studentId}`)
      .then((r) => r.json())
      .then((data) => {
        setAssignment(data.assignment ?? null);
        setLoading(false);
      });
  }, [studentId, router]);

  function startGame(mode: GameMode) {
    setSelectedMode(mode);
    setGameState("playing");
  }

  async function endGame(score: number, maxScore: number, duration: number) {
    setFinalScore({ score, maxScore, duration });
    setGameState("done");

    await fetch("/api/game-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        mode: selectedMode,
        score,
        maxScore,
        duration,
        completed: score >= maxScore * 0.6,
        assignmentId: assignment?.id ?? null,
      }),
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
        <div className="text-5xl animate-bounce">📚</div>
      </div>
    );
  }

  if (gameState === "done") {
    return (
      <GameOver
        score={finalScore.score}
        maxScore={finalScore.maxScore}
        duration={finalScore.duration}
        studentName={studentName}
        mode={selectedMode!}
        onPlayAgain={() => {
          setGameState("pick");
          setSelectedMode(null);
        }}
      />
    );
  }

  if (gameState === "playing" && selectedMode) {
    const material = assignment?.mode === selectedMode ? assignment.material : null;

    if (selectedMode === "LETTERS") {
      return <LetterMode onComplete={endGame} studentName={studentName} />;
    }
    if (selectedMode === "WORDS") {
      return (
        <WordMode
          onComplete={endGame}
          studentName={studentName}
          material={material as { content: { words: { word: string; emoji: string }[] } } | null}
        />
      );
    }
    if (selectedMode === "BOOKS") {
      return (
        <BookMode
          onComplete={endGame}
          studentName={studentName}
          material={
            material as {
              title: string;
              content: {
                pages: { text: string; vocabularyWords: string[] }[];
                questions: { question: string; options: string[]; answer: number }[];
              };
            } | null
          }
        />
      );
    }
  }

  // Mode selection screen
  const suggestedMode: GameMode = assignment?.mode ?? "LETTERS";

  const MODES: { mode: GameMode; emoji: string; label: string; desc: string; bg: string; border: string; text: string }[] = [
    {
      mode: "LETTERS",
      emoji: "🔤",
      label: "Letters",
      desc: "Match the letters!",
      bg: "bg-sky-300 hover:bg-sky-400",
      border: "border-sky-500",
      text: "text-sky-900",
    },
    {
      mode: "WORDS",
      emoji: "📝",
      label: "Words",
      desc: "Find the right word!",
      bg: "bg-green-300 hover:bg-green-400",
      border: "border-green-500",
      text: "text-green-900",
    },
    {
      mode: "BOOKS",
      emoji: "📖",
      label: "Books",
      desc: "Read a story!",
      bg: "bg-purple-300 hover:bg-purple-400",
      border: "border-purple-500",
      text: "text-purple-900",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #fef9c3 0%, #fce7f3 40%, #dbeafe 100%)" }}
    >
      {/* Floating decorations */}
      {["🌟", "💫", "✨", "🎉"].map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none opacity-20 select-none"
          style={{ top: `${15 + i * 18}%`, left: i % 2 === 0 ? "5%" : "90%" }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {e}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-center mb-10 z-10"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-7xl mb-3 inline-block"
        >
          👋
        </motion.div>
        <h1
          className="text-5xl font-black mb-1"
          style={{ color: "#7c3aed", textShadow: "3px 3px 0 #c4b5fd" }}
        >
          Hi, {studentName}!
        </h1>
        <p className="text-2xl font-bold text-pink-500 mt-1">What do you want to play?</p>
        {assignment && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 inline-block bg-amber-300 text-amber-900 rounded-full px-5 py-2 text-base font-black border-2 border-amber-500 shadow"
          >
            ⭐ Teacher says: {MODES.find((m) => m.mode === assignment.mode)?.label} today!
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full z-10">
        {MODES.map((m, i) => (
          <motion.button
            key={m.mode}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.07, rotate: i % 2 === 0 ? 2 : -2 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => { playClick(); startGame(m.mode); }}
            className={`${m.bg} ${m.text} border-4 ${m.border} rounded-3xl p-7 shadow-xl relative overflow-hidden transition-colors`}
          >
            {m.mode === suggestedMode && assignment && (
              <div className="absolute top-3 right-3 bg-white/60 rounded-full px-2 py-0.5 text-xs font-black">
                Today!
              </div>
            )}
            <div className="text-6xl mb-3">{m.emoji}</div>
            <p className="font-black text-2xl">{m.label}</p>
            <p className="text-sm font-bold opacity-70 mt-1">{m.desc}</p>
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { playClick(); router.push("/play"); }}
        className="mt-10 bg-white text-violet-600 font-black px-6 py-3 rounded-2xl shadow border-2 border-violet-200 z-10"
      >
        Back
      </motion.button>
    </div>
  );
}
