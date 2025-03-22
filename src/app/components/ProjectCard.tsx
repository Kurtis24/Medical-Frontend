"use client";
import Link from "next/link";

type Props = {
  id: string;
  title: string;
  gradientId: string;
  gradientColors: { from: string; to: string };
  lastOpened: string;
};

const ProjectCard = ({ id, title, gradientId, gradientColors, lastOpened }: Props) => {
  return (
    <Link href={`/projects/${id}`}>
      <div className="bg-[#e8e4e4] rounded-xl p-4 w-[180px] h-[180px] hover:scale-105 transition cursor-pointer flex flex-col justify-between">
        
        {/* Title now left-aligned */}
        <h2 className="text-sm font-medium text-gray-900 self-start">{title}</h2>

        <svg
          viewBox="0 0 24 24"
          fill={`url(#${gradientId})`}
          xmlns="http://www.w3.org/2000/svg"
          className="h-100 w-auto self-start"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradientColors.from} />
              <stop offset="100%" stopColor={gradientColors.to} />
            </linearGradient>
          </defs>
          <path
            d="M10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4Z"
            stroke={`url(#${gradientId})`}
            fill={`url(#${gradientId})`}
            strokeWidth="1.5"
          />
        </svg>

        <p className="text-[10px] text-gray-700 self-start mt-1">Last Opened: {lastOpened}</p>
      </div>
    </Link>
  );
};

export default ProjectCard;
