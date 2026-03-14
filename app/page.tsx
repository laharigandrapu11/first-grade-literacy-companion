import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-8xl mb-6">📚</div>
        <h1 className="text-5xl font-extrabold text-violet-700 mb-4 leading-tight">
          Literacy Companion
        </h1>
        <p className="text-xl text-slate-600 mb-10">
          A fun reading adventure for first graders, helping every child love books!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/play">
            <Button
              size="lg"
              className="text-xl px-10 py-6 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold shadow-lg"
            >
              🎮 Play Now
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="text-xl px-10 py-6 rounded-2xl border-2 border-violet-300 text-violet-700 font-bold hover:bg-violet-50"
            >
              👩‍🏫 Teacher Login
            </Button>
          </Link>
        </div>

        <p className="mt-12 text-sm text-slate-400">
          For teachers and school administrators:{" "}
          <Link href="/login" className="text-violet-500 hover:underline">
            sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}
