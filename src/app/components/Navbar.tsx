"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Account", href: "/projects" },
  ];

  return (
    <header className="bg-white border-b px-10 py-3 flex items-center justify-between">
      <h1 className="text-[25px] font-bold text-gray-900">MedGem</h1>

      <nav className="flex items-center gap-8 text-[18px] font-semibold">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative pb-1 transition-all duration-200 ${
                isActive ? "text-black" : "text-gray-700"
              } group`}
            >
              {item.name}
              <span
                className={`absolute left-0 -bottom-[2px] h-[2px] w-full transition-all duration-300 ${
                  isActive
                    ? "bg-black scale-x-100"
                    : "bg-black scale-x-0 group-hover:scale-x-100"
                } origin-left`}
              />
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default Navbar;
