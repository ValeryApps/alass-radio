"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditPresenterPage() {
  const router = useRouter();
  const params = useParams();
  const presenterId = params.id as string;

  const [name, setName] = useState("");
  const [radioNickname, setRadioNickname] = useState("");
  const [bio, setBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPresenter() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("presenters")
        .select("*")
        .eq("id", presenterId)
        .single();

      if (error || !data) {
        setMessage("Could not load presenter information.");
        setLoading(false);
        return;
      }

      setName(data.name || "");
      setRadioNickname(data.radio_nickname || "");
      setBio(data.bio || "");
      setCurrentPhotoUrl(data.photo_url || "");
      setIsActive(data.is_active);
      setLoading(false);
    }

    if (presenterId) {
      loadPresenter();
    }
  }, [presenterId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter the presenter's name.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setMessage("Please sign in again.");
      setSaving(false);
      router.push("/auth/login");
      return;
    }

    let photoUrl = currentPhotoUrl || null;
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
        setSaving(false);
        return;
      }

      const { data: photoData } = supabase.storage
        .from("news-images")
        .getPublicUrl(photoPath);

      photoUrl = photoData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("presenters")
      .update({
        name: name.trim(),
        radio_nickname: radioNickname.trim() || null,
        bio: bio.trim() || null,
        photo_url: photoUrl,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", presenterId);

    if (updateError) {
      if (photoPath) {
        await supabase.storage.from("news-images").remove([photoPath]);
      }

      setMessage("Could not update presenter: " + updateError.message);
      setSaving(false);
      return;
    }

    setMessage("Presenter updated successfully!");
    setCurrentPhotoUrl(photoUrl || "");
    setPhotoFile(null);
    setPhotoPreview("");
    setPhotoError("");
    setSaving(false);

    router.refresh();
  }

  if (loading) {
    return <div className="p-6">Loading presenter information...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071d49]">Edit Presenter</h1>
        <p className="mt-2 text-gray-500">
          Update this ALASS Radio presenter's profile.
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
        </div>

        <div>
          <label className="mb-2 block font-semibold">Biography</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Presenter Photograph
          </label>

          {currentPhotoUrl && !photoPreview && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-600">
                Current Photograph
              </p>
              <img
                src={currentPhotoUrl}
                alt={name}
                className="h-48 w-48 rounded-xl object-cover"
              />
            </div>
          )}

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
              <p className="mb-2 font-medium">New Photograph Preview</p>
              <img
                src={photoPreview}
                alt="New presenter preview"
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
            disabled={saving}
            className="rounded-lg bg-[#071d49] px-6 py-3 font-semibold text-white transition hover:bg-[#e31b23] disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Presenter"}
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
