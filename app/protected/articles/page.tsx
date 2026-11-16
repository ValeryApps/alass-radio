"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Globe, EyeOff, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  category_id: string | null;
};

type Category = {
  id: string;
  name: string;
};

export default function ArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadArticles() {
    setLoading(true);

    const supabase = createClient();
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");

    if (categoryError) {
      console.error("Error loading categories:", categoryError);
    } else {
      setCategories(categoryData || []);
    }

    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        id,
        title,
        slug,
        status,
        published_at,
        created_at,
        category_id
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setArticles((data as Article[]) || []);
      setMessage("");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadArticles();
  }, []);

  async function changeStatus(article: Article) {
    const newStatus = article.status === "published" ? "draft" : "published";

    setBusyId(article.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("articles")
      .update({
        status: newStatus,
        published_at:
          newStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", article.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        newStatus === "published"
          ? "Article published successfully!"
          : "Article moved back to drafts.",
      );
      await loadArticles();
    }

    setBusyId(null);
  }

  async function deleteArticle(article: Article) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${article.title}"?`,
    );

    if (!confirmed) return;

    setBusyId(article.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", article.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Article deleted successfully.");
      await loadArticles();
    }

    setBusyId(null);
  }

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase()),
  );

  const publishedCount = articles.filter(
    (article) => article.status === "published",
  ).length;

  const draftCount = articles.filter(
    (article) => article.status === "draft",
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">News Articles</h1>
          <p className="text-gray-500 mt-2">
            Manage your ALASS Radio news publications.
          </p>
        </div>

        <button
          onClick={() => router.push("/protected/articles/new")}
          className="bg-blue-700 text-white px-5 py-3 rounded-lg hover:bg-blue-800"
        >
          + Create New Article
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Total Articles</p>
          <h2 className="text-3xl font-bold mt-2">{articles.length}</h2>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Published Articles</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {publishedCount}
          </h2>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Draft Articles</p>
          <h2 className="text-3xl font-bold text-orange-500 mt-2">
            {draftCount}
          </h2>
        </div>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles by headline..."
          className="w-full border rounded-lg p-3"
        />
      </div>

      {message && (
        <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
          {message}
        </div>
      )}

      <div className="border rounded-xl overflow-x-auto">
        {loading ? (
          <p className="p-6">Loading articles...</p>
        ) : filteredArticles.length === 0 ? (
          <p className="p-6 text-gray-500">No articles found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Headline</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id} className="border-t">
                  <td className="p-2 font-medium min-w-48">{article.title}</td>
                  <td className="p-2">
                    {categories.find(
                      (category) => category.id === article.category_id,
                    )?.name || "Uncategorized"}
                  </td>

                  <td className="p-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-1">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={busyId === article.id}
                        onClick={() => changeStatus(article)}
                        title={
                          article.status === "published"
                            ? "Unpublish article"
                            : "Publish article"
                        }
                        aria-label={
                          article.status === "published"
                            ? "Unpublish article"
                            : "Publish article"
                        }
                        className="border px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition disabled:opacity-50"
                      >
                        {busyId === article.id ? (
                          <Clock3 size={17} className="animate-spin" />
                        ) : article.status === "published" ? (
                          <EyeOff size={17} />
                        ) : (
                          <Globe size={17} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/protected/articles/${article.id}/edit`)
                        }
                        title="Edit article"
                        aria-label="Edit article"
                        className="border px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        disabled={busyId === article.id}
                        onClick={() => deleteArticle(article)}
                        title="Delete article"
                        aria-label="Delete article"
                        className="border border-red-300 text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 hover:border-red-400 transition disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
