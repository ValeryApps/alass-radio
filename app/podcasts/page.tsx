import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";

export const instant = false;

type Podcast = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  audio_url: string;
  duration: number | null;
  published_at: string | null;
  views: number;
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "Audio episode";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default async function PodcastsPage() {
  const supabase = await createClient();

  const { data: podcasts, error } = await supabase
    .from("podcasts")
    .select(
      "id, title, slug, description, cover_image, audio_url, duration, published_at, views",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching podcasts:", error);
  }

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="bg-[#071d49] px-5 py-16 text-center text-white sm:py-20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
          ALASS Radio
        </p>

        <h1 className="text-4xl font-extrabold sm:text-5xl">Our Podcasts</h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
          Listen to news, discussions, interviews and stories that keep you
          informed and connected.
        </p>

        <div className="mx-auto mt-7 h-1 w-20 rounded-full bg-[#e31b23]" />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-9 flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#071d49]">
              Latest Episodes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Explore our latest audio programs.
            </p>
          </div>

          <span className="hidden rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#e31b23] sm:inline-block">
            ALASS Podcasts
          </span>
        </div>

        {!podcasts || podcasts.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <h3 className="text-xl font-bold text-[#071d49]">
              No podcasts available yet
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              New episodes will appear here as soon as they are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {podcasts.map((podcast: Podcast) => (
              <article
                key={podcast.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-square bg-[#071d49]">
                  {podcast.cover_image ? (
                    <img
                      src={podcast.cover_image}
                      alt={podcast.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl font-extrabold text-white">
                      ALASS RADIO
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase text-[#e31b23]">
                      Podcast
                    </span>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span>👁</span>
                        {podcast.views.toLocaleString()} views
                      </span>

                      <span>{formatDuration(podcast.duration)}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold leading-snug text-[#071d49]">
                    <Link
                      href={`/podcasts/${podcast.slug}`}
                      className="transition-colors hover:text-[#e31b23]"
                    >
                      {podcast.title}
                    </Link>
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {podcast.description ||
                      "Listen to this episode from ALASS Radio."}
                  </p>

                  <audio
                    controls
                    preload="metadata"
                    className="mt-6 w-full"
                    src={podcast.audio_url}
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
