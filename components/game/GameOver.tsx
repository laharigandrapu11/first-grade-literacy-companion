"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSpeech } from "@/lib/useSpeech";
import { useSound } from "@/lib/useSound";

type GameMode = "LETTERS" | "WORDS" | "BOOKS";

const MODE_LABELS: Record<GameMode, string> = {
  LETTERS: "Letters",
  WORDS: "Words",
  BOOKS: "Books",
};

interface GameOverProps {
  score: number;
  maxScore: number;
  duration: number;
  studentName: string;
  mode: GameMode;
  onPlayAgain: () => void;
}

function getStars(score: number, maxScore: number): number {
  const pct = score / maxScore;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

const MESSAGES = [
  { text: "Keep trying! You can do it!", bg: "bg-orange-200 border-orange-400", text2: "text-orange-800" },
  { text: "Good try! You are learning!", bg: "bg-blue-200 border-blue-400", text2: "text-blue-800" },
  { text: "Great job! You are a star!", bg: "bg-green-200 border-green-400", text2: "text-green-800" },
  { text: "WOW! You are amazing!", bg: "bg-yellow-200 border-yellow-400", text2: "text-yellow-800" },
];

const CONFETTI_EMOJIS = ["🎉", "⭐", "🌟", "🎈", "✨", "🏆", "💫", "🌈"];

export default function GameOver({
  score,
  maxScore,
  duration,
  studentName,
  mode,
  onPlayAgain,
}: GameOverProps) {
  const router = useRouter();
  const { speak } = useSpeech();
  const { playFanfare, playDing, playClick } = useSound();
  const stars = getStars(score, maxScore);
  const pct = Math.round((score / maxScore) * 100);
  const msg = MESSAGES[stars];

  useEffect(() => {
    // Play sound first, then speech
    if (stars === 3) {
      playFanfare();
    } else if (stars >= 1) {
      setTimeout(() => playDing(), 300);
    }
    setTimeout(() => {
      if (stars >= 2) {
        speak(`Amazing ${studentName}! You got ${score} out of ${maxScore}! ${msg.text}`);
      } else {
        speak(`Good try ${studentName}! You got ${score} out of ${maxScore}! ${msg.text}`);
      }
    }, stars === 3 ? 1200 : 600);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #fef9c3 0%, #fce7f3 40%, #dbeafe 100%)" }}
    >
      {/* Confetti */}
      {CONFETTI_EMOJIS.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl pointer-events-none select-none"
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 90}%`,
          }}
          initial={{ y: -60, opacity: 0, rotate: 0 }}
          animate={{
            y: ["0%", "110vh"],
            opacity: [0, 1, 1, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: i * 0.2,
            ease: "easeIn",
          }}
        >
          {emoji}
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="text-center max-w-md w-full z-10"
      >
        {/* Stars */}
        <div className="flex justify-center gap-3 mb-5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: i < stars ? 1.2 : 0.7, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.2, type: "spring", bounce: 0.6 }}
              className={`text-6xl ${i < stars ? "opacity-100" : "opacity-20"}`}
            >
              ⭐
            </motion.span>
          ))}
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black mb-2"
          style={{ color: "#7c3aed", textShadow: "3px 3px 0 #c4b5fd" }}
        >
          {stars >= 2 ? "Well done!" : "Nice try!"} {studentName}!
        </motion.h1>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", bounce: 0.4 }}
          className={`${msg.bg} ${msg.text2} border-4 rounded-2xl px-6 py-3 inline-block mb-6 font-black text-xl`}
        >
          {msg.text}
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl border-4 border-violet-200 p-6 mb-7 grid grid-cols-3 gap-4"
        >
          <div className="text-center">
            <p className="text-5xl font-black text-violet-700">{score}</p>
            <p className="text-sm font-bold text-slate-500 mt-1">Score</p>
          </div>
          <div className="text-center border-x-2 border-slate-100">
            <p className="text-5xl font-black text-amber-600">{pct}%</p>
            <p className="text-sm font-bold text-slate-500 mt-1">Correct</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-black text-green-600">
              {minutes > 0 ? `${minutes}m` : `${seconds}s`}
            </p>
            <p className="text-sm font-bold text-slate-500 mt-1">Time</p>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.06, rotate: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => { playClick(); onPlayAgain(); }}
            className="bg-violet-400 hover:bg-violet-500 border-4 border-violet-600 text-white font-black text-xl px-9 py-4 rounded-3xl shadow-xl"
          >
            Play Again!
          </motion.button>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.06, rotate: 1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => { playClick(); router.push("/play"); }}
            className="bg-white hover:bg-slate-50 border-4 border-slate-200 text-slate-700 font-black text-xl px-9 py-4 rounded-3xl shadow-xl"
          >
            Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
