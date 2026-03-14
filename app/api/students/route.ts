import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, classId } = await req.json();
  if (!name || !classId) {
    return NextResponse.json({ error: "Name and classId are required" }, { status: 400 });
  }

  const student = await prisma.student.create({
    data: { name, classId },
  });

  return NextResponse.json(student, { status: 201 });
}
