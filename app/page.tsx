"use client";

import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

type Upload = {
  id: string;
  name: string;
  url: string;
  fileType: string;
};

export default function Home() {
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
  });

  const fetchUploads = async () => {
    const res = await fetch("/api/uploads");
    setUploads(await res.json());
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">File Upload</h1>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          }`}
        >
          <input {...getInputProps()} />
          {!preview ? (
            <p className="text-gray-600">
              Drag and drop or click to select file
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

        {file && !isUploading && (
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
                <p className="text-xs mt-2 truncate">{u.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
