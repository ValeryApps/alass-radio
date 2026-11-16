"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Mail,
  Tags,
  Images,
  Settings,
  Menu,
  X,
  Radio,
  Podcast,
  Users,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/protected",
    icon: LayoutDashboard,
  },
  {
    name: "News Articles",
    href: "/protected/articles",
    icon: Newspaper,
  },
  {
    name: "Contact Messages",
    href: "/protected/messages",
    icon: Mail,
  },
  {
    name: "Programmes",
    href: "/protected/programmes",
    icon: Radio,
  },
  {
    name: "Programme Presenters",
    href: "/protected/programme-presenters",
    icon: Users,
  },
  {
    name: "Podcasts",
    href: "/protected/podcasts",
    icon: Podcast,
  },
  {
    name: "Presenters",
    href: "/protected/presenters",
    icon: Users,
  },
];

const upcomingTools = [
  { name: "Categories", icon: Tags },
  { name: "Media Library", icon: Images },
  { name: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="border-b bg-white p-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-[#071d49]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          {mobileOpen ? "Close Menu" : "Admin Menu"}
        </button>
      </div>

      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } w-full shrink-0 border-r border-slate-200 bg-white lg:block lg:min-h-screen lg:w-64`}
      >
        <div className="p-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/protected"
                  ? pathname === "/protected"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-[#071d49] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <p className="mb-4 mt-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            Other Tools
          </p>

          <div className="space-y-2">
            {upcomingTools.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.name}
                  className="flex cursor-not-allowed items-center justify-between rounded-lg px-4 py-3 text-sm text-slate-400"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={19} />
                    {item.name}
                  </span>
                  <span className="text-[10px]">Soon</span>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
