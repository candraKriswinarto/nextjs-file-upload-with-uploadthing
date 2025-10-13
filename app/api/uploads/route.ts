import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const uploads = await prisma.upload.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(uploads);
  } catch {
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 });
  }
}