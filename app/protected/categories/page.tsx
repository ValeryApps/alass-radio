"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export default function CategoriesPage() {
  const supabase = createClient();
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error loading categories:", error);
    } else {
      setCategories(data || []);
    }

    setLoading(false);
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!categoryName.trim() || !categorySlug.trim()) {
      setErrorMessage("Please enter both the category name and slug.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("categories").insert({
      name: categoryName.trim(),
      slug: categorySlug.trim(),
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Category created successfully!");
      setCategoryName("");
      setCategorySlug("");
      await loadCategories();
    }

    setSaving(false);
  }
  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
  }

  async function handleUpdateCategory() {
    if (!editingId || !editName.trim() || !editSlug.trim()) {
      setErrorMessage("Please enter both the category name and slug.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("categories")
      .update({
        name: editName.trim(),
        slug: editSlug.trim(),
      })
      .eq("id", editingId);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Category updated successfully!");
      cancelEditing();
      await loadCategories();
    }

    setSaving(false);
  }

  async function handleDeleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${category.name}"?`,
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    // Check whether any articles use this category.
    const { count, error: countError } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id);

    if (countError) {
      setErrorMessage(countError.message);
      return;
    }

    // Prevent deletion if articles are assigned to this category.
    if (count && count > 0) {
      setErrorMessage(
        `Cannot delete "${category.name}" because ${count} article(s) are assigned to it. Reassign those articles first.`,
      );
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Category deleted successfully!");
      await loadCategories();
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071d49]">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage the news categories on ALASS Radio.
        </p>
      </div>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#071d49]">
          Add New Category
        </h2>

        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setCategorySlug(generateSlug(e.target.value));
              }}
              placeholder="e.g. Technology"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#071d49]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category Slug
            </label>
            <input
              type="text"
              value={categorySlug}
              onChange={(e) => setCategorySlug(generateSlug(e.target.value))}
              placeholder="e.g. technology"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#071d49]"
            />
            <p className="mt-1 text-xs text-slate-500">
              This forms part of the category's web address.
            </p>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-sm text-green-600">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#071d49] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2b65] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Category"}
          </button>
        </form>
      </div>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Total Categories</p>
        <p className="mt-2 text-3xl font-bold text-[#071d49]">
          {categories.length}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-[#071d49]">All Categories</h2>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No categories found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Category Name</th>
                  <th className="px-5 py-3 font-semibold">Slug</th>
                  <th className="px-5 py-3 font-semibold">Created</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr key={category.id}>
                    {editingId === category.id ? (
                      <>
                        <td className="px-5 py-4">
                          <input
                            value={editName}
                            onChange={(e) => {
                              setEditName(e.target.value);
                              setEditSlug(generateSlug(e.target.value));
                            }}
                            className="w-full rounded border border-slate-300 px-2 py-1"
                          />
                        </td>

                        <td className="px-5 py-4">
                          <input
                            value={editSlug}
                            onChange={(e) =>
                              setEditSlug(generateSlug(e.target.value))
                            }
                            className="w-full rounded border border-slate-300 px-2 py-1"
                          />
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {new Date(category.created_at).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateCategory}
                              disabled={saving}
                              className="rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "Save"}
                            </button>

                            <button
                              onClick={cancelEditing}
                              className="rounded bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {category.name}
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {category.slug}
                        </td>

                        <td className="px-5 py-4 text-slate-500">
                          {new Date(category.created_at).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => startEditing(category)}
                              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="text-sm font-semibold text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {errorMessage && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}
    </div>
  );
}
