import Link from "next/link";
import MobileNav from "./mobile-nav";
import DesktopNav from "./desktop-nav";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "./auth-button";
import HeadlineTicker from "./headlines-ticker";

export default async function SiteHeader({
  headlines = [],
}: {
  headlines?: string[];
}) {
  const supabase = await createClient();

  const { data: headlineArticles } = await supabase
    .from("articles")
    .select("title")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10);

  const tickerHeadlines =
    headlineArticles?.map((article) => article.title) ?? headlines;
  return (
    <>
      {/* TOP INFORMATION BAR */}
      <div className="bg-[#071d49] text-white text-xs">
        <div className="max-w-7xl mx-auto px-5 py-2 flex justify-between items-center">
          <p>MONROVIA, LIBERIA | ALASS RADIO NEWSROOM</p>
          <p className="hidden sm:block">Your News. Your Voice. Your Radio.</p>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="bg-white border-b border-gray-200">
        <Link href="/" className="hidden sm:block w-full">
          <img
            src="/banner.png"
            alt="ALASS Radio"
            className="block w-full h-auto object-contain"
          />
        </Link>
        <div className="max-w-7xl mx-auto px-5 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <Link href="/" className="block w-full max-w-[420px]">
              {/* Desktop logo */}

              {/* Mobile logo */}
              <img
                src="/alass-radio-icon.png"
                alt="ALASS Radio"
                className="block sm:hidden w-24 h-24 mx-auto object-contain"
              />
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500">
                DIGITAL NEWS NETWORK
              </span>
              <span className="bg-red-600 text-white px-3 py-2 text-xs font-bold rounded">
                NEWSROOM
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="bg-[#071d49] text-white">
          <div className="max-w-7xl mx-auto px-5">
            {/* DESKTOP NAVIGATION */}
            <div className="hidden lg:flex items-center justify-between py-4">
              <DesktopNav />

              <div className="flex items-center gap-5">
                <Link
                  href="/search"
                  aria-label="Search news"
                  className="hover:text-red-400"
                >
                  <span className="text-xl">⌕</span>
                </Link>

                <AuthButton />
              </div>
            </div>

            {/* MOBILE NAVIGATION */}
            <div className="lg:hidden">
              <MobileNav authContent={<AuthButton />} />
            </div>
          </div>
        </nav>
      </header>

      {/* BREAKING NEWS TICKER */}
      <div className="bg-[#e31b23] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="bg-[#071d49] px-4 py-3 text-xs font-black whitespace-nowrap">
            ALASS UPDATE
          </div>

          <HeadlineTicker headlines={tickerHeadlines} />
        </div>
      </div>
    </>
  );
}
