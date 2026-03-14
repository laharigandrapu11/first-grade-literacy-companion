"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSound } from "@/lib/useSound";

interface Student {
  id: string;
  name: string;
}

interface ClassData {
  id: string;
  name: string;
  students: Student[];
}

const CLASS_THEMES = [
  { bg: "bg-yellow-300", hover: "hover:bg-yellow-400", text: "text-yellow-900", icon: "🌻" },
  { bg: "bg-sky-300", hover: "hover:bg-sky-400", text: "text-sky-900", icon: "🐳" },
  { bg: "bg-pink-300", hover: "hover:bg-pink-400", text: "text-pink-900", icon: "🌸" },
  { bg: "bg-green-300", hover: "hover:bg-green-400", text: "text-green-900", icon: "🐢" },
  { bg: "bg-purple-300", hover: "hover:bg-purple-400", text: "text-purple-900", icon: "🦄" },
  { bg: "bg-orange-300", hover: "hover:bg-orange-400", text: "text-orange-900", icon: "🦊" },
];

const STUDENT_ANIMALS = ["🐱", "🐶", "🐸", "🐻", "🦊", "🐰", "🦁", "🐯", "🐼", "🐨", "🦋", "🐧"];

const STUDENT_COLORS = [
  "bg-yellow-200 hover:bg-yellow-300 border-yellow-400 text-yellow-900",
  "bg-pink-200 hover:bg-pink-300 border-pink-400 text-pink-900",
  "bg-blue-200 hover:bg-blue-300 border-blue-400 text-blue-900",
  "bg-green-200 hover:bg-green-300 border-green-400 text-green-900",
  "bg-purple-200 hover:bg-purple-300 border-purple-400 text-purple-900",
  "bg-orange-200 hover:bg-orange-300 border-orange-400 text-orange-900",
  "bg-teal-200 hover:bg-teal-300 border-teal-400 text-teal-900",
  "bg-red-200 hover:bg-red-300 border-red-400 text-red-900",
];

export default function PlayLobby() {
  const router = useRouter();
  const { playClick } = useSound();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/play/classes")
      .then((r) => r.json())
      .then((data) => {
        setClasses(data);
        setLoading(false);
      });
  }, []);

  function selectStudent(student: Student) {
    router.push(
      `/play/game?studentId=${student.id}&studentName=${encodeURIComponent(student.name)}`
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fef9c3 0%, #fce7f3 40%, #dbeafe 100%)",
      }}
    >
      {/* Floating background shapes */}
      {["⭐", "🌈", "💫", "🎈", "✨", "🌟"].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl select-none pointer-events-none opacity-20"
          style={{
            top: `${10 + i * 14}%`,
            left: i % 2 === 0 ? `${5 + i * 3}%` : `${75 + i * 2}%`,
          }}
          animate={{ y: [0, -18, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Header */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="text-center mb-10 z-10"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl mb-4 inline-block"
        >
          📚
        </motion.div>
        <h1
          className="text-6xl font-black mb-2"
          style={{
            color: "#7c3aed",
            textShadow: "3px 3px 0px #c4b5fd",
            letterSpacing: "-1px",
          }}
        >
          Reading Time!
        </h1>
        <p className="text-2xl font-bold text-pink-500">
          {selectedClass ? "Who are you? 👇" : "Pick your class! 👇"}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex gap-3 z-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-5 h-5 bg-violet-400 rounded-full"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {!selectedClass ? (
            <motion.div
              key="classes"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-3xl w-full z-10"
            >
              {classes.map((cls, i) => {
                const theme = CLASS_THEMES[i % CLASS_THEMES.length];
                return (
                  <motion.button
                    key={cls.id}
                    whileHover={{ scale: 1.06, rotate: 1 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => { playClick(); setSelectedClass(cls); }}
                    className={`${theme.bg} ${theme.hover} ${theme.text} rounded-3xl p-7 shadow-lg text-left border-4 border-white transition-colors`}
                  >
                    <div className="text-5xl mb-3">{theme.icon}</div>
                    <p className="font-black text-xl leading-tight">{cls.name}</p>
                    <p className="text-sm font-bold opacity-70 mt-2">
                      {cls.students.length} friends
                    </p>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="students"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="w-full max-w-2xl z-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playClick(); setSelectedClass(null); }}
                  className="bg-white text-violet-600 font-black text-lg px-5 py-2 rounded-2xl shadow border-2 border-violet-200"
                >
                  Back
                </motion.button>
                <h2 className="text-xl font-black text-violet-700">{selectedClass.name}</h2>
              </div>

              {selectedClass.students.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-6xl mb-3">😔</div>
                  <p className="text-xl font-bold">No students in this class yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedClass.students.map((student, i) => (
                    <motion.button
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.08, rotate: -2 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { playClick(); selectStudent(student); }}
                      className={`${STUDENT_COLORS[i % STUDENT_COLORS.length]} border-4 rounded-3xl p-5 text-center font-black text-lg shadow-md transition-colors`}
                    >
                      <div className="text-5xl mb-2">
                        {STUDENT_ANIMALS[i % STUDENT_ANIMALS.length]}
                      </div>
                      {student.name}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <p className="mt-12 text-sm text-slate-400 z-10">
        <Link href="/" className="hover:text-violet-500 font-medium">
          Back to Home
        </Link>
      </p>
    </div>
  );
}
