import React from "react";

interface DownloadButtonProps {
  fileUrl: string;
  fileName: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ fileUrl, fileName }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="p-2 rounded-md hover:bg-gray-200 transition-all"
    >
      {/* Update the src path to use the correct relative path */}
      <img src="/downloadsvg.svg" alt="Download" className="w-6 h-6" />
    </button>
  );
};

export default DownloadButton;
