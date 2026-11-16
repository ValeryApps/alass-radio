"use client";
export const instant = false;

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export function EditArticleForm() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadArticle() {
      const supabase = createClient();

      const [articleResult, categoryResult] = await Promise.all([
        supabase
          .from("articles")
          .select(
            "title, excerpt, content, category_id, featured_image, is_featured",
          )
          .eq("id", articleId)
          .single(),

        supabase.from("categories").select("id, name").order("name"),
      ]);

      if (articleResult.error) {
        setMessage("Could not load article: " + articleResult.error.message);
      } else {
        setTitle(articleResult.data.title);
        setExcerpt(articleResult.data.excerpt || "");
        setContent(articleResult.data.content);
        setCategoryId(articleResult.data.category_id || "");
        setCurrentImageUrl(articleResult.data.featured_image || "");
        setIsFeatured(articleResult.data.is_featured || false);
      }

      if (categoryResult.error) {
        setMessage(
          "Could not load categories: " + categoryResult.error.message,
        );
      } else {
        setCategories(categoryResult.data || []);
      }

      setLoading(false);
    }

    loadArticle();
  }, [articleId]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    let newImageUrl = currentImageUrl;
    let newImagePath = "";

    try {
      // Upload a replacement image if one was selected.
      if (imageFile) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Could not verify your account.");
        }

        const fileExtension = imageFile.name.split(".").pop()?.toLowerCase();

        if (
          !fileExtension ||
          !["jpg", "jpeg", "png", "webp"].includes(fileExtension)
        ) {
          throw new Error("Please select a JPG, PNG, or WebP image.");
        }

        newImagePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(newImagePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error("Image upload failed: " + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("news-images")
          .getPublicUrl(newImagePath);

        newImageUrl = publicUrlData.publicUrl;
      }

      // Update the article.
      const { error: updateError } = await supabase
        .from("articles")
        .update({
          title,
          excerpt,
          content,
          category_id: categoryId || null,
          featured_image: newImageUrl || null,
          is_featured: isFeatured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", articleId);

      if (updateError) {
        // Remove the newly uploaded image if the article update fails.
        if (newImagePath) {
          await supabase.storage.from("news-images").remove([newImagePath]);
        }

        throw new Error("Article update failed: " + updateError.message);
      }

      // Delete the old image only after the article update succeeds.
      if (imageFile && currentImageUrl) {
        try {
          const oldImageUrl = new URL(currentImageUrl);
          const storagePath = "/storage/v1/object/public/news-images/";

          if (oldImageUrl.pathname.includes(storagePath)) {
            const oldImagePath = decodeURIComponent(
              oldImageUrl.pathname.split(storagePath)[1],
            );

            if (oldImagePath) {
              const { error: deleteError } = await supabase.storage
                .from("news-images")
                .remove([oldImagePath]);

              if (deleteError) {
                setMessage(
                  "Article updated, but the old image could not be deleted: " +
                    deleteError.message,
                );
              }
            }
          }
        } catch {
          setMessage(
            "Article updated, but the old image could not be deleted.",
          );
        }
      }

      setCurrentImageUrl(newImageUrl);
      setImageFile(null);
      setPreviewUrl("");
      setMessage((previousMessage) =>
        previousMessage.startsWith("Article updated, but")
          ? previousMessage
          : "Article updated successfully!",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading article...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit News Article</h1>
        <p className="text-gray-500 mt-2">
          Make changes to your ALASS Radio news story.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Article Headline</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Short Description</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
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
          <label className="block font-semibold mb-2">Featured Image</label>

          {(previewUrl || currentImageUrl) && (
            <div className="mb-4">
              <img
                src={previewUrl || currentImageUrl}
                alt="Article featured image"
                className="w-full max-w-md h-56 object-cover rounded-lg border"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;

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
            Choose a new image only if you want to replace the current one.
            Maximum size: 5 MB.
          </p>
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
          <label className="block font-semibold mb-2">News Content</label>
          <ArticleEditor value={content} onChange={setContent} />
        </div>

        {message && (
          <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
            {message}
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/protected/articles")}
            className="border px-6 py-3 rounded-lg"
          >
            Back to Articles
          </button>
        </div>
      </form>
    </div>
  );
}
