"use client"; // Ensure this component runs on the client side

import { useRouter } from "next/navigation"; // For programmatic navigation
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // For Supabase authentication
import { useState } from "react"; // For managing loading state
import { initiateChat } from "../api/chatbotService"; // Import the initiateChat function

export default function NewProjectButton() {
  const router = useRouter(); // Initialize the router for programmatic navigation
  const supabase = createClientComponentClient(); // Initialize Supabase client
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleNewProject = async () => {
    setLoading(true); // Set loading to true
    try {
      // Get the current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id; // Extract the user ID

      // If the user is not authenticated, throw an error
      if (!userId) throw new Error("User not authenticated");

      // Call the API to initiate a new chat session
      const { paper_id } = await initiateChat(userId);

      // If the API call fails to return a paper_id, throw an error
      if (!paper_id) throw new Error("Failed to get new project ID");

      // Navigate to the new project page with the paper_id as a query parameter
      router.push(`/projects/new?paper_id=${paper_id}`);
    } catch (err) {
      // Log any errors that occur
      console.error("Error creating project:", err);
    } finally {
      // Reset the loading state
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleNewProject} // Trigger handleNewProject when clicked
      className="bg-[#e8e4e4] rounded-xl p-4 w-[180px] h-[180px] flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition"
    >
      <button
        className="group cursor-pointer outline-none hover:rotate-90 duration-300"
        title="Add New"
        disabled={loading} // Disable the button when loading
      >
        <svg
          className="stroke-teal-500 fill-none group-hover:fill-teal-800 group-active:stroke-teal-200 group-active:fill-teal-600 group-active:duration-0 duration-300"
          viewBox="0 0 24 24"
          height="50px"
          width="50px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeWidth="1.5"
            d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
          ></path>
          <path strokeWidth="1.5" d="M8 12H16"></path>
          <path strokeWidth="1.5" d="M12 16V8"></path>
        </svg>
      </button>
      <p className="mt-2 text-sm font-semibold text-gray-900">
        {loading ? "Creating..." : "New Project"} {/* Show "Creating..." when loading */}
      </p>
    </div>
  );
}