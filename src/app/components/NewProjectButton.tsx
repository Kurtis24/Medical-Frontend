import Link from "next/link";

export default function NewProjectButton() {
  return (
    <Link href="/projects/new">
      <div className="bg-[#e8e4e4] rounded-xl p-4 w-[180px] h-[180px] flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition">
        <button
          className="group cursor-pointer outline-none hover:rotate-90 duration-300"
          title="Add New"
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
        <p className="mt-2 text-sm font-semibold text-gray-900">New Project</p>
      </div>
    </Link>
  );
}
