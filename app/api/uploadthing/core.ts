import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "1GB" }
  })
  .onUploadComplete(async({ file }) => {
    await prisma.upload.create({
      data: {
        name: file.name,
        url: file.ufsUrl,
        fileKey: file.key,
        fileType: file.type,
        fileSize: file.size
      },
    });
  })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;