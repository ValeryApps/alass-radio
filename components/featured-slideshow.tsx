"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type FeaturedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  categoryName: string;
  formattedDate: string;
  views: number;
};

type FeaturedSlideshowProps = {
  articles: FeaturedArticle[];
};

export default function FeaturedSlideshow({
  articles,
}: FeaturedSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (articles.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % articles.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [articles.length, isPaused]);

  if (articles.length === 0) return null;

  const article = articles[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? articles.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % articles.length);
  };

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="bg-[#e31b23] text-white px-3 py-1 text-xs font-black uppercase">
          Featured Story
        </span>

        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
          {article.categoryName}
        </span>
      </div>

      <div className="relative">
        <div className="h-64 sm:h-80 lg:h-[420px] bg-gray-100 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
            }}
          >
            {articles.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group block w-full h-full shrink-0"
              >
                {item.featured_image ? (
                  <img
                    src={item.featured_image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#071d49] text-white text-3xl font-black">
                    ALASS RADIO
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {articles.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous featured story"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-[#e31b23] transition"
            >
              ←
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next featured story"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-[#e31b23] transition"
            >
              →
            </button>
          </>
        )}
      </div>

      {articles.length > 1 && (
        <div className="flex items-center gap-2 mt-4 mb-5">
          {articles.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show featured story ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                activeIndex === index
                  ? "w-8 bg-[#e31b23]"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      <div key={article.id} className="mt-5 animate-in fade-in duration-700">
        <Link href={`/news/${article.slug}`} className="group block">
          <p className="text-[#e31b23] text-xs font-bold uppercase tracking-wider">
            {article.categoryName}
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#071d49] leading-tight mt-2 group-hover:text-[#e31b23] transition">
            {article.title}
          </h2>

          <p className="text-gray-600 mt-4 leading-relaxed text-base">
            {article.excerpt || "Read the latest news from ALASS Radio."}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <span>{article.formattedDate}</span>
              <span>👁 {article.views.toLocaleString()} views</span>
            </div>

            <span className="text-[#e31b23] font-bold text-sm">
              READ FULL STORY →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
