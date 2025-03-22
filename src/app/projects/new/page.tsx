"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectUploadPage() {
  const [showBounce, setShowBounce] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size <= 10 * 1024 * 1024) {
      setFile(selected);
      setError(null);
      setSuccess(true);
      setShowBounce(true);

      setTimeout(() => {
        setShowBounce(false);
      }, 2000);
    } else {
      setFile(null);
      setSuccess(false);
      setShowBounce(false);
      setError("File too large (max 10MB)");
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Upload failed. Please try again.");
      setSuccess(false);
      return;
    }

    router.push("/projects/[id]");
  };

  return (
    <>
      {/* 🔧 Inline animation definition */}
      <style jsx>{`
        @keyframes settleBounce {
          0% {
            transform: translateY(-25%);
          }
          20% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10%);
          }
          60% {
            transform: translateY(0);
          }
          80% {
            transform: translateY(-4%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-settleBounce {
          animation: settleBounce 1.5s ease-out forwards;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl bg-white p-8 rounded-xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Research Paper
            </h1>
            <Link
              href="/"
              className="px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
          </div>

          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              ⬆ Upload Data to Generate Paper
            </p>
            <label className="block text-sm text-gray-700 mb-2">
              Upload Data File
            </label>

            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleFileChange}
              className="hidden"
              id="upload"
            />

            <label
              htmlFor="upload"
              className="border border-gray-300 rounded-md p-6 cursor-pointer hover:bg-gray-50 flex flex-col items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v12m0 0l-4-4m4 4l4-4M4 16v1a1 1 0 001 1h14a1 1 0 001-1v-1"
                />
              </svg>
              <p className="text-sm text-gray-700 font-medium">
                Click to upload
              </p>
              <p className="text-gray-500">or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">
                CSV, XLSX, or JSON (max 10MB)
              </p>
            </label>

            {/* ✅ Feedback messages */}
            {error && (
              <p className="text-sm text-red-500 mt-4 font-medium">{error}</p>
            )}

            {success && !error && (
              <div
                className={`flex flex-col items-center gap-2 mt-4 ${
                  showBounce ? "animate-settleBounce" : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm text-green-600 font-medium">
                  File uploaded!
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              className="mt-6 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Upload and Process
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
