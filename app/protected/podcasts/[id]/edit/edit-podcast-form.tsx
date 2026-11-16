"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Programme = {
  id: string;
  name: string;
  is_active: boolean;
};
export function EditPodcastForm() {
  const router = useRouter();
  const params = useParams();
  const podcastId = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [programId, setProgramId] = useState("");
  const [programmesLoading, setProgrammesLoading] = useState(true);

  const [currentCoverUrl, setCurrentCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverError, setCoverError] = useState("");

  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [duration, setDuration] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPodcast() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("podcasts")
        .select(
          "title, description, cover_image, audio_url, duration, status, program_id",
        )
        .eq("id", podcastId)
        .single();

      if (error) {
        setMessage("Could not load podcast: " + error.message);
      } else {
        setTitle(data.title);
        setDescription(data.description || "");
        setCurrentCoverUrl(data.cover_image || "");
        setCurrentAudioUrl(data.audio_url);
        setDuration(data.duration);
        setStatus(data.status);
        setProgramId(data.program_id || "");
      }

      setLoading(false);
    }
    async function loadProgrammes() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("radio_programmes")
        .select("id, name, is_active")
        .order("name", { ascending: true });

      if (error) {
        setMessage("Could not load programmes: " + error.message);
      } else {
        setProgrammes(data || []);
      }

      setProgrammesLoading(false);
    }

    loadPodcast();
    loadProgrammes();
  }, [podcastId]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    let newCoverPath = "";
    let newAudioPath = "";

    let newCoverUrl = currentCoverUrl;
    let newAudioUrl = currentAudioUrl;
    let newDuration = duration;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please sign in again.");
      }

      // Upload replacement cover image.
      if (coverFile) {
        const extension = coverFile.name.split(".").pop()?.toLowerCase();

        if (!extension || !["jpg", "jpeg", "png", "webp"].includes(extension)) {
          throw new Error("Please select a JPG, PNG, or WebP cover image.");
        }

        newCoverPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(newCoverPath, coverFile, {
            contentType: coverFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error("Cover upload failed: " + uploadError.message);
        }

        const { data } = supabase.storage
          .from("news-images")
          .getPublicUrl(newCoverPath);

        newCoverUrl = data.publicUrl;
      }

      // Upload replacement audio file.
      if (audioFile) {
        const extension = audioFile.name.split(".").pop()?.toLowerCase();

        if (
          !extension ||
          !["mp3", "wav", "m4a", "aac", "ogg"].includes(extension)
        ) {
          throw new Error(
            "Please select an MP3, WAV, M4A, AAC, or OGG audio file.",
          );
        }

        newAudioPath = `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("podcasts")
          .upload(newAudioPath, audioFile, {
            contentType: audioFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error("Audio upload failed: " + uploadError.message);
        }

        const { data } = supabase.storage
          .from("podcasts")
          .getPublicUrl(newAudioPath);

        newAudioUrl = data.publicUrl;
      }

      // Update podcast information.
      const { error: updateError } = await supabase
        .from("podcasts")
        .update({
          title,
          description,
          cover_image: newCoverUrl || null,
          audio_url: newAudioUrl,
          duration: newDuration,
          program_id: programId,
          status,
          published_at:
            status === "published" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", podcastId);

      if (updateError) {
        throw new Error("Podcast update failed: " + updateError.message);
      }

      // Delete replaced files only after the database update succeeds.
      if (coverFile && currentCoverUrl) {
        try {
          const oldUrl = new URL(currentCoverUrl);
          const marker = "/storage/v1/object/public/news-images/";

          if (oldUrl.pathname.includes(marker)) {
            const oldPath = decodeURIComponent(
              oldUrl.pathname.split(marker)[1],
            );

            if (oldPath) {
              const { error } = await supabase.storage
                .from("news-images")
                .remove([oldPath]);

              if (error) {
                setMessage(
                  "Podcast updated, but the old cover image could not be deleted.",
                );
              }
            }
          }
        } catch {
          setMessage(
            "Podcast updated, but the old cover image could not be deleted.",
          );
        }
      }

      if (audioFile && currentAudioUrl) {
        try {
          const oldUrl = new URL(currentAudioUrl);
          const marker = "/storage/v1/object/public/podcasts/";

          if (oldUrl.pathname.includes(marker)) {
            const oldPath = decodeURIComponent(
              oldUrl.pathname.split(marker)[1],
            );

            if (oldPath) {
              const { error } = await supabase.storage
                .from("podcasts")
                .remove([oldPath]);

              if (error) {
                setMessage(
                  "Podcast updated, but the old audio file could not be deleted.",
                );
              }
            }
          }
        } catch {
          setMessage(
            "Podcast updated, but the old audio file could not be deleted.",
          );
        }
      }

      setCurrentCoverUrl(newCoverUrl);
      setCurrentAudioUrl(newAudioUrl);
      setCoverFile(null);
      setAudioFile(null);
      setCoverPreview("");
      setAudioPreview("");

      setMessage((previous) =>
        previous.startsWith("Podcast updated, but")
          ? previous
          : "Podcast updated successfully!",
      );
    } catch (error) {
      // Remove newly uploaded files if the update fails.
      if (newCoverPath) {
        await supabase.storage.from("news-images").remove([newCoverPath]);
      }

      if (newAudioPath) {
        await supabase.storage.from("podcasts").remove([newAudioPath]);
      }

      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading podcast...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Podcast</h1>
        <p className="text-gray-500 mt-2">
          Make changes to your ALASS Radio podcast episode.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Episode Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Episode Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border rounded-lg p-3"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Radio Programme
          </label>

          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            required
            disabled={programmesLoading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="">
              {programmesLoading
                ? "Loading programmes..."
                : "Select a programme"}
            </option>

            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.name}
                {!programme.is_active ? " (Inactive)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-2">Cover Image</label>

          {(coverPreview || currentCoverUrl) && (
            <div className="mb-4">
              <img
                src={coverPreview || currentCoverUrl}
                alt="Podcast cover"
                className="w-full max-w-sm h-64 object-cover rounded-lg border"
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
                setCoverFile(null);
                setCoverPreview("");
                e.target.value = "";
                setCoverError("Please select a JPEG, PNG, or WebP image.");
                return;
              }

              if (file.size > 5 * 1024 * 1024) {
                setCoverFile(null);
                setCoverPreview("");
                e.target.value = "";
                setCoverError(
                  `This image is ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum size is 5 MB.`,
                );
                return;
              }

              setCoverFile(file);
              setCoverPreview(URL.createObjectURL(file));
              setCoverError("");
              setMessage("");
            }}
            className="w-full border rounded-lg p-3"
          />

          {coverError && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              {coverError}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-2">
            Choose a new image only if you want to replace the current one.
            Maximum size: 5 MB.
          </p>
        </div>

        <div>
          <label className="block font-semibold mb-2">Audio File</label>

          <input
            type="file"
            accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/ogg,audio/x-m4a"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              if (file.type && !file.type.startsWith("audio/")) {
                e.target.value = "";
                setMessage("Please select a valid audio file.");
                return;
              }

              setAudioFile(file);
              setAudioPreview(URL.createObjectURL(file));
              setMessage("");
            }}
            className="w-full border rounded-lg p-3"
          />

          <p className="text-sm text-gray-500 mt-2">
            Select a new audio file only if you want to replace the current one.
          </p>

          <div className="mt-4 rounded-lg border p-4 bg-gray-50">
            <p className="font-semibold mb-2">
              {audioFile ? "New Audio Preview" : "Current Audio"}
            </p>

            <audio
              controls
              src={audioPreview || currentAudioUrl}
              className="w-full"
              onLoadedMetadata={(e) => {
                const audioDuration = e.currentTarget.duration;

                if (Number.isFinite(audioDuration)) {
                  const seconds = Math.round(audioDuration);
                  setDuration(seconds);

                  if (audioFile) {
                    setAudioFile((current) => current);
                  }
                }
              }}
            />

            {duration !== null && (
              <p className="text-sm text-gray-600 mt-2">
                Duration: {Math.floor(duration / 60)} min {duration % 60} sec
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Publication Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish Podcast</option>
          </select>
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
            onClick={() => router.push("/protected/podcasts")}
            className="border px-6 py-3 rounded-lg"
          >
            Back to Podcasts
          </button>
        </div>
      </form>
    </div>
  );
}
