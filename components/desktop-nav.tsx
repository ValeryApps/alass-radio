"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "LIBERIA", href: "/categories/liberia-news" },
  { label: "AFRICA", href: "/categories/africa-news" },
  { label: "POLITICS", href: "/categories/politics" },
  { label: "BUSINESS", href: "/categories/business-economy" },
  { label: "SPORTS", href: "/categories/sports" },
  { label: "WORLD", href: "/categories/international-news" },
  { label: "PODCASTS", href: "/podcasts" },
  { label: "PRESENTERS", href: "/presenters" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
];

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center justify-between py-4">
      <div className="flex items-center gap-3 lg:gap-5 xl:gap-7 text-[11px] lg:text-xs font-bold tracking-wide whitespace-nowrap">
        {navLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative py-2 transition-colors duration-200 ${
                isActive ? "text-[#e31b23]" : "text-white hover:text-red-400"
              }`}
            >
              {link.label}

              {isActive && (
                <span className="absolute left-0 right-0 -bottom-2 h-0.5 bg-[#e31b23]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
