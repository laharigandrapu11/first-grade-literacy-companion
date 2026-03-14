import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Public endpoint for the play lobby - no auth required
export async function GET() {
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      students: {
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(classes);
}
