import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const materials = await prisma.material.findMany({
    orderBy: [{ type: "asc" }, { difficulty: "asc" }],
  });

  return NextResponse.json(materials);
}
