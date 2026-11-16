"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AuthButton } from "./auth-button";

export default function MobileNav({
  authContent,
}: {
  authContent: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const closeMenu = () => setIsOpen(false);

  const mobileLinks = [
    { label: "POLITICS", href: "/categories/politics" },
    { label: "BUSINESS", href: "/categories/business-economy" },
    { label: "SPORTS", href: "/categories/sports" },
    { label: "WORLD", href: "/categories/international-news" },
    { label: "PODCASTS", href: "/podcasts" },
    { label: "PRESENTERS", href: "/presenters" },
    { label: "ABOUT", href: "/about" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <div className="flex items-center justify-between py-3">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-bold text-sm"
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="text-xl">{isOpen ? "✕" : "☰"}</span>
          MENU
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-3 w-64 bg-[#071d49] border border-white/20 shadow-xl z-50 flex flex-col">
            <Link
              href="/"
              onClick={closeMenu}
              aria-current={pathname === "/" ? "page" : undefined}
              className={`px-5 py-3 transition-colors ${
                pathname === "/"
                  ? "bg-red-700 text-white font-bold border-l-4 border-white"
                  : "hover:bg-red-700"
              }`}
            >
              HOME
            </Link>
            <Link
              href="/categories/liberia-news"
              onClick={closeMenu}
              aria-current={
                pathname.startsWith("/categories/liberia-news")
                  ? "page"
                  : undefined
              }
              className={`px-5 py-3 transition-colors ${
                pathname.startsWith("/categories/liberia-news")
                  ? "bg-red-700 text-white font-bold border-l-4 border-white"
                  : "hover:bg-red-700"
              }`}
            >
              LIBERIA
            </Link>
            <Link
              href="/categories/africa-news"
              onClick={closeMenu}
              aria-current={
                pathname.startsWith("/categories/africa-news")
                  ? "page"
                  : undefined
              }
              className={`px-5 py-3 transition-colors ${
                pathname.startsWith("/categories/africa-news")
                  ? "bg-red-700 text-white font-bold border-l-4 border-white"
                  : "hover:bg-red-700"
              }`}
            >
              AFRICA
            </Link>
            {mobileLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={`px-5 py-3 transition-colors ${
                    isActive
                      ? "bg-red-700 text-white font-bold border-l-4 border-white"
                      : "hover:bg-red-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-white/20 px-5 py-4">
              {authContent}
            </div>
          </div>
        )}
      </div>

      <Link
        href="/search"
        aria-label="Search news"
        className="text-xl hover:text-red-400"
      >
        ⌕
      </Link>
    </div>
  );
}
