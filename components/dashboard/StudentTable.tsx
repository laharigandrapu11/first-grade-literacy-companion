"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GameMode, GameSession } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

const MODE_BADGE: Record<GameMode, { label: string; class: string }> = {
  LETTERS: { label: "Letters", class: "bg-blue-100 text-blue-700" },
  WORDS: { label: "Words", class: "bg-green-100 text-green-700" },
  BOOKS: { label: "Books", class: "bg-purple-100 text-purple-700" },
};

interface StudentWithStats {
  id: string;
  name: string;
  gameSessions: GameSession[];
  stats: {
    avgScore: number;
    totalMinutes: number;
    lastActive: Date | null;
    completionRate: number;
  };
}

export default function StudentTable({
  students,
  classId,
}: {
  students: StudentWithStats[];
  classId: string;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteStudent(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      toast.success("Student removed");
      router.refresh();
    } else {
      toast.error("Failed to remove student");
    }
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-5xl mb-3">👦</div>
        <p className="font-semibold">No students yet</p>
        <p className="text-sm mt-1">Add students using the button above</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead className="font-semibold">Avg Score</TableHead>
            <TableHead className="font-semibold">Play Time</TableHead>
            <TableHead className="font-semibold">Sessions</TableHead>
            <TableHead className="font-semibold">Last Active</TableHead>
            <TableHead className="font-semibold">Recent Mode</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const lastSession = student.gameSessions[0];
            const recentMode = lastSession?.mode;

            return (
              <TableRow key={student.id}>
                <TableCell className="font-semibold text-slate-800">
                  {student.name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={student.stats.avgScore * 100}
                      className="w-16 h-2"
                    />
                    <span className="text-sm text-slate-600 tabular-nums">
                      {Math.round(student.stats.avgScore * 100)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">
                  {student.stats.totalMinutes} min
                </TableCell>
                <TableCell className="text-slate-600">
                  {student.gameSessions.length}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {student.stats.lastActive
                    ? formatDistanceToNow(new Date(student.stats.lastActive), {
                        addSuffix: true,
                      })
                    : "Never"}
                </TableCell>
                <TableCell>
                  {recentMode ? (
                    <Badge
                      className={`text-xs ${MODE_BADGE[recentMode].class} border-0`}
                    >
                      {MODE_BADGE[recentMode].label}
                    </Badge>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => deleteStudent(student.id)}
                    disabled={deletingId === student.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
