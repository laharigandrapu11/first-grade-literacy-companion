"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/lib/useSound";

const DEFAULT_WORDS = [
  { word: "the", emoji: "👆" },
  { word: "and", emoji: "🔗" },
  { word: "see", emoji: "👀" },
  { word: "run", emoji: "🏃" },
  { word: "cat", emoji: "🐱" },
  { word: "dog", emoji: "🐶" },
  { word: "big", emoji: "🐘" },
  { word: "red", emoji: "🔴" },
  { word: "sun", emoji: "☀️" },
  { word: "fun", emoji: "🎉" },
  { word: "hat", emoji: "🎩" },
  { word: "hop", emoji: "🐸" },
];

const TOTAL_ROUNDS = 10;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface WordItem {
  word: string;
  emoji: string;
}

interface WordModeProps {
  onComplete: (score: number, maxScore: number, duration: number) => void;
  studentName: string;
  material: { content: { words: WordItem[] } } | null;
}

const OPTION_STYLES = [
  "bg-yellow-200 hover:bg-yellow-300 border-yellow-400 text-yellow-900",
  "bg-pink-200 hover:bg-pink-300 border-pink-400 text-pink-900",
  "bg-sky-200 hover:bg-sky-300 border-sky-400 text-sky-900",
  "bg-green-200 hover:bg-green-300 border-green-400 text-green-900",
];

export default function WordMode({ onComplete, studentName, material }: WordModeProps) {
  const { playDing, playBuzz, playClick } = useSound();
  const wordList: WordItem[] = material?.content?.words ?? DEFAULT_WORDS;

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [options, setOptions] = useState<WordItem[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());

  const nextRound = useCallback((used: Set<string>) => {
    const available = wordList.filter((w) => !used.has(w.word));
    const pool = available.length >= 4 ? available : wordList;
    const shuffled = shuffle(pool);
    const correct = shuffled[0];
    const wrong = shuffle(wordList.filter((w) => w.word !== correct.word)).slice(0, 3);
    const allOptions = shuffle([correct, ...wrong]);

    setCurrentWord(correct);
    setOptions(allOptions);
    setFeedback(null);
    setSelectedWord(null);
    setUsedWords((prev) => new Set([...prev, correct.word]));
  }, [wordList]);

  useEffect(() => {
    nextRound(new Set());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnswer(option: WordItem) {
    if (feedback) return;
    setSelectedWord(option.word);
    const correct = option.word === currentWord?.word;
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
        nextRound(usedWords);
      }
    }, 1200);
  }

  if (!currentWord) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #d1fae5 0%, #fef9c3 50%, #fce7f3 100%)" }}
    >
      {["🌈", "🦋", "🌺"].map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none opacity-20 select-none"
          style={{ top: `${15 + i * 25}%`, left: i % 2 === 0 ? "3%" : "91%" }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 2.5 + i, repeat: Infinity }}
        >
          {e}
        </motion.div>
      ))}

      {/* Progress */}
      <div className="w-full max-w-lg mb-8 z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-green-700 text-lg">{round + 1} of {TOTAL_ROUNDS}</span>
          <span className="font-black text-amber-600 text-lg">⭐ {score}</span>
        </div>
        <div className="h-5 bg-white/60 rounded-full overflow-hidden border-2 border-green-300 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
            animate={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Emoji card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.word + round}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.45 }}
          className="mb-6 z-10"
        >
          <div className="w-44 h-44 bg-white rounded-3xl shadow-2xl border-4 border-green-300 flex items-center justify-center">
            <span className="text-8xl">{currentWord.emoji}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="text-xl font-black text-green-700 mb-6 z-10">Find the word! 👇</p>

      {/* Feedback */}
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

      {/* Word options */}
      <div className="grid grid-cols-2 gap-5 w-full max-w-md z-10">
        {options.map((option, i) => {
          let extraClass = OPTION_STYLES[i % 4];

          if (selectedWord === option.word) {
            extraClass = feedback === "correct"
              ? "bg-green-300 hover:bg-green-300 border-green-500 text-green-900"
              : "bg-red-300 hover:bg-red-300 border-red-500 text-red-900";
          } else if (feedback === "wrong" && option.word === currentWord.word) {
            extraClass = "bg-green-300 hover:bg-green-300 border-green-500 text-green-900";
          }

          return (
            <motion.button
              key={option.word + i}
              whileHover={!feedback ? { scale: 1.06, rotate: i % 2 === 0 ? 2 : -2 } : {}}
              whileTap={!feedback ? { scale: 0.93 } : {}}
              onClick={() => { playClick(); handleAnswer(option); }}
              disabled={!!feedback}
              className={`${extraClass} border-4 rounded-3xl p-6 text-3xl font-black shadow-lg transition-colors`}
            >
              {option.word}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
