"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Globe, EyeOff, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Podcast = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  audio_url: string;
  duration: number | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

export default function PodcastsPage() {
  const router = useRouter();

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadPodcasts() {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setPodcasts((data as Podcast[]) || []);
      setMessage("");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPodcasts();
  }, []);

  async function changeStatus(podcast: Podcast) {
    const newStatus = podcast.status === "published" ? "draft" : "published";

    setBusyId(podcast.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("podcasts")
      .update({
        status: newStatus,
        published_at:
          newStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", podcast.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        newStatus === "published"
          ? "Podcast published successfully!"
          : "Podcast moved back to drafts.",
      );
      await loadPodcasts();
    }

    setBusyId(null);
  }

  async function deletePodcast(podcast: Podcast) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${podcast.title}"?`,
    );

    if (!confirmed) return;

    setBusyId(podcast.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("podcasts")
      .delete()
      .eq("id", podcast.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Podcast deleted successfully.");
      await loadPodcasts();
    }

    setBusyId(null);
  }

  const filteredPodcasts = podcasts.filter((podcast) =>
    podcast.title.toLowerCase().includes(search.toLowerCase()),
  );

  const publishedCount = podcasts.filter(
    (podcast) => podcast.status === "published",
  ).length;

  const draftCount = podcasts.filter(
    (podcast) => podcast.status === "draft",
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Podcasts</h1>
          <p className="text-gray-500 mt-2">
            Manage your ALASS Radio podcast episodes.
          </p>
        </div>

        <button
          onClick={() => router.push("/protected/podcasts/new")}
          className="bg-blue-700 text-white px-5 py-3 rounded-lg hover:bg-blue-800"
        >
          + Add New Podcast
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Total Podcasts</p>
          <h2 className="text-3xl font-bold mt-2">{podcasts.length}</h2>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Published Podcasts</p>
          <h2 className="text-3xl font-bold text-green-600 mt-2">
            {publishedCount}
          </h2>
        </div>

        <div className="border rounded-xl p-5">
          <p className="text-gray-500 text-sm">Draft Podcasts</p>
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
          placeholder="Search podcasts by title..."
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
          <p className="p-6">Loading podcasts...</p>
        ) : filteredPodcasts.length === 0 ? (
          <p className="p-6 text-gray-500">No podcasts found.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Episode Title</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPodcasts.map((podcast) => (
                <tr key={podcast.id} className="border-t">
                  <td className="p-4 font-medium min-w-48">{podcast.title}</td>

                  <td className="p-4 whitespace-nowrap">
                    {podcast.duration
                      ? `${Math.floor(podcast.duration / 60)} min`
                      : "Not specified"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        podcast.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {podcast.status}
                    </span>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {new Date(podcast.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={busyId === podcast.id}
                        onClick={() => changeStatus(podcast)}
                        title={
                          podcast.status === "published"
                            ? "Unpublish podcast"
                            : "Publish podcast"
                        }
                        aria-label={
                          podcast.status === "published"
                            ? "Unpublish podcast"
                            : "Publish podcast"
                        }
                        className="border px-3 py-2 rounded-lg text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition disabled:opacity-50"
                      >
                        {busyId === podcast.id ? (
                          <Clock3 size={17} className="animate-spin" />
                        ) : podcast.status === "published" ? (
                          <EyeOff size={17} />
                        ) : (
                          <Globe size={17} />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          router.push(`/protected/podcasts/${podcast.id}/edit`)
                        }
                        title="Edit podcast"
                        aria-label="Edit podcast"
                        className="border px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        disabled={busyId === podcast.id}
                        onClick={() => deletePodcast(podcast)}
                        title="Delete podcast"
                        aria-label="Delete podcast"
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
