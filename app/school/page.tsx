import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppGameSession as GameSession } from "@/types/app";
import SchoolCharts from "@/components/school/SchoolCharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function calcStats(sessions: GameSession[]) {
  if (!sessions.length)
    return { avgScore: 0, totalMinutes: 0, completionRate: 0, sessionCount: 0 };
  const avgScore =
    sessions.reduce((acc, s) => acc + (s.maxScore > 0 ? s.score / s.maxScore : 0), 0) /
    sessions.length;
  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 60);
  const completionRate = sessions.filter((s) => s.completed).length / sessions.length;
  return { avgScore, totalMinutes, completionRate, sessionCount: sessions.length };
}

export default async function SchoolPage() {
  const session = await auth();
  if (!session || session.user.role !== "SCHOOL_ADMIN") redirect("/login");

  const classes = await prisma.class.findMany({
    where: { schoolId: session.user.schoolId },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      _count: { select: { students: true } },
      students: {
        include: {
          gameSessions: { orderBy: { createdAt: "desc" }, take: 200 },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const classStats = classes.map((cls) => {
    const sessions = cls.students.flatMap((s) => s.gameSessions);
    return { ...cls, stats: calcStats(sessions) };
  });

  // Per-teacher aggregates
  const teacherMap: Record<
    string,
    {
      id: string;
      name: string;
      email: string;
      classCount: number;
      studentCount: number;
      stats: ReturnType<typeof calcStats>;
    }
  > = {};

  for (const cls of classStats) {
    const t = cls.teacher;
    if (!teacherMap[t.id]) {
      teacherMap[t.id] = {
        ...t,
        classCount: 0,
        studentCount: 0,
        stats: { avgScore: 0, totalMinutes: 0, completionRate: 0, sessionCount: 0 },
      };
    }
    teacherMap[t.id].classCount++;
    teacherMap[t.id].studentCount += cls._count.students;
    teacherMap[t.id].stats.sessionCount += cls.stats.sessionCount;
    teacherMap[t.id].stats.totalMinutes += cls.stats.totalMinutes;
  }

  // Recalculate teacher averages
  for (const t of Object.values(teacherMap)) {
    const allSessions = classes
      .filter((c) => c.teacher.id === t.id)
      .flatMap((c) => c.students.flatMap((s) => s.gameSessions));
    const s = calcStats(allSessions);
    t.stats = s;
  }

  const teachers = Object.values(teacherMap).sort(
    (a, b) => b.stats.avgScore - a.stats.avgScore
  );

  const totalStudents = classes.reduce((acc, c) => acc + c._count.students, 0);
  const totalSessions = classStats.reduce((acc, c) => acc + c.stats.sessionCount, 0);

  const chartData = classStats.map((c) => ({
    name: c.name.replace(/^Room \d+ - /, ""),
    avgScore: Math.round(c.stats.avgScore * 100),
    totalMinutes: c.stats.totalMinutes,
    completionRate: Math.round(c.stats.completionRate * 100),
    sessions: c.stats.sessionCount,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800">School Overview</h1>
        <p className="text-slate-500 mt-1">
          {classes.length} classes · {totalStudents} students · {totalSessions} total game sessions
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Classes", value: classes.length, emoji: "🏫", color: "bg-violet-50 text-violet-700" },
          { label: "Students", value: totalStudents, emoji: "👦", color: "bg-blue-50 text-blue-700" },
          { label: "Teachers", value: teachers.length, emoji: "👩‍🏫", color: "bg-amber-50 text-amber-700" },
          { label: "Game Sessions", value: totalSessions, emoji: "🎮", color: "bg-green-50 text-green-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-sm opacity-75 mt-0.5">{stat.emoji} {stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <SchoolCharts data={chartData} />

      {/* Teacher leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Total Play Time</TableHead>
                <TableHead>Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <span className="font-bold text-slate-500">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{t.classCount}</TableCell>
                  <TableCell>{t.studentCount}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        t.stats.avgScore >= 0.7
                          ? "bg-green-100 text-green-700"
                          : t.stats.avgScore >= 0.4
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      } border-0 font-bold`}
                    >
                      {Math.round(t.stats.avgScore * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{t.stats.totalMinutes} min</TableCell>
                  <TableCell className="text-slate-600">
                    {Math.round(t.stats.completionRate * 100)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
