"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const ArticleEditor = dynamic(() => import("@/components/article-editor"), {
  ssr: false,
  loading: () => <div className="border rounded-lg p-4">Loading editor...</div>,
});

type Category = {
  id: string;
  name: string;
};

export default function NewArticlePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) {
        setMessage(error.message);
        return;
      }

      setCategories(data || []);
    }

    loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setMessage("Please sign in again.");
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    const slug =
      title
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    let featuredImage: string | null = null;

    if (imageFile) {
      const fileExtension =
        imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${userData.user.id}/${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        setMessage("Image upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("news-images")
        .getPublicUrl(filePath);

      featuredImage = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("articles").insert({
      title,
      slug,
      excerpt,
      content,
      featured_image: featuredImage,
      category_id: categoryId || null,
      author_id: userData.user.id,
      status,
      is_featured: isFeatured,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        status === "published"
          ? "Article published successfully!"
          : "Article saved as draft successfully!",
      );

      setTitle("");
      setExcerpt("");
      setContent("");
      setCategoryId("");
      setStatus("draft");
      setImageFile(null);
      setPreviewUrl("");
      setIsFeatured(false);
    }

    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create News Article</h1>
        <p className="text-gray-500 mt-2">
          Write, organize and publish news for ALASS Radio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Article Headline</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your news headline"
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Short Description</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a short summary of the news..."
            rows={3}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">News Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Featured News Image
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              if (
                !["image/jpeg", "image/png", "image/webp"].includes(file.type)
              ) {
                setImageFile(null);
                setPreviewUrl("");
                e.target.value = "";
                setImageError(
                  "Invalid image format. Please select a JPEG, PNG or WebP image.",
                );
                return;
              }

              if (file.size > 5 * 1024 * 1024) {
                setImageFile(null);
                setPreviewUrl("");
                e.target.value = "";
                setImageError(
                  `This image is ${(file.size / (1024 * 1024)).toFixed(2)} MB. The maximum allowed size is 5 MB. Please choose a smaller image.`,
                );
                return;
              }

              setImageFile(file);
              setPreviewUrl(URL.createObjectURL(file));
              setMessage("");
            }}
            className="w-full border rounded-lg p-3"
          />
          {imageError && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              {imageError}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Accepted formats: JPG, PNG and WebP. Maximum size: 5 MB.
          </p>

          {previewUrl && (
            <div className="mt-4">
              <p className="font-medium mb-2">Image Preview</p>
              <img
                src={previewUrl}
                alt="Featured news preview"
                className="w-full max-w-md h-64 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-2">News Content</label>
          <ArticleEditor value={content} onChange={setContent} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mt-1 h-5 w-5 accent-red-600"
            />

            <div>
              <span className="font-semibold text-[#071d49]">
                Feature this article on the homepage
              </span>

              <p className="text-sm text-gray-500 mt-1">
                Selected articles can appear in the Featured Stories slideshow.
              </p>
            </div>
          </label>
        </div>
        <div>
          <label className="block font-semibold mb-2">Publication Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish Article</option>
          </select>
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Article"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/protected")}
            className="border px-6 py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
