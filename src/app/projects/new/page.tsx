"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type UploadStatus = 'uploading' | 'completed' | 'failed';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export default function NewProjectUploadPage() {
  const [showBounce, setShowBounce] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const activeUploads = useRef<{ [key: string]: boolean }>({});

  const uploadFile = async (item: UploadItem) => {
    try {
      const updatedItems = [...uploadItems];
      const itemIndex = updatedItems.findIndex(i => i.id === item.id);
      if (itemIndex === -1) return;

      // Start uploading immediately
      updatedItems[itemIndex].status = 'uploading';
      setUploadItems([...updatedItems]);
      activeUploads.current[item.id] = true;

      // Simulate upload progress
      await new Promise<void>((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          // Check if upload was cancelled
          if (!activeUploads.current[item.id]) {
            clearInterval(interval);
            reject(new Error('Upload cancelled'));
            return;
          }

          progress += 10;
          
          setUploadItems(current => {
            const updatedItems = [...current];
            const itemIndex = updatedItems.findIndex(i => i.id === item.id);
            
            if (itemIndex !== -1) {
              updatedItems[itemIndex].progress = progress;
              
              if (progress >= 100) {
                clearInterval(interval);
                updatedItems[itemIndex].status = 'completed';
                delete activeUploads.current[item.id];
                resolve();
              }
            }
            
            return updatedItems;
          });
          
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 500);
      });

    } catch (err) {
      // Only update state if the item hasn't been removed
      setUploadItems(current => {
        const updatedItems = [...current];
        const itemIndex = updatedItems.findIndex(i => i.id === item.id);
        
        if (itemIndex !== -1) {
          updatedItems[itemIndex].status = 'failed';
          updatedItems[itemIndex].error = err instanceof Error ? err.message : 'Upload failed';
        }
        
        return updatedItems;
      });
    } finally {
      delete activeUploads.current[item.id];
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size <= 10 * 1024 * 1024) {
      setError(null);
      setShowBounce(true);
      
      // Create new upload item and start upload immediately
      const newItem: UploadItem = {
        id: Math.random().toString(36).substr(2, 9),
        file: selected,
        progress: 0,
        status: 'uploading'  // Start as uploading instead of pending
      };

      setUploadItems(prev => [...prev, newItem]);
      uploadFile(newItem);

      setTimeout(() => {
        setShowBounce(false);
      }, 2000);

      // Reset the input value to allow uploading the same file again
      e.target.value = '';
    } else {
      setError("File too large (max 10MB)");
    }
  };

  const handleRemoveFile = (id: string) => {
    // Cancel the upload if it's in progress
    if (activeUploads.current[id]) {
      delete activeUploads.current[id];
    }
    
    // Remove the item immediately
    setUploadItems(prev => prev.filter(item => item.id !== id));
    setError(null); // Clear any existing errors
  };

  const handleGenerateHypotheses = () => {
    router.push("/projects/[id]");
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'uploading': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  };

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const areAllUploadsComplete = uploadItems.length > 0 && uploadItems.every(item => item.status === 'completed');
  const hasFailedUploads = uploadItems.some(item => item.status === 'failed');

  return (
    <>
      {/* 🔧 Combined styles */}
      <style jsx>{`
        @keyframes settleBounce {
          0% { transform: translateY(-25%); }
          20% { transform: translateY(0); }
          40% { transform: translateY(-10%); }
          60% { transform: translateY(0); }
          80% { transform: translateY(-4%); }
          100% { transform: translateY(0); }
        }
        .animate-settleBounce {
          animation: settleBounce 1.5s ease-out forwards;
        }

        .custom-button-blue {
          background-color: #1e3a8a; /* Dark Blue background */
          color: #3b82f6; /* Light Blue text */
          border: none;
          padding: 15px 30px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 30px;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .custom-button-blue::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300%;
          height: 300%;
          background-color: #3b82f6; /* Light Blue */
          transition: all 0.3s ease;
          border-radius: 50%;
          z-index: -1;
          transform: translate(-50%, -50%) scale(0);
        }

        .custom-button-blue:hover::before {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.9;
        }

        .custom-button-blue:hover {
          box-shadow: 0 15px 20px rgba(0, 0, 0, 0.4);
          transform: translateY(-5px);
          color: #1e3a8a; /* Dark Blue text on hover */
        }

        .custom-button-blue:active::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out;
          z-index: -1;
        }

        @keyframes ripple {
          to {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }

        .custom-button-blue::after {
          content: "";
          position: absolute;
          top: 0;
          left: -75%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: all 0.3s ease;
        }

        .custom-button-blue:hover::after {
          left: 100%;
          transition: all 0.5s ease;
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
                CSV, , or JSON (max 10MB)
              </p>
            </label>

            {error && (
              <p className="text-sm text-red-500 mt-4 font-medium">{error}</p>
            )}

            {/* Upload Items List */}
            {uploadItems.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-700 text-left">Uploaded Files</h3>
                {uploadItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {item.file.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(item.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(item.status)} transition-all duration-500`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    {item.error && (
                      <p className="text-xs text-red-500 mt-1">{item.error}</p>
                    )}
                  </div>
                ))}

                {/* Generate Hypotheses Button */}
                {areAllUploadsComplete && (
                  <button
                    onClick={handleGenerateHypotheses}
                    className="mt-4 w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Generate Hypotheses</span>
                  </button>
                )}

                {hasFailedUploads && (
                  <p className="text-sm text-red-500 mt-2">
                    Please remove failed uploads before proceeding
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
