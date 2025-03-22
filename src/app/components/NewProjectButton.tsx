"use client";
import Link from "next/link";

const NewProjectButton = () => {
  return (
    <Link href="/projects/new">
      <div className="bg-[#e8e4e4] rounded-xl p-4 w-[180px] h-[180px] flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition">
        <div className="text-3xl text-gray-900">＋</div>
        <p className="mt-2 text-sm font-semibold text-gray-900">New Project</p>
      </div>
    </Link>
  );
};

export default NewProjectButton;
