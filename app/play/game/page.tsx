import GameContainer from "@/components/game/GameContainer";
import { Suspense } from "react";

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
        <div className="text-5xl animate-bounce">📚</div>
      </div>
    }>
      <GameContainer />
    </Suspense>
  );
}
