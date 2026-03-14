"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/lib/useSound";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TOTAL_ROUNDS = 10;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getOptions(correct: string): string[] {
  const others = shuffle(LETTERS.filter((l) => l !== correct)).slice(0, 3);
  return shuffle([correct, ...others]);
}

interface LetterModeProps {
  onComplete: (score: number, maxScore: number, duration: number) => void;
  studentName: string;
}

const OPTION_STYLES = [
  { bg: "bg-yellow-200 hover:bg-yellow-300 border-yellow-400", text: "text-yellow-900" },
  { bg: "bg-pink-200 hover:bg-pink-300 border-pink-400", text: "text-pink-900" },
  { bg: "bg-sky-200 hover:bg-sky-300 border-sky-400", text: "text-sky-900" },
  { bg: "bg-green-200 hover:bg-green-300 border-green-400", text: "text-green-900" },
];

export default function LetterMode({ onComplete, studentName }: LetterModeProps) {
  const { playDing, playBuzz, playClick } = useSound();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentLetter, setCurrentLetter] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [showLowercase, setShowLowercase] = useState(false);

  const nextRound = useCallback((roundNum: number) => {
    const letter = shuffle(LETTERS)[0];
    setCurrentLetter(letter);
    setOptions(getOptions(letter));
    setFeedback(null);
    setSelectedOption(null);
    setShowLowercase(roundNum > 4);
  }, []);

  useEffect(() => {
    nextRound(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnswer(option: string) {
    if (feedback) return;
    setSelectedOption(option);
    const correct = option === currentLetter;
    setFeedback(correct ? "correct" : "wrong");

    if (correct) {
      playDing();
      setScore((s) => s + 1);
    } else {
      playBuzz();
    }

    setTimeout(() => {
      const nextRoundNum = round + 1;
      if (nextRoundNum >= TOTAL_ROUNDS) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        onComplete(correct ? score + 1 : score, TOTAL_ROUNDS, duration);
      } else {
        setRound(nextRoundNum);
        nextRound(nextRoundNum);
      }
    }, 1200);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #bfdbfe 0%, #e0f2fe 50%, #f0fdf4 100%)" }}
    >
      {["⭐", "💫", "✨"].map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none opacity-20 select-none"
          style={{ top: `${20 + i * 25}%`, left: i % 2 === 0 ? "4%" : "92%" }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2 + i, repeat: Infinity }}
        >
          {e}
        </motion.div>
      ))}

      {/* Progress */}
      <div className="w-full max-w-lg mb-8 z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-sky-700 text-lg">{round + 1} of {TOTAL_ROUNDS}</span>
          <span className="font-black text-amber-600 text-lg">⭐ {score}</span>
        </div>
        <div className="h-5 bg-white/60 rounded-full overflow-hidden border-2 border-sky-300 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
            animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Letter display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLetter + round}
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 15 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="mb-6 z-10 flex flex-col items-center gap-3"
        >
          <div className="w-44 h-44 bg-white rounded-3xl shadow-2xl border-4 border-sky-300 flex items-center justify-center">
            <span className="text-9xl font-black text-sky-600 leading-none">{currentLetter}</span>
          </div>
          {showLowercase && (
            <div className="w-32 h-14 bg-sky-50 rounded-2xl border-2 border-sky-200 flex items-center justify-center">
              <span className="text-4xl font-black text-sky-400">{currentLetter.toLowerCase()}</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <p className="text-xl font-black text-sky-700 mb-6 z-10">
        {showLowercase ? "Find the same letter! 🔍" : "Tap this letter! 👇"}
      </p>

      {/* Feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            exit={{ scale: 0 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <span className="text-9xl drop-shadow-2xl">{feedback === "correct" ? "🌟" : "💪"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-2 gap-5 w-full max-w-md z-10">
        {options.map((option, i) => {
          const style = OPTION_STYLES[i];
          let extraBg = `${style.bg} ${style.text}`;

          if (selectedOption === option) {
            extraBg = feedback === "correct"
              ? "bg-green-300 border-green-500 text-green-900"
              : "bg-red-300 border-red-500 text-red-900";
          } else if (feedback === "wrong" && option === currentLetter) {
            extraBg = "bg-green-300 border-green-500 text-green-900";
          }

          return (
            <motion.button
              key={option}
              whileHover={!feedback ? { scale: 1.06, rotate: i % 2 === 0 ? 2 : -2 } : {}}
              whileTap={!feedback ? { scale: 0.93 } : {}}
              onClick={() => { playClick(); handleAnswer(option); }}
              disabled={!!feedback}
              className={`${extraBg} border-4 rounded-3xl p-6 text-6xl font-black shadow-lg transition-colors`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
