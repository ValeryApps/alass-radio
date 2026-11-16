"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MediaFile = {
  name: string;
  created_at: string;
  metadata: {
    mimetype?: string;
    size?: number;
  } | null;
};

type Article = {
  title: string;
  featured_image: string | null;
};

export default function MediaPage() {
  const supabase = createClient();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  
  async function loadMedia() {
    
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.storage
      .from("news-images")
      .list("f10bcbe9-67f9-42e8-80d5-9de8a486543b", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      setErrorMessage(error.message);
    } else {
      const imageFiles = (data || []).filter((file) => {
        return (
          file.metadata?.mimetype?.startsWith("image/") ||
          /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
        );
      });

      setFiles(imageFiles as MediaFile[]);
    }
const { data: articleData, error: articleError } = await supabase
  .from("articles")
  .select("title, featured_image");

if (articleError) {
  setErrorMessage(articleError.message);
} else {
  setArticles(articleData || []);
}
    setLoading(false);
    
  }
  async function handleDelete(file: MediaFile) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${file.name}"?`,
    );

    if (!confirmed) return;

    setErrorMessage("");

    const filePath = `f10bcbe9-67f9-42e8-80d5-9de8a486543b/${file.name}`;

    // Get the image's public URL.
    const { data } = supabase.storage
      .from("news-images")
      .getPublicUrl(filePath);

    // Check whether an article uses this image as its featured image.
    const { count, error: checkError } = await supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("featured_image", data.publicUrl);

    if (checkError) {
      setErrorMessage(checkError.message);
      return;
    }

    if (count && count > 0) {
      setErrorMessage(
        `This image cannot be deleted because it is used by ${count} article(s).`,
      );
      return;
    }

    // Delete the image from Supabase Storage.
    const { error } = await supabase.storage
      .from("news-images")
      .remove([filePath]);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.filter((item) => item.name !== file.name),
    );
  }
  useEffect(() => {
    loadMedia();
  }, []);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071d49]">Media Library</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse and manage your uploaded news images.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Total Images</p>
        <p className="mt-2 text-3xl font-bold text-[#071d49]">{files.length}</p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading images...</p>
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-semibold text-slate-700">No images found</p>
          <p className="mt-2 text-sm text-slate-500">
            Images uploaded to your news-images bucket will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {files.map((file) => {
            const { data } = supabase.storage
              .from("news-images")
              .getPublicUrl(
                `f10bcbe9-67f9-42e8-80d5-9de8a486543b/${file.name}`,
              );
const relatedArticle = articles.find(
  (article) => article.featured_image === data.publicUrl,
);
            return (
              <div
                key={file.name}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-video bg-slate-100">
                  <img
                    src={data.publicUrl}
                    alt={file.name}
                    onClick={() => setSelectedImage(data.publicUrl)}
                    className="h-full w-full cursor-pointer object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="mb-2 text-sm font-bold text-[#071d49]">
                    {relatedArticle
                      ? relatedArticle.title
                      : "Not assigned to an article"}
                  </p>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {file.metadata?.size
                      ? `${(file.metadata.size / 1024).toFixed(1)} KB`
                      : "File size unavailable"}
                  </p>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data.publicUrl);
                      alert("Image URL copied successfully!");
                    }}
                    className="mt-4 w-full rounded-lg bg-[#071d49] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d2b65]"
                  >
                    Copy Image URL
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="mt-2 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Delete Image
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-5xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white px-3 py-1 text-xl font-bold text-black shadow-lg"
            >
              &times;
            </button>

            <img
              src={selectedImage}
              alt="Full-size preview"
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
