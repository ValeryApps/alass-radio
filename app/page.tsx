import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import FeaturedSlideshow from "@/components/featured-slideshow";
import CategoryNewsSections from "@/components/category-news-sections";

export const instant = false;

export default async function Home() {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, featured_image, published_at, created_at, category_id, views",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(8);

  const { data: featuredNews } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, featured_image, published_at, created_at, category_id, views",
    )
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(5);

  const { data: latestPodcasts } = await supabase
    .from("podcasts")
    .select("id, title, slug, cover_image, published_at, program_id")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  const { data: mostViewedPodcasts } = await supabase
    .from("podcasts")
    .select("id, title, slug, cover_image, views, program_id")
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(3);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const { data: radioProgrammes } = await supabase
    .from("radio_programmes")
    .select("id, name");
  const selectedCategorySlugs = [
    "business-economy",
    "africa-news",
    "politics",
    "international-news",
  ];

  const selectedCategories = (categories ?? []).filter(
    (category) =>
      selectedCategorySlugs.includes(category.slug) ||
      category.name.toLowerCase().includes("sport"),
  );

  const categoryNewsSections = (
    await Promise.all(
      selectedCategories.map(async (category) => {
        const { data } = await supabase
          .from("articles")
          .select(
            "id, title, slug, excerpt, featured_image, published_at, views",
          )
          .eq("status", "published")
          .eq("category_id", category.id)
          .order("published_at", { ascending: false })
          .limit(3);

        return {
          name: category.name,
          slug: category.slug,
          articles: data ?? [],
        };
      }),
    )
  ).filter((section) => section.articles.length > 0);
  const latestArticles = articles ?? [];
  const featuredArticles = featuredNews ?? [];
  const featuredArticle = featuredArticles[0];
  const otherArticles = latestArticles.slice(1);

  const getCategoryName = (categoryId: string | null) => {
    return (
      categories?.find((category) => category.id === categoryId)?.name || "News"
    );
  };
  const getProgrammeName = (programId: string | null) => {
    return (
      radioProgrammes?.find((programme) => programme.id === programId)?.name ||
      "ALASS Radio"
    );
  };
  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-LR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <SiteHeader
        headlines={featuredNews?.map((article) => article.title) || []}
      />

      {/* INTRODUCTION */}
      <section className="max-w-7xl mx-auto px-5 pt-12 pb-10">
        <div className="relative overflow-hidden rounded-2xl bg-[#f3f6fb] px-7 py-12 sm:px-12 sm:py-16">
          {/* Decorative accent */}
          <div className="absolute right-0 top-0 h-full w-2 bg-[#e31b23]" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[35px] border-[#071d49]/5" />

          <div className="relative max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-[3px] w-10 bg-[#e31b23]" />
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#e31b23]">
                ALASS RADIO NEWSROOM
              </p>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.12] tracking-tight text-[#071d49] sm:text-5xl lg:text-6xl">
              Bringing You the News That Matters.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
              Stay informed with the latest news, reports and developments from
              Liberia, Africa and around the world. We bring important stories
              closer to you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                href="#latest"
                className="inline-flex items-center gap-3 rounded-md bg-[#071d49] px-7 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#e31b23]"
              >
                Explore Latest News
                <span aria-hidden="true">→</span>
              </Link>

              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Informing · Connecting · Empowering
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED NEWS AND TOP HEADLINES */}
      {featuredArticle && (
        <section className="max-w-7xl mx-auto px-5 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* MAIN FEATURED STORY SLIDESHOW */}
            <div className="lg:col-span-2">
              <FeaturedSlideshow
                articles={featuredArticles.map((article) => ({
                  ...article,
                  categoryName: getCategoryName(article.category_id),
                  formattedDate: formatDate(article.published_at),
                }))}
              />
            </div>

            {/* TOP HEADLINES SIDEBAR */}
            <aside className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between border-b-2 border-[#e31b23] pb-3 mb-5">
                <h2 className="text-xl font-black text-[#071d49] uppercase">
                  Top Headlines
                </h2>
                <span className="text-xs text-gray-400">ALASS</span>
              </div>

              {otherArticles.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  More headlines will appear here as news is published.
                </p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {otherArticles.slice(0, 5).map((article, index) => (
                    <Link
                      key={article.id}
                      href={`/news/${article.slug}`}
                      className="flex gap-3 py-4 group"
                    >
                      <span className="text-2xl font-black text-gray-200">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <p className="text-[#e31b23] text-[10px] font-bold uppercase">
                          {getCategoryName(article.category_id)}
                        </p>

                        <h3 className="text-sm font-bold text-gray-800 leading-snug mt-1 group-hover:text-[#e31b23] transition">
                          {article.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-gray-400 text-xs mt-2">
                          <span>{formatDate(article.published_at)}</span>
                          <span>👁 {article.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* LATEST PODCASTS */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between border-b-2 border-[#e31b23] pb-3 mb-3">
                  <h2 className="text-lg font-black text-[#071d49] uppercase">
                    Latest Podcasts
                  </h2>
                  <span className="text-xs text-gray-400">ALASS</span>
                </div>

                {latestPodcasts?.length ? (
                  <div className="divide-y divide-gray-200">
                    {latestPodcasts.map((podcast) => (
                      <Link
                        key={podcast.id}
                        href={`/podcasts/${podcast.slug}`}
                        className="flex gap-3 py-3 group"
                      >
                        {podcast.cover_image ? (
                          <img
                            src={podcast.cover_image}
                            alt={podcast.title}
                            className="h-16 w-16 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[#f3f6fb] text-[#071d49]">
                            <span className="text-2xl">♫</span>
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-[#e31b23] text-[10px] font-bold uppercase">
                            {getProgrammeName(podcast.program_id)}
                          </p>

                          <h3 className="mt-1 text-sm font-bold leading-snug text-gray-800 group-hover:text-[#e31b23] transition">
                            {podcast.title}
                          </h3>

                          <p className="mt-2 text-xs text-gray-400">
                            {formatDate(podcast.published_at)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="py-3 text-sm text-gray-500">
                    No podcasts published yet.
                  </p>
                )}

                <Link
                  href="/podcasts"
                  className="mt-3 block text-center text-xs font-bold uppercase tracking-wider text-[#071d49] hover:text-[#e31b23]"
                >
                  View All Podcasts →
                </Link>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* LATEST NEWS */}
      <section id="latest" className="bg-[#f3f6fb] py-14">
        <div className="max-w-7xl mx-auto px-5">
          {/* SECTION HEADING */}
          <div className="flex justify-between items-end border-b-2 border-[#e31b23] pb-4 mb-10">
            <div>
              <p className="text-[#e31b23] text-xs font-black uppercase tracking-widest mb-2">
                Stay Informed
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-[#071d49] uppercase tracking-tight">
                Latest News
              </h2>
            </div>

            <span className="text-xs font-bold text-gray-500">
              ALASS RADIO NEWSROOM
            </span>
          </div>

          {categoryNewsSections?.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-lg">
              <h3 className="text-xl font-extrabold text-[#071d49]">
                No news available yet
              </h3>
              <p className="text-gray-500 mt-2">
                More stories will appear here as news is published.
              </p>
            </div>
          ) : (
            <CategoryNewsSections sections={categoryNewsSections} />
          )}
        </div>
      </section>

      {/* MOST VIEWED PODCASTS */}
      <section className="bg-[#f3f6fb] py-14">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-9 flex items-end justify-between border-b-2 border-[#e31b23] pb-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#e31b23]">
                Audience Favorites
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#071d49]">
                Most Viewed Podcasts
              </h2>
            </div>

            <Link
              href="/podcasts"
              className="text-xs font-bold uppercase text-[#071d49] transition hover:text-[#e31b23]"
            >
              All Podcasts →
            </Link>
          </div>

          {mostViewedPodcasts && mostViewedPodcasts.length > 0 ? (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {mostViewedPodcasts.map((podcast, index) => (
                <Link
                  key={podcast.id}
                  href={`/podcasts/${podcast.slug}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-video bg-[#071d49]">
                    {podcast.cover_image ? (
                      <img
                        src={podcast.cover_image}
                        alt={podcast.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl font-bold text-white">
                        ALASS RADIO
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-[#e31b23] px-3 py-1 text-xs font-bold text-white">
                      #{index + 1} Popular
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#e31b23]">
                      {getProgrammeName(podcast.program_id)}
                    </p>

                    <h3 className="mt-2 text-lg font-extrabold leading-snug text-[#071d49] transition group-hover:text-[#e31b23]">
                      {podcast.title}
                    </h3>

                    <p className="mt-4 text-sm font-semibold text-slate-500">
                      👁 {podcast.views.toLocaleString()} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              Popular podcasts will appear here as listeners discover our
              episodes.
            </p>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-7xl mx-auto px-5 py-14">
        <h2 className="text-2xl font-black">About ALASS Radio</h2>
        <p className="text-gray-600 mt-4 max-w-3xl leading-relaxed">
          ALASS Radio is committed to keeping audiences informed through
          reliable news, current affairs and informative programmes. Our mission
          is to bring important stories closer to the people.
        </p>
      </section>

      {/* FOOTER */}
      <SiteFooter />
    </main>
  );
}
