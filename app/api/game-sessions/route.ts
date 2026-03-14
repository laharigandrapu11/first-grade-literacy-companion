import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { GameMode } from "@prisma/client";

export async function POST(req: Request) {
  const { studentId, mode, score, maxScore, duration, completed, assignmentId } =
    await req.json();

  if (!studentId || !mode) {
    return NextResponse.json({ error: "studentId and mode are required" }, { status: 400 });
  }

  const session = await prisma.gameSession.create({
    data: {
      studentId,
      mode: mode as GameMode,
      score: score ?? 0,
      maxScore: maxScore ?? 0,
      duration: duration ?? 0,
      completed: completed ?? false,
      assignmentId: assignmentId || null,
    },
  });

  return NextResponse.json(session, { status: 201 });
}
