"use client";

import { signIn, signOut, useSession } from "@/lib/auth-client";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

type Upload = {
  id: string;
  name: string;
  url: string;
  fileType: string;
  userId: string;
  user: { name: string | null; image: string | null };
};

export default function Home() {
  const { data: session } = useSession();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploads, setUploads] = useState<Upload[]>([]);

  const { startUpload, isUploading } = useUploadThing("mediaUploader", {
    onClientUploadComplete: () => {
      setFile(null);
      setPreview(null);
      setProgress(0);
      fetchUploads();
    },
    onUploadProgress: setProgress,
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "video/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      const f = files[0];
      setPreview(URL.createObjectURL(f));
      setFile(f);
    },
    disabled: !session,
  });

  const fetchUploads = async () => {
    const res = await fetch("/api/uploads");
    setUploads(await res.json());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
    if (res.ok) fetchUploads();
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">File Upload</h1>

        {session ? (
          <div className="flex items-center gap-3">
            <Image
              src={session.user.image || ""}
              alt=""
              className="w-8 h-8 rounded-full"
              width={32}
              height={32}
            />
            <span className="text-sm">{session.user.name}</span>
            <button
              onClick={() => signOut()}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() =>
              signIn.social({ provider: "github", callbackURL: "/" })
            }
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            Login with GitHub
          </button>
        )}

        {!session && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            Please login to upload files
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
            !session
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : isDragActive
              ? "border-blue-500 bg-blue-50 cursor-pointer"
              : "border-gray-300 bg-white cursor-pointer"
          }`}
        >
          <input {...getInputProps()} />
          {!preview ? (
            <p className="text-gray-600">
              {session
                ? "Drag and drop or click to select file"
                : "Login to upload files"}
            </p>
          ) : (
            <div className="space-y-4">
              {file?.type.startsWith("image/") ? (
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={200}
                  className="max-h-64 mx-auto rounded"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="max-h-64 mx-auto rounded"
                />
              )}
              <p className="text-sm">{file?.name}</p>
            </div>
          )}
        </div>

        {file && !isUploading && session && (
          <button
            onClick={() => startUpload([file])}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Upload
          </button>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm">{progress}%</p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Uploaded Files</h2>
          <div className="grid grid-cols-2 gap-4">
            {uploads.map((u) => (
              <div key={u.id} className="bg-white rounded-lg p-3">
                {u.fileType.startsWith("image/") ? (
                  <Image
                    src={u.url}
                    alt={u.name}
                    width={400}
                    height={200}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <video
                    src={u.url}
                    className="w-full h-32 object-cover rounded"
                  />
                )}

                <div className="mt-2 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{u.name}</p>
                    <p className="text-xs text-gray-500">by {u.user.name}</p>
                  </div>
                  {session?.user.id === u.userId && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
