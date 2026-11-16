"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewPresenterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [radioNickname, setRadioNickname] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter the presenter's name.");
      return;
    }

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
      name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    let photoUrl: string | null = null;
    let photoPath: string | null = null;

    if (photoFile) {
      const extension = photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

      photoPath = `${userData.user.id}/presenters/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("news-images")
        .upload(photoPath, photoFile, {
          contentType: photoFile.type,
          upsert: false,
        });

      if (uploadError) {
        setMessage("Photo upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: photoData } = supabase.storage
        .from("news-images")
        .getPublicUrl(photoPath);

      photoUrl = photoData.publicUrl;
    }

    const { error: insertError } = await supabase.from("presenters").insert({
      name: name.trim(),
      radio_nickname: radioNickname.trim() || null,
      slug,
      bio: bio.trim() || null,
      photo_url: photoUrl,
      is_active: isActive,
    });

    if (insertError) {
      if (photoPath) {
        await supabase.storage.from("news-images").remove([photoPath]);
      }

      setMessage("Could not save presenter: " + insertError.message);
    } else {
      setMessage("Presenter added successfully!");

      setName("");
      setBio("");
      setPhotoFile(null);
      setPhotoPreview("");
      setPhotoError("");
      setIsActive(true);
      setRadioNickname("");
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071d49]">Add New Presenter</h1>
        <p className="mt-2 text-gray-500">
          Create a profile for an ALASS Radio presenter.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-semibold">
            Presenter Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter presenter's full name"
            className="w-full rounded-lg border p-3"
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold">Radio Nickname</label>
          <input
            type="text"
            value={radioNickname}
            onChange={(e) => setRadioNickname(e.target.value)}
            placeholder="Enter radio nickname (optional)"
            className="w-full rounded-lg border p-3"
          />
          <p className="mt-2 text-sm text-gray-500">
            The name listeners know the presenter by.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Biography</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short biography about the presenter..."
            rows={5}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Presenter Photograph
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
                setPhotoFile(null);
                setPhotoPreview("");
                e.target.value = "";
                setPhotoError(
                  "Invalid image format. Please select JPEG, PNG or WebP.",
                );
                return;
              }

              if (file.size > 5 * 1024 * 1024) {
                setPhotoFile(null);
                setPhotoPreview("");
                e.target.value = "";
                setPhotoError("Maximum photograph size is 5 MB.");
                return;
              }

              setPhotoFile(file);
              setPhotoPreview(URL.createObjectURL(file));
              setPhotoError("");
            }}
            className="w-full rounded-lg border p-3"
          />

          <p className="mt-2 text-sm text-gray-500">
            Accepted formats: JPG, PNG and WebP. Maximum size: 5 MB.
          </p>

          {photoError && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              {photoError}
            </p>
          )}

          {photoPreview && (
            <div className="mt-4">
              <p className="mb-2 font-medium">Photograph Preview</p>
              <img
                src={photoPreview}
                alt="Presenter preview"
                className="h-48 w-48 rounded-xl object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block font-semibold">Profile Status</label>

          <select
            value={isActive ? "active" : "inactive"}
            onChange={(e) => setIsActive(e.target.value === "active")}
            className="w-full rounded-lg border p-3"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {message && (
          <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-800">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#071d49] px-6 py-3 font-semibold text-white transition hover:bg-[#e31b23] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Presenter"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/protected/presenters")}
            className="rounded-lg border px-6 py-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
