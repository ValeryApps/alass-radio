"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Programme = {
  id: string;
  name: string;
};

export default function NewPodcastPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [programId, setProgramId] = useState("");
  const [programmesLoading, setProgrammesLoading] = useState(true);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [coverError, setCoverError] = useState("");

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [duration, setDuration] = useState<number | null>(null);

  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProgrammes() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("radio_programmes")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        setMessage("Could not load programmes: " + error.message);
      } else {
        setProgrammes((data as Programme[]) || []);
      }

      setProgrammesLoading(false);
    }

    loadProgrammes();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!audioFile) {
      setMessage("Please select an audio file.");
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
      title
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    const audioExtension =
      audioFile.name.split(".").pop()?.toLowerCase() || "mp3";

    const audioPath = `${userData.user.id}/${crypto.randomUUID()}.${audioExtension}`;

    const { error: audioUploadError } = await supabase.storage
      .from("podcasts")
      .upload(audioPath, audioFile, {
        contentType: audioFile.type || "audio/mpeg",
        upsert: false,
      });

    if (audioUploadError) {
      setMessage("Audio upload failed: " + audioUploadError.message);
      setLoading(false);
      return;
    }

    const { data: audioUrlData } = supabase.storage
      .from("podcasts")
      .getPublicUrl(audioPath);

    let coverImage: string | null = null;
    let coverPath: string | null = null;

    if (coverFile) {
      const coverExtension =
        coverFile.name.split(".").pop()?.toLowerCase() || "jpg";

      coverPath = `${userData.user.id}/${crypto.randomUUID()}.${coverExtension}`;

      const { error: coverUploadError } = await supabase.storage
        .from("news-images")
        .upload(coverPath, coverFile, {
          contentType: coverFile.type,
          upsert: false,
        });

      if (coverUploadError) {
        await supabase.storage.from("podcasts").remove([audioPath]);

        setMessage("Cover image upload failed: " + coverUploadError.message);
        setLoading(false);
        return;
      }

      const { data: coverUrlData } = supabase.storage
        .from("news-images")
        .getPublicUrl(coverPath);

      coverImage = coverUrlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("podcasts").insert({
      title,
      slug,
      description,
      program_id: programId,
      cover_image: coverImage,
      audio_url: audioUrlData.publicUrl,
      duration,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    if (insertError) {
      await supabase.storage.from("podcasts").remove([audioPath]);

      if (coverPath) {
        await supabase.storage.from("news-images").remove([coverPath]);
      }

      setMessage("Could not save podcast: " + insertError.message);
    } else {
      setMessage(
        status === "published"
          ? "Podcast published successfully!"
          : "Podcast saved as draft successfully!",
      );

      setTitle("");
      setDescription("");
      setProgramId("");
      setCoverFile(null);
      setCoverPreview("");
      setCoverError("");
      setAudioFile(null);
      setAudioPreview("");
      setDuration(null);
      setStatus("draft");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Podcast</h1>
        <p className="text-gray-500 mt-2">
          Upload, organize and publish podcast episodes for ALASS Radio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2">Episode Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter podcast episode title"
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
            placeholder="Write a short description of this episode..."
            rows={4}
            className="w-full border rounded-lg p-3"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Radio Programme</label>

          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            required
            disabled={programmesLoading}
            className="w-full border rounded-lg p-3"
          >
            <option value="">
              {programmesLoading
                ? "Loading programmes..."
                : "Select a radio programme"}
            </option>

            {programmes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {programme.name}
              </option>
            ))}
          </select>

          <p className="mt-2 text-sm text-gray-500">
            Select the radio programme this episode belongs to.
          </p>
        </div>
        <div>
          <label className="block font-semibold mb-2">
            Podcast Cover Image
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
                setCoverFile(null);
                setCoverPreview("");
                e.target.value = "";
                setCoverError(
                  "Invalid image format. Please select JPEG, PNG or WebP.",
                );
                return;
              }

              if (file.size > 5 * 1024 * 1024) {
                setCoverFile(null);
                setCoverPreview("");
                e.target.value = "";
                setCoverError(
                  `This image is ${(file.size / (1024 * 1024)).toFixed(2)} MB. Maximum allowed size is 5 MB.`,
                );
                return;
              }

              setCoverFile(file);
              setCoverPreview(URL.createObjectURL(file));
              setCoverError("");
            }}
            className="w-full border rounded-lg p-3"
          />

          {coverError && (
            <p className="mt-2 text-sm font-semibold text-red-600">
              {coverError}
            </p>
          )}

          <p className="text-sm text-gray-500 mt-2">
            Accepted formats: JPG, PNG and WebP. Maximum size: 5 MB.
          </p>

          {coverPreview && (
            <div className="mt-4">
              <p className="font-medium mb-2">Cover Image Preview</p>
              <img
                src={coverPreview}
                alt="Podcast cover preview"
                className="w-full max-w-sm h-64 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-2">Audio File</label>

          <input
            type="file"
            required
            accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/ogg,audio/x-m4a"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              if (file.type && !file.type.startsWith("audio/")) {
                setAudioFile(null);
                setAudioPreview("");
                setDuration(null);
                e.target.value = "";
                setMessage("Please select a valid audio file.");
                return;
              }

              setAudioFile(file);
              setAudioPreview(URL.createObjectURL(file));
              setDuration(null);
              setMessage("");
            }}
            className="w-full border rounded-lg p-3"
          />

          <p className="text-sm text-gray-500 mt-2">
            Supported formats include MP3, WAV, M4A and OGG.
          </p>

          {audioFile && (
            <div className="mt-4 rounded-lg border p-4 bg-gray-50">
              <p className="font-semibold mb-2">
                Selected Audio: {audioFile.name}
              </p>

              <audio
                controls
                src={audioPreview}
                className="w-full"
                onLoadedMetadata={(e) => {
                  const audioDuration = e.currentTarget.duration;

                  if (Number.isFinite(audioDuration)) {
                    setDuration(Math.round(audioDuration));
                  }
                }}
              />

              {duration !== null && (
                <p className="text-sm text-gray-600 mt-2">
                  Episode Duration: {Math.floor(duration / 60)} min{" "}
                  {duration % 60} sec
                </p>
              )}
            </div>
          )}
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

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Save Podcast"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/protected/podcasts")}
            className="border px-6 py-3 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
