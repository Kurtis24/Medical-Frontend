"use client";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { sendMessage, initiateChat, uploadFile } from "../api/chatbotService";
import type { ChatResponse } from "../api/chatbotService";
import ReactMarkdown from 'react-markdown';

type Props = {
  projectId: string;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPanel({ projectId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          throw new Error("User not authenticated");
        }

        // Initialize chat with the backend
        const response = await initiateChat(session.user.id);
        console.log('Chat initialized:', response);

        // Add initial system message
        setMessages([{
          role: 'assistant',
          content: 'Hello! I can help you with your research paper. You can ask me questions or upload data files.',
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to initialize chat. Please try refreshing the page.');
      }
    };

    initializeChat();
  }, [projectId, supabase.auth]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Add user message to chat
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }]);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Send message to backend
      const response: ChatResponse = await sendMessage(
        session.user.id,
        userMessage,
        projectId
      );

      // Add assistant response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get paper ID from localStorage
      const paperId = localStorage.getItem('currentPaperId');
      if (!paperId) {
        throw new Error("No paper ID found");
      }

      // Upload the file
      const response = await uploadFile(file, session.user.id, paperId);
      console.error('File upload response:', response);

      // Add success message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `File "${file.name}" uploaded successfully.`,
        timestamp: new Date()
      }]);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Failed to upload file "${file.name}". Please try again.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Research Paper</h2>
      <div className="bg-gray-800 rounded-lg p-4 mb-4 text-sm text-white">
        Upload a data file or ask me to help with your research paper.
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      return (
                        <code
                          className={`${className} ${
                            inline ? 'bg-gray-200 rounded px-1' : 'block bg-gray-100 p-2 rounded'
                          }`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    pre({ node, children, ...props }) {
                      return (
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto" {...props}>
                          {children}
                        </pre>
                      );
                    },
                    p({ children }) {
                      return <p className="text-sm mb-2">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc list-inside text-sm mb-2">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal list-inside text-sm mb-2">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="text-sm mb-1">{children}</li>;
                    },
                    h1({ children }) {
                      return <h1 className="text-lg font-bold mb-2">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="text-md font-bold mb-2">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="text-sm font-bold mb-2">{children}</h3>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              <p className="text-xs mt-1 opacity-70">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className={`px-4 py-1 rounded-md ${
              isLoading || !input.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? '...' : '➤'}
          </button>
        </div>
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".csv,.xlsx,.xls,.txt,.pdf"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`w-full p-2 rounded-md text-sm flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}
