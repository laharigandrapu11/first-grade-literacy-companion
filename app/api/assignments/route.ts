import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GameMode } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId, mode, targetScore, dueDate, materialId } = await req.json();

  if (!classId || !mode) {
    return NextResponse.json({ error: "classId and mode are required" }, { status: 400 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      classId,
      mode: mode as GameMode,
      targetScore: targetScore ? parseInt(targetScore) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      materialId: materialId || null,
    },
    include: { material: true },
  });

  return NextResponse.json(assignment, { status: 201 });
}
