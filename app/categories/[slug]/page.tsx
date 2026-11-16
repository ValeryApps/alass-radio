
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const instant = false;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Find the selected category
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (categoryError || !category) {
    notFound();
  }

  // Retrieve published articles in this category
  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, featured_image, published_at, created_at , views"
    )
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load category articles.");
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      {/* CATEGORY INTRODUCTION */}
      <section className="bg-[#f3f6fb] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 py-12">
          <p className="text-red-600 uppercase font-bold text-sm tracking-widest">
            ALASS RADIO / NEWS CATEGORY
          </p>

          <h1 className="text-3xl md:text-5xl font-black text-[#071d49] mt-3">
            {category.name}
          </h1>

          <p className="text-gray-600 mt-4 max-w-2xl">
            Latest news, reports and developments in {category.name}.
          </p>

          <p className="text-sm text-gray-500 mt-4">
            {articles.length} {articles.length === 1 ? "article" : "articles"} published
          </p>
        </div>
      </section>

      {/* CATEGORY ARTICLES */}
      <section className="max-w-7xl mx-auto px-5 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-[#071d49]">
              No articles yet
            </h2>
            <p className="text-gray-500 mt-3">
              There are currently no published articles in this category.
              Please check back later.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-red-700 text-white px-6 py-3 rounded font-semibold hover:bg-red-800"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const displayDate = article.published_at || article.created_at;

              return (
                <article
                  key={article.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
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
                        <span className="text-[#071d49] font-bold">
                          ALASS RADIO
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-6">
                    <p className="text-xs text-red-600 font-bold uppercase tracking-wide">
                      {category.name}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>
                        {displayDate
                          ? new Date(displayDate).toLocaleDateString("en-LR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""}
                      </span>

                      <span>👁 {article.views.toLocaleString()} views</span>
                    </div>

                    <h2 className="text-xl font-bold text-[#071d49] mt-3 leading-snug hover:text-red-600">
                      <Link href={`/news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>

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
              );
            })}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
