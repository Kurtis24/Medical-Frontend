"use client";
import { useEffect, useState } from "react";

interface Props {
  projectId: string;
}

export default function ResearchPaperPanel({ projectId }: Props) {
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState("");
  const [view, setView] = useState<"research" | "selection" | "documents">("research");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

 useEffect(() => {
  const fetchPaper = async () => {
    if (selectedCard !== null && view === "research") {
      setLoading(true);
      try {
        const res = await fetch(`/api/research?projectId=${projectId}&selectionId=${selectedCard}`);
        const data = await res.json();
        setPaper(`In-depth analysis for Selection #${selectedCard}:\n\n${data.paper}`);
      } catch (error) {
        setPaper(`Failed to load research for Selection #${selectedCard}.`);
      } finally {
        setLoading(false);
      }
    }
  };

  fetchPaper();
}, [projectId, selectedCard, view]);


  const renderContent = () => {
    if (view === "research") {
      return loading ? (
        <p className="text-gray-800">Loading research paper...</p>
      ) : selectedCard !== null ? (
        <div className="border p-4 rounded-lg text-gray-800 text-sm whitespace-pre-wrap">
          {paper}
        </div>
      ) : (
        <p className="text-gray-500 italic">Please select an option from the Selections tab first.</p>
      );
    }

    if (view === "selection") {
      const sampleCards = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        title: `Option ${i + 1}`,
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      }));

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {sampleCards.map((card) => {
            const isExpanded = expandedCard === card.id;
            const isSelected = selectedCard === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card.id)}
                className={`relative bg-white border ${
                isSelected ? "border-blue-500 ring-2 ring-blue-300 shadow-lg scale-[1.02]" : "border-gray-300"
              } p-4 rounded-lg shadow-md transition-all duration-1500 ease-in-out cursor-pointer ${
                isExpanded ? "col-span-3 min-h-[300px]" : "min-h-[160px]"
              }`}
              >
                <div className="text-xl font-bold text-gray-800 mb-1">#{card.id}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{card.body}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCard(isExpanded ? null : card.id);
                  }}
                  className="absolute bottom-2 right-2"
                >
                  <svg
                    viewBox="0 0 448 512"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-600 transition-transform duration-300 ease-in-out"
                  >
                    <path
                      d={
                        isExpanded
                          ? "M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"
                          : "M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z"
                      }
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      );
    }

    if (view === "documents") {
      return (
        <div className="text-gray-800 text-sm">
          <p>View or manage uploaded documents here.</p>
        </div>
      );
    }
  };

  return (
    <div>
      {/* Toggle Tab Selector */}
      <div className="relative w-[250px] h-[36px] bg-white border-2 border-gray-800 rounded-full flex items-center shadow-md mb-6">
        {[
          { label: "Selections", value: "selection" },
          { label: "Research", value: "research" },
          { label: "Documents", value: "documents" },
        ].map((tab) => (
          <label
            key={tab.value}
            className="relative w-1/3 h-full flex items-center justify-center cursor-pointer group"
          >
            <input
              type="radio"
              name="tab"
              value={tab.value}
              checked={view === tab.value}
              onChange={() => setView(tab.value as typeof view)}
              className="absolute w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className={`w-full h-[28px] mx-[2px] rounded-full flex items-center justify-center transition-colors duration-200 ${
                view === tab.value ? "bg-gray-800 text-white" : "group-hover:bg-gray-200 text-gray-800"
              }`}
            >
              <span className="text-sm font-medium">{tab.label}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Content Switcher */}
      {renderContent()}
    </div>
  );
}
