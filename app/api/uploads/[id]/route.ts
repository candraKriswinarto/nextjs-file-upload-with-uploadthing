import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const upload = await prisma.upload.findUnique({
      where: { id: params.id },
    });

    if(!upload) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await utapi.deleteFiles(upload.fileKey);
    await prisma.upload.delete({ where: { id: params.id }})
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}