import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClassCard from "@/components/dashboard/ClassCard";
import CreateClassDialog from "@/components/dashboard/CreateClassDialog";
import { AppGameSession as GameSession } from "@/types/app";

function calcStats(sessions: GameSession[]) {
  if (!sessions.length) return { avgScore: 0, totalMinutes: 0, completionRate: 0 };
  const completed = sessions.filter((s) => s.completed);
  const avgScore =
    sessions.reduce((acc, s) => acc + (s.maxScore > 0 ? s.score / s.maxScore : 0), 0) /
    sessions.length;
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60);
  const completionRate = completed.length / sessions.length;
  return { avgScore, totalMinutes, completionRate };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { students: true } },
      students: {
        include: {
          gameSessions: { orderBy: { createdAt: "desc" }, take: 100 },
        },
      },
      assignments: {
        where: {
          OR: [{ dueDate: null }, { dueDate: { gte: new Date() } }],
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const classesWithStats = classes.map((cls) => {
    const allSessions = cls.students.flatMap((s) => s.gameSessions);
    const stats = calcStats(allSessions);
    return { ...cls, stats };
  });

  const totalStudents = classes.reduce((acc, c) => acc + c._count.students, 0);
  const totalSessions = classesWithStats.reduce(
    (acc, c) => acc + c.students.flatMap((s) => s.gameSessions).length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Welcome back, {session.user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {classes.length} class{classes.length !== 1 ? "es" : ""} · {totalStudents} students ·{" "}
            {totalSessions} game sessions
          </p>
        </div>
        <CreateClassDialog />
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="text-6xl mb-4">🏫</div>
          <p className="text-xl font-semibold">No classes yet</p>
          <p className="mt-2">Create your first class to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classesWithStats.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  );
}
