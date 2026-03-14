import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = await params;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      students: {
        include: {
          gameSessions: {
            orderBy: { createdAt: "desc" },
            take: 100,
          },
        },
        orderBy: { name: "asc" },
      },
      assignments: {
        include: { material: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!cls) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(cls);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;

  await prisma.class.delete({ where: { id: classId } });
  return NextResponse.json({ success: true });
}
