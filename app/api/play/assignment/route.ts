import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get active assignment for a student's class
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const now = new Date();

  const assignment = await prisma.assignment.findFirst({
    where: {
      classId: student.classId,
      OR: [{ dueDate: null }, { dueDate: { gte: now } }],
    },
    include: { material: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ assignment });
}
