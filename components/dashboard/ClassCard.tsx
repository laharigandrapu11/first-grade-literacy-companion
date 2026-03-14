import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Assignment, GameMode } from "@prisma/client";

const MODE_LABELS: Record<GameMode, string> = {
  LETTERS: "Letters",
  WORDS: "Words",
  BOOKS: "Books",
};

const MODE_EMOJI: Record<GameMode, string> = {
  LETTERS: "🔤",
  WORDS: "📝",
  BOOKS: "📖",
};

interface ClassCardProps {
  cls: {
    id: string;
    name: string;
    _count: { students: number };
    assignments: Assignment[];
    stats: {
      avgScore: number;
      totalMinutes: number;
      completionRate: number;
    };
  };
}

export default function ClassCard({ cls }: ClassCardProps) {
  const { avgScore, totalMinutes, completionRate } = cls.stats;
  const activeAssignment = cls.assignments[0];

  return (
    <Link href={`/dashboard/classes/${cls.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border hover:border-violet-200 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 leading-tight">
              {cls.name}
            </CardTitle>
            {activeAssignment && (
              <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                {MODE_EMOJI[activeAssignment.mode]} {MODE_LABELS[activeAssignment.mode]}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">
            👦 {cls._count.students} student{cls._count.students !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-violet-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-extrabold text-violet-700">
                {Math.round(avgScore * 100)}%
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Avg Score</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-extrabold text-amber-700">{totalMinutes}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Mins</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Completion rate</span>
              <span>{Math.round(completionRate * 100)}%</span>
            </div>
            <Progress value={completionRate * 100} className="h-2" />
          </div>

          {!activeAssignment && (
            <p className="text-xs text-slate-400 italic">No active assignment</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
