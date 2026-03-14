import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where =
    session.user.role === "TEACHER"
      ? { teacherId: session.user.id }
      : { schoolId: session.user.schoolId };

  const classes = await prisma.class.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      _count: { select: { students: true, assignments: true } },
      students: {
        include: {
          gameSessions: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const newClass = await prisma.class.create({
    data: {
      name,
      teacherId: session.user.id,
      schoolId: session.user.schoolId,
    },
  });

  return NextResponse.json(newClass, { status: 201 });
}
