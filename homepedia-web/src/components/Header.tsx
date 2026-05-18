"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Carte" },
  { href: "/pays", label: "Pays" },
  { href: "/countries", label: "Données" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="h-14 flex items-center px-6 border-b border-gray-200 bg-white shrink-0">
      <span className="text-lg font-semibold tracking-tight text-gray-800">
        Homepedia
      </span>
      <nav className="ml-8 flex gap-1">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === href
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
