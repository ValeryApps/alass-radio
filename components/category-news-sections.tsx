import Link from "next/link";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  views: number;
  published_at: string | null;
};

type CategorySection = {
  name: string;
  slug: string;
  articles: Article[];
};

export default function CategoryNewsSections({
  sections,
}: {
  sections: CategorySection[];
}) {
  return (
    <div className="space-y-14">
      {sections.map((section) => (
        <section key={section.slug}>
          {/* CATEGORY HEADING */}
          <div className="flex items-center justify-between border-b-2 border-[#e31b23] pb-3 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#071d49]">
              {section.name}
            </h2>

            <Link
              href={`/categories/${section.slug}`}
              className="text-xs sm:text-sm font-bold text-[#e31b23] hover:text-[#071d49] transition"
            >
              More News →
            </Link>
          </div>

          {/* DESKTOP: THREE HORIZONTAL CARDS */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-6">
            {section.articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition"
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {article.featured_image ? (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#071d49] flex items-center justify-center text-white font-black">
                      ALASS RADIO
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-black text-[#071d49] leading-snug group-hover:text-[#e31b23] transition line-clamp-3">
                    {article.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                    {article.excerpt ||
                      "Read this latest report from ALASS Radio."}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                    <span>👁</span>
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* MOBILE: VERTICAL NEWS LIST */}
          <div className="sm:hidden divide-y divide-gray-200">
            {section.articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="flex gap-3 py-4 group"
              >
                {article.featured_image && (
                  <div className="w-24 h-20 shrink-0 overflow-hidden rounded-md bg-gray-200">
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-[#e31b23] transition">
                    {article.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-2">
                    <span>
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString(
                            "en-LR",
                          )
                        : ""}
                    </span>

                    <span>👁 {article.views.toLocaleString()} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
