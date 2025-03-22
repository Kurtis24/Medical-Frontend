"use client";
import { use, useState } from "react";
import Navbar from "../../components/Navbar";
import ChatPanel from "../../components/ChatPanel";
import ResearchPaperPanel from "../../components/ResearchPaperPanel";


export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params); // ✅ Unwrap params safely
  const [fileUploaded, setFileUploaded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Reusable Navbar */}
      <Navbar />

      {/* 🔵 Content Layout */}
      <div className="flex flex-1">
        {/* Sidebar Chat Panel */}
        <aside className="w-[300px] border-r bg-white p-4 flex flex-col">
          <ChatPanel projectId={projectId} />
        </aside>

        {/* Main Research Output */}
        <main className="flex-1 p-6 overflow-auto relative">
          {/* ✅ Container for positioning */}
          <div className="relative">


            {/* Research Paper Panel */}
            <ResearchPaperPanel projectId={projectId} />
          </div>
        </main>
      </div>
    </div>
  );
}
