import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

type Metadata = {
  userId: string;
};

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "1GB" }
  })
  .middleware(async ({ req }): Promise<Metadata> => {
    const session = await auth.api.getSession({ headers: req.headers });
    if(!session) throw new Error("Unauthorized")
      return { userId: session.user.id}
  })
  .onUploadComplete(async({ metadata, file }) => {
    await prisma.upload.create({
      data: {
        name: file.name,
        url: file.ufsUrl,
        fileKey: file.key,
        fileType: file.type,
        fileSize: file.size,
        userId: metadata.userId,
      },
    });
  })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;