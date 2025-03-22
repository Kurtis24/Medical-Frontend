"use client";
import { useState } from "react";

type Props = {
  projectId: string;
};

export default function ChatPanel({ projectId }: Props) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;
    const userMessage = input;
    setMessages((prev) => [...prev, `🧑: ${userMessage}`]);
    setInput("");

    // Send to your chatbot API
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ projectId, message: userMessage }),
    });
    const data = await res.json();

    setMessages((prev) => [...prev, `🤖: ${data.reply}`]);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Research Paper</h2>
      <div className="bg-gray-800 rounded-lg p-4 mb-4 text-sm">
        Upload a data file or ask me to help with your research paper.
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2 text-sm">
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-md px-2 py-1 text-sm"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="px-2 text-blue-500">➤</button>
      </div>
    </div>
  );
}
