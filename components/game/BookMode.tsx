"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpeech } from "@/lib/useSpeech";
import { useSound } from "@/lib/useSound";

const DEFAULT_BOOK = {
  title: "The Big Blue Sea",
  content: {
    pages: [
      {
        text: "The sea is big and blue. Many fish live in the sea.",
        vocabularyWords: ["sea", "fish"],
      },
      {
        text: "A little fish swims fast. She jumps over the waves.",
        vocabularyWords: ["swims", "waves"],
      },
      {
        text: "The little fish finds a shell. The shell is pink and shiny.",
        vocabularyWords: ["shell", "shiny"],
      },
    ],
    questions: [
      {
        question: "What color is the sea?",
        options: ["Red", "Green", "Blue", "Yellow"],
        answer: 2,
      },
      {
        question: "What does the little fish find?",
        options: ["A rock", "A shell", "A boat", "A starfish"],
        answer: 1,
      },
      {
        question: "What color is the shell?",
        options: ["Blue", "Green", "Yellow", "Pink"],
        answer: 3,
      },
    ],
  },
};

const PAGE_EMOJIS = ["🌊", "🐠", "🐚", "🌸", "🌟", "🦋"];

interface BookModeProps {
  onComplete: (score: number, maxScore: number, duration: number) => void;
  studentName: string;
  material: {
    title: string;
    content: {
      pages: { text: string; vocabularyWords: string[] }[];
      questions: { question: string; options: string[]; answer: number }[];
    };
  } | null;
}

const OPTION_STYLES = [
  "bg-yellow-200 hover:bg-yellow-300 border-yellow-400 text-yellow-900",
  "bg-pink-200 hover:bg-pink-300 border-pink-400 text-pink-900",
  "bg-sky-200 hover:bg-sky-300 border-sky-400 text-sky-900",
  "bg-green-200 hover:bg-green-300 border-green-400 text-green-900",
];

export default function BookMode({ onComplete, studentName, material }: BookModeProps) {
  const { speak } = useSpeech();
  const { playDing, playBuzz, playClick } = useSound();
  const book = material ?? DEFAULT_BOOK;
  const { pages, questions } = book.content;

  const [stage, setStage] = useState<"reading" | "questions">("reading");
  const [pageIndex, setPageIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [startTime] = useState(Date.now());

  const currentPage = pages[pageIndex];
  const currentQuestion = questions[questionIndex];

  function readPage() {
    speak(currentPage.text, 0.8, 1.1);
  }

  function highlightVocab(text: string, vocabWords: string[]) {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      let earliestIndex = -1;
      let earliestWord = "";

      for (const vocab of vocabWords) {
        const idx = remaining.toLowerCase().indexOf(vocab.toLowerCase());
        if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) {
          earliestIndex = idx;
          earliestWord = vocab;
        }
      }

      if (earliestIndex === -1) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }

      if (earliestIndex > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, earliestIndex)}</span>);
      }

      parts.push(
        <motion.span
          key={key++}
          initial={{ backgroundColor: "transparent" }}
          animate={{ backgroundColor: "#fde68a" }}
          className="px-1.5 py-0.5 rounded-lg font-black underline decoration-amber-400 cursor-pointer"
          style={{ color: "#92400e" }}
          onClick={() => speak(earliestWord)}
          title="Tap to hear this word"
        >
          {remaining.slice(earliestIndex, earliestIndex + earliestWord.length)}
        </motion.span>
      );

      remaining = remaining.slice(earliestIndex + earliestWord.length);
    }

    return parts;
  }

  function handleAnswer(idx: number) {
    if (feedback) return;
    setSelectedAnswer(idx);
    const correct = idx === currentQuestion.answer;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      playDing();
      setScore((s) => s + 1);
      speak("That's right! Great reading!");
    } else {
      playBuzz();
      speak(`Oops! The answer was ${currentQuestion.options[currentQuestion.answer]}`);
    }

    setTimeout(() => {
      const nextQ = questionIndex + 1;
      if (nextQ >= questions.length) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        onComplete(correct ? score + 1 : score, questions.length, duration);
      } else {
        setQuestionIndex(nextQ);
        setSelectedAnswer(null);
        setFeedback(null);
      }
    }, 1300);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #ede9fe 0%, #fce7f3 50%, #e0f2fe 100%)" }}
    >
      {/* Background floaties */}
      {["📖", "✨", "💜"].map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl pointer-events-none opacity-20 select-none"
          style={{ top: `${20 + i * 25}%`, left: i % 2 === 0 ? "3%" : "92%" }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.5 + i, repeat: Infinity }}
        >
          {e}
        </motion.div>
      ))}

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 z-10"
      >
        <p className="text-sm font-black text-purple-400 uppercase tracking-widest mb-1">
          Story Time
        </p>
        <h1
          className="text-3xl font-black text-purple-800"
          style={{ textShadow: "2px 2px 0 #c4b5fd" }}
        >
          {book.title}
        </h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {stage === "reading" ? (
          <motion.div
            key="reading"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-xl z-10"
          >
            {/* Progress dots */}
            <div className="flex justify-center gap-3 mb-5">
              {pages.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: i === pageIndex ? 1.3 : 1 }}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i === pageIndex
                      ? "bg-purple-500 border-purple-600"
                      : i < pageIndex
                      ? "bg-purple-300 border-purple-400"
                      : "bg-white border-purple-200"
                  }`}
                />
              ))}
            </div>

            {/* Page card */}
            <div className="bg-white rounded-3xl shadow-2xl border-4 border-purple-200 p-8 mb-5">
              <div className="text-center text-7xl mb-5">
                {PAGE_EMOJIS[pageIndex % PAGE_EMOJIS.length]}
              </div>
              <p className="text-2xl font-bold text-slate-700 leading-relaxed text-center">
                {highlightVocab(currentPage.text, currentPage.vocabularyWords)}
              </p>
              {currentPage.vocabularyWords.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 justify-center">
                  {currentPage.vocabularyWords.map((w) => (
                    <motion.button
                      key={w}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => speak(w)}
                      className="bg-amber-100 text-amber-800 text-base font-black px-3 py-1.5 rounded-full border-2 border-amber-300 hover:bg-amber-200"
                    >
                      🔊 {w}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Read aloud button */}
            <div className="flex justify-center mb-5">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={readPage}
                className="bg-amber-300 hover:bg-amber-400 border-4 border-amber-500 text-amber-900 font-black px-7 py-3 rounded-2xl shadow-lg text-lg flex items-center gap-2"
              >
                🔊 Read to me!
              </motion.button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playClick(); setPageIndex((p) => Math.max(0, p - 1)); }}
                disabled={pageIndex === 0}
                className="bg-white border-4 border-purple-200 text-purple-700 font-black px-6 py-3 rounded-2xl shadow disabled:opacity-30"
              >
                Back
              </motion.button>
              <span className="font-black text-purple-600">
                Page {pageIndex + 1} of {pages.length}
              </span>
              {pageIndex < pages.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playClick(); setPageIndex((p) => p + 1); }}
                  className="bg-purple-400 hover:bg-purple-500 border-4 border-purple-600 text-white font-black px-6 py-3 rounded-2xl shadow"
                >
                  Next
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playClick(); setStage("questions"); }}
                  className="bg-amber-400 hover:bg-amber-500 border-4 border-amber-600 text-white font-black px-6 py-3 rounded-2xl shadow"
                >
                  Questions!
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="questions"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg z-10"
          >
            {/* Progress */}
            <div className="flex justify-between items-center mb-5">
              <span className="font-black text-purple-700 text-lg">
                Question {questionIndex + 1} of {questions.length}
              </span>
              <span className="font-black text-amber-600 text-lg">⭐ {score}</span>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border-4 border-purple-200 p-8 mb-5 text-center">
              <div className="text-5xl mb-4">❓</div>
              <p className="text-2xl font-black text-slate-700">{currentQuestion.question}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => speak(currentQuestion.question)}
                className="mt-4 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-800 font-black px-4 py-2 rounded-xl text-sm inline-flex items-center gap-1"
              >
                🔊 Read question
              </motion.button>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.2 }}
                  exit={{ scale: 0 }}
                  className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                  <span className="text-9xl drop-shadow-2xl">
                    {feedback === "correct" ? "🌟" : "💪"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((opt, i) => {
                let extraClass = OPTION_STYLES[i % 4];
                if (selectedAnswer === i) {
                  extraClass =
                    feedback === "correct"
                      ? "bg-green-300 hover:bg-green-300 border-green-500 text-green-900"
                      : "bg-red-300 hover:bg-red-300 border-red-500 text-red-900";
                } else if (feedback === "wrong" && i === currentQuestion.answer) {
                  extraClass = "bg-green-300 hover:bg-green-300 border-green-500 text-green-900";
                }

                return (
                  <motion.button
                    key={i}
                    whileHover={!feedback ? { scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 } : {}}
                    whileTap={!feedback ? { scale: 0.94 } : {}}
                    onClick={() => handleAnswer(i)}
                    disabled={!!feedback}
                    className={`${extraClass} border-4 rounded-2xl p-5 text-xl font-black shadow-lg transition-colors`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
