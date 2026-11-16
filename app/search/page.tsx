
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const instant = false;

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { q } = await searchParams;
  const searchTerm = q?.trim() || "";

  const supabase = await createClient();

  let articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string | null;
  }[] = [];

  if (searchTerm) {
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, title, slug, excerpt, featured_image, published_at"
      )
      .eq("status", "published")
      .or(
        `title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`
      )
      .order("published_at", { ascending: false });

    if (error) {
      throw new Error("Unable to search news articles.");
    }

    articles = data || [];
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      <section className="bg-[#f3f6fb] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 py-12">
          <p className="text-red-600 uppercase font-bold text-sm tracking-widest">
            ALASS RADIO / NEWS SEARCH
          </p>

          <h1 className="text-3xl md:text-5xl font-black text-[#071d49] mt-3">
            Search News
          </h1>

          <form action="/search" method="GET" className="mt-8 max-w-2xl flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={searchTerm}
              placeholder="Search for news, topics or keywords..."
              className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-red-600"
            />

            <button
              type="submit"
              className="bg-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        {!searchTerm ? (
          <p className="text-gray-500 text-center py-12">
            Enter a keyword above to search our latest news.
          </p>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-[#071d49]">
              No results found
            </h2>
            <p className="text-gray-500 mt-3">
              We couldn't find published articles matching "{searchTerm}".
              Try another keyword.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#071d49] mb-8">
              {articles.length} {articles.length === 1 ? "result" : "results"} for "{searchTerm}"
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <Link href={`/news/${article.slug}`}>
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-56 object-cover"
                      />
                    ) : (
                      <div className="w-full h-56 bg-[#e8edf5] flex items-center justify-center">
                        <span className="font-bold text-[#071d49]">
                          ALASS RADIO
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-6">
                    <p className="text-xs text-gray-500">
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString(
                            "en-LR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </p>

                    <h3 className="text-xl font-bold text-[#071d49] mt-3 leading-snug hover:text-red-600">
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}

                    <Link
                      href={`/news/${article.slug}`}
                      className="inline-block mt-5 text-red-700 font-bold text-sm hover:text-red-900"
                    >
                      Read Full Story →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
