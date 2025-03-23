"use client";
import { useEffect, useState } from "react";
import { MathJax } from 'react-mathjax';
import '../styles/latex.css';

interface Props {
  projectId: string;
  view: "selection" | "research" | "documents";
  setView: (view: "selection" | "research" | "documents") => void;
  expandedCard: number | null;
  setExpandedCard: (id: number | null) => void;
  selectedCard: number | null;
  setSelectedCard: (id: number | null) => void;
}

interface Hypothesis {
  title: string;
  description: string;
}

export default function ResearchPaperPanel({ 
  projectId, 
  view, 
  setView,
  expandedCard,
  setExpandedCard,
  selectedCard,
  setSelectedCard 
}: Props) {
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState("");
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load hypotheses from localStorage
    const storedHypotheses = localStorage.getItem('generatedHypotheses');
    if (storedHypotheses) {
      setHypotheses(JSON.parse(storedHypotheses));
    }
  }, []);

  useEffect(() => {
    const generateResearchPaper = async () => {
      if (selectedCard !== null && view === "research") {
        setLoading(true);
        setError(null);
        try {
          // Get the selected hypothesis
          const selectedHypothesis = hypotheses[selectedCard - 1];
          
          // Generate research paper
          const response = await fetch('/api/generate-research-paper', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hypothesis: selectedHypothesis }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to generate research paper');
          }

          const data = await response.json();
          setPaper(data.latex);
        } catch (error) {
          console.error('Error generating research paper:', error);
          setError(error instanceof Error ? error.message : 'Failed to generate research paper');
        } finally {
          setLoading(false);
        }
      }
    };

    generateResearchPaper();
  }, [projectId, selectedCard, view, hypotheses]);

  const renderContent = () => {
    if (view === "research") {
      if (loading) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        );
      }

      if (selectedCard !== null) {
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="prose max-w-none">
              <MathJax.Provider options={{
                tex2jax: {
                  inlineMath: [['$', '$']],
                  displayMath: [['$$', '$$']]
                }
              }}>
                <div className="latex-content" dangerouslySetInnerHTML={{ __html: paper }} />
              </MathJax.Provider>
            </div>
          </div>
        );
      }

      return (
        <p className="text-gray-500 italic">Please select a hypothesis from the Selections tab first.</p>
      );
    }

    if (view === "selection") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {hypotheses.map((hypothesis, index) => {
            const cardId = index + 1;
            const isExpanded = expandedCard === cardId;
            const isSelected = selectedCard === cardId;
            return (
              <div
                key={cardId}
                onClick={() => setSelectedCard(cardId)}
                className={`relative border transition-all duration-700 ease-in-out cursor-pointer
                  ${isExpanded ? "col-span-3 min-w-full min-h-[300px]" : "min-w-0 min-h-[160px]"}
                  ${isSelected 
                    ? "bg-blue-100 border-blue-500 ring-2 ring-blue-300 shadow-lg scale-[1.02]" 
                    : "bg-white border-gray-300 hover:scale-[1.03] hover:shadow-md"}
                  p-4 rounded-lg shadow-md`}                
              >
                <div className="text-xl font-bold text-gray-800 mb-1">#{cardId}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{hypothesis.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{hypothesis.description}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedCard(isExpanded ? null : cardId);
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
        <div className="text-gray-800 text-sm flex flex-col items-center gap-4">
          <p>View or manage uploaded documents here.</p>
          <button className="custom-button-blue">Download</button>
          <style jsx>{`
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
        </div>
      );
    }
  };

  return (
    <div className="relative">
      {renderContent()}

      {view !== "documents" && (
        <button
          onClick={() => setView(view === "selection" ? "research" : "documents")}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-black text-white shadow-lg transition duration-300 transform hover:scale-110 hover:bg-gray-900 flex items-center justify-center"
          aria-label="Toggle View"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
