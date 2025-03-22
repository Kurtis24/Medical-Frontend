"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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
      // Create FormData with all files
      const formData = new FormData();
      uploadItems.forEach(item => {
        formData.append('files', item.file);
      });

      // Update all items to uploading status
      setUploadItems(current => 
        current.map(item => ({
          ...item,
          status: 'uploading',
          progress: 0
        }))
      );

      const response = await fetch('/api/generate-hypotheses', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate hypotheses');
      }
      
      // Store the hypotheses in localStorage for the project page to access
      localStorage.setItem('generatedHypotheses', JSON.stringify(data.hypotheses));
      
      // Generate a new project ID and navigate to the project page
      const projectId = Math.random().toString(36).substr(2, 9);
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error generating hypotheses:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate hypotheses');
      // Update all items to failed status
      setUploadItems(current => 
        current.map(item => ({
          ...item,
          status: 'failed',
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

        <div className="mt-12">
          <div className="max-w-xl mx-auto">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                <svg
                  className={`mx-auto h-12 w-12 text-gray-400 ${showBounce ? 'animate-bounce' : ''}`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="font-medium text-indigo-600 hover:text-indigo-500">
                    Upload files
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  CSV, XLSX, or JSON files up to 10MB
                </p>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.json"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {uploadItems.length > 0 && (
              <div className="mt-6 space-y-4">
                {uploadItems.map((item) => (
                  <div key={item.id} className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(item.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-500 bg-blue-100">
                              {getStatusText(item.status)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-500">
                              {item.progress}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                          <div
                            style={{ width: `${item.progress}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getStatusColor(item.status)} transition-all duration-500`}
                          />
                        </div>
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
              <div className="mt-6">
                <button
                  onClick={handleGenerateHypotheses}
                  disabled={uploadItems.some(item => item.status === 'uploading')}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    uploadItems.some(item => item.status === 'uploading')
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400'
                  }`}
                >
                  Generate Hypotheses
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
