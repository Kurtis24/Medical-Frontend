"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadFile as chatbotUploadFile } from "../../api/chatbotService";
import type { FileUploadResponse } from "../../api/chatbotService";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

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

  const handleFileUpload = async (item: UploadItem) => {
    try {
      const formData = new FormData();
      formData.append('file', item.file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const uploadFile = async (item: UploadItem) => {
    try {
      const updatedItems = [...uploadItems];
      const itemIndex = updatedItems.findIndex(i => i.id === item.id);
      if (itemIndex === -1) return;

      // Start uploading immediately
      updatedItems[itemIndex].status = 'uploading';
      updatedItems[itemIndex].progress = 0;
      setUploadItems([...updatedItems]);
      activeUploads.current[item.id] = true;

      // Create FormData and append the file
      const formData = new FormData();
      formData.append('files', item.file);

      // Perform the upload
      const response = await fetch('/api/generate-hypotheses', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Mark as completed
      setUploadItems(current => {
        const updatedItems = [...current];
        const itemIndex = updatedItems.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          updatedItems[itemIndex].status = 'completed';
          updatedItems[itemIndex].progress = 100;
        }
        return updatedItems;
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
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length === 0) {
      setError("No valid files selected (max 10MB each)");
      return;
    }

    setError(null);
    setShowBounce(true);
    
    // Create new upload items for each valid file
    const newItems: UploadItem[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      progress: 0,
      status: 'pending'  // Start as pending
    }));

    setUploadItems(prev => [...prev, ...newItems]);

    setTimeout(() => {
      setShowBounce(false);
    }, 2000);

    // Reset the input value to allow uploading the same files again
    e.target.value = '';
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

  const handleGenerateHypotheses = async () => {
    try {
      // Get the current session from Supabase
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Generate a paper ID
      const paperId = Math.random().toString(36).substr(2, 9);

      // Update all items to uploading status
      setUploadItems(current => 
        current.map(item => ({
          ...item,
          status: 'uploading' as UploadStatus,
          progress: 0
        }))
      );

      // Upload each file using the API
      const uploadPromises = uploadItems.map(async (item) => {
        try {
          const formData = new FormData();
          formData.append('file', item.file);
          formData.append('user_id', userId);
          formData.append('paper_id', paperId);

          const response = await fetch('http://100.66.19.207:8080/upload_file', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const data = await response.json();
          
          // Log the response data to console
          console.error('File upload response:', {
            file: item.file.name,
            response: data
          });
          
          return {
            id: item.id,
            status: 'completed' as UploadStatus,
            progress: 100,
            file_id: data.file_id
          };
        } catch (error) {
          console.error('Error uploading file:', error);
          return {
            id: item.id,
            status: 'failed' as UploadStatus,
            error: error instanceof Error ? error.message : 'Upload failed'
          };
        }
      });

      const results = await Promise.all(uploadPromises);

      // Log all results to console
      console.error('All upload results:', results);

      // Update the status of each item
      setUploadItems(current => 
        current.map(item => {
          const result = results.find(r => r.id === item.id);
          return result ? { ...item, ...result } : item;
        })
      );

      // Check if any uploads failed
      const hasFailures = results.some(r => r.status === 'failed');
      if (hasFailures) {
        throw new Error('Some files failed to upload');
      }

      // Navigate to the project page with the paper ID
      router.push(`/projects/${paperId}`);
    } catch (error) {
      console.error('Error uploading files:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload files');
      // Update all items to failed status
      setUploadItems(current => 
        current.map(item => ({
          ...item,
          status: 'failed' as UploadStatus,
          error: error instanceof Error ? error.message : 'Upload failed'
        }))
      );
    }
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-400';
      case 'uploading': return 'bg-blue-300';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-200';
    }
  };

  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'uploading': return 'Uploading...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const areAllUploadsComplete = uploadItems.length > 0 && uploadItems.every(item => item.status === 'pending');
  const hasFailedUploads = uploadItems.some(item => item.status === 'failed');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Upload Research Data
          </h2>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Upload your research data files to generate hypotheses
          </p>
        </div>

        <div className="mt-8">
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

            {error && (
              <div className="mt-4 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {uploadItems.length > 0 && (
            <div className="mt-8 space-y-4">
              {uploadItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 w-32">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(item.status)} transition-all duration-300`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {getStatusText(item.status)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {item.error && (
                    <p className="mt-2 text-sm text-red-600">
                      {item.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {uploadItems.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleGenerateHypotheses}
                disabled={hasFailedUploads || !areAllUploadsComplete}
                className={`px-6 py-3 rounded-md text-white font-medium
                  ${hasFailedUploads || !areAllUploadsComplete
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-400 hover:bg-blue-500'
                  } transition-colors duration-200`}
              >
                Generate Hypotheses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
