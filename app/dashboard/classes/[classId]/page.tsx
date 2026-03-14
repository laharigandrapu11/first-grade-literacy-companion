import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import StudentTable from "@/components/dashboard/StudentTable";
import AssignmentPanel from "@/components/dashboard/AssignmentPanel";
import AddStudentDialog from "@/components/dashboard/AddStudentDialog";
import { GameMode, AppGameSession as GameSession } from "@/types/app";

function calcStudentStats(sessions: GameSession[]) {
  if (!sessions.length) return { avgScore: 0, totalMinutes: 0, lastActive: null, completionRate: 0 };
  const avgScore =
    sessions.reduce((acc, s) => acc + (s.maxScore > 0 ? s.score / s.maxScore : 0), 0) /
    sessions.length;
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60);
  const completed = sessions.filter((s) => s.completed).length;
  const completionRate = completed / sessions.length;
  const lastActive = sessions[0]?.createdAt ?? null;
  return { avgScore, totalMinutes, lastActive, completionRate };
}

const MODE_LABELS: Record<GameMode, string> = {
  LETTERS: "Letters",
  WORDS: "Words",
  BOOKS: "Books",
};

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { classId } = await params;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: { select: { name: true } },
      students: {
        include: {
          gameSessions: { orderBy: { createdAt: "desc" }, take: 100 },
        },
        orderBy: { name: "asc" },
      },
      assignments: {
        include: { material: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cls) notFound();

  const materials = await prisma.material.findMany({
    orderBy: [{ type: "asc" }, { difficulty: "asc" }],
  });

  const studentsWithStats = cls.students.map((s) => ({
    ...s,
    stats: calcStudentStats(s.gameSessions),
  }));

  const activeAssignments = cls.assignments.filter(
    (a) => !a.dueDate || a.dueDate >= new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-800">{cls.name}</h1>
          <p className="text-slate-500 text-sm">
            {cls.students.length} students ·{" "}
            {activeAssignments.length} active assignment{activeAssignments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AddStudentDialog classId={cls.id} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Students",
            value: cls.students.length,
            emoji: "👦",
            color: "bg-violet-50 text-violet-700",
          },
          {
            label: "Active Assignments",
            value: activeAssignments.length,
            emoji: "📋",
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Total Sessions",
            value: cls.students.flatMap((s) => s.gameSessions).length,
            emoji: "🎮",
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Avg Score",
            value:
              cls.students.flatMap((s) => s.gameSessions).length > 0
                ? Math.round(
                    (cls.students
                      .flatMap((s) => s.gameSessions)
                      .reduce(
                        (acc, gs) => acc + (gs.maxScore > 0 ? gs.score / gs.maxScore : 0),
                        0
                      ) /
                      cls.students.flatMap((s) => s.gameSessions).length) *
                      100
                  ) + "%"
                : "N/A",
            emoji: "⭐",
            color: "bg-green-50 text-green-700",
          },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-2xl font-extrabold">{stat.value}</p>
            <p className="text-sm opacity-75 mt-0.5">
              {stat.emoji} {stat.label}
            </p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">
            Assignments
            {activeAssignments.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeAssignments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <StudentTable students={studentsWithStats} classId={cls.id} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <AssignmentPanel
            assignments={cls.assignments.map((a) => ({
              ...a,
              modeLabel: MODE_LABELS[a.mode],
            }))}
            classId={cls.id}
            materials={materials}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
