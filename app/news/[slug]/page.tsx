import Link from "next/link";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ArticleReactions from "@/components/article-reactions";
import ArticleComments from "@/components/article-comments";
import ArticleViewCounter from "./view-counter";

export const instant = false;

type NewsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewsArticlePage({ params }: NewsPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, excerpt, content, featured_image, published_at, category_id, author_id, updated_at, views",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !article) {
    notFound();
  }

  let authorName = "ALASS Radio";
  let authorAvatar: string | null = null;

  if (article.author_id) {
    const { data: authorProfile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", article.author_id)
      .maybeSingle();

    authorName = authorProfile?.full_name || "ALASS Radio";
    authorAvatar = authorProfile?.avatar_url || null;
  }

  let categoryName = "News";

  if (article.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", article.category_id)
      .maybeSingle();

    categoryName = category?.name || "News";
  }

  const safeContent = sanitizeHtml(article.content || "", {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "figure",
      "figcaption",
      "div",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-LR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <SiteHeader />
      <ArticleViewCounter articleId={article.id} />
      <article className="max-w-4xl mx-auto px-5 py-12">
        <p className="text-red-600 font-bold uppercase text-sm tracking-wide">
          {categoryName}
        </p>

        <h1 className="text-3xl md:text-5xl font-black leading-tight mt-4">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-xl text-gray-600 mt-5 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mt-6 mb-8">
          <div className="flex items-center gap-3">
            {authorAvatar && (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}

            <div>
              <p className="font-semibold text-gray-800">{authorName}</p>
              {formattedDate && <p>{formattedDate}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12Z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <span>{article.views.toLocaleString()} views</span>
          </div>
        </div>

        {article.featured_image && (
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full max-h-[520px] object-cover rounded-lg mb-10"
          />
        )}

        <div
          className="text-lg leading-8
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4
            [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:mb-5
            [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:mb-5
            [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:mb-5
            [&_li]:mb-2
            [&_blockquote]:border-l-4 [&_blockquote]:border-red-600
            [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:my-6
            [&_a]:text-blue-600 [&_a]:underline
            [&_img]:max-w-full [&_img]:rounded-lg"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
        <ArticleReactions articleId={article.id} />
        <ArticleComments articleId={article.id} />
        <div className="border-t border-gray-200 mt-12 pt-6">
          <Link
            href="/"
            className="inline-block bg-red-700 text-white px-6 py-3 rounded font-semibold hover:bg-red-800"
          >
            ← More News
          </Link>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
