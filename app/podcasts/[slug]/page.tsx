import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";
import { notFound } from "next/navigation";
import PodcastViewCounter from "./view-counter";

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
  program_id: string | null;
  views: number;
};

type PodcastPresenter = {
  role: string;
  presenters: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    photo_url: string | null;
    radio_nickname: string | null;
  } | null;
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "Audio episode";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default async function PodcastEpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: podcast, error } = await supabase
    .from("podcasts")
    .select(
      "id, title, slug, description, cover_image, audio_url, duration, published_at, program_id, views",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !podcast) {
    notFound();
  }

  const episode = podcast as Podcast;

  let programmeName = "ALASS Radio";

  let podcastPresenters: PodcastPresenter[] = [];

  if (episode.program_id) {
    const { data: programme } = await supabase
      .from("radio_programmes")
      .select("name")
      .eq("id", episode.program_id)
      .single();

    if (programme) {
      programmeName = programme.name;
    }

    const { data: presenterAssignments, error: presenterError } = await supabase
      .from("programme_presenters")
      .select(
        `
        role,
        presenters (
          id,
          name,
          slug,
          bio,
          photo_url,
          radio_nickname
        )
      `,
      )
      .eq("programme_id", episode.program_id)
      .order("display_order", { ascending: true });

    if (presenterError) {
      console.error("Error fetching podcast presenters:", presenterError);
    }

    podcastPresenters = (presenterAssignments ??
      []) as unknown as PodcastPresenter[];
  }

  const { data: programmeEpisodes } = await supabase
    .from("podcasts")
    .select("id, title, slug, cover_image")
    .eq("status", "published")
    .eq("program_id", episode.program_id)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);

  let relatedPodcasts = programmeEpisodes ?? [];

  if (relatedPodcasts.length < 3) {
    const { data: otherEpisodes } = await supabase
      .from("podcasts")
      .select("id, title, slug, cover_image")
      .eq("status", "published")
      .neq("slug", slug)
      .order("published_at", { ascending: false })
      .limit(6);

    const existingIds = new Set(relatedPodcasts.map((item) => item.id));

    const additionalEpisodes = (otherEpisodes ?? [])
      .filter((item) => !existingIds.has(item.id))
      .slice(0, 3 - relatedPodcasts.length);

    relatedPodcasts = [...relatedPodcasts, ...additionalEpisodes];
  }

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <PodcastViewCounter podcastId={episode.id} />
      <section className="bg-[#071d49] px-5 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/podcasts"
            className="text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            ← Back to Podcasts
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">
              ALASS Radio Podcast
            </span>

            <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-slate-200">
              {programmeName}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">
            {episode.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-300">
            {episode.published_at && (
              <span>
                Published{" "}
                {new Date(episode.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}

            <span className="flex items-center gap-2">
              <span>👁</span>
              {episode.views.toLocaleString()} views
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-12 md:grid-cols-[1fr_1.2fr] sm:px-8 sm:py-16">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-[#071d49] shadow-lg">
            {episode.cover_image ? (
              <img
                src={episode.cover_image}
                alt={episode.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-3xl font-extrabold text-white">
                ALASS RADIO
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>ALASS Radio</span>
            <span>{formatDuration(episode.duration)}</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[#071d49]">
            Listen to this episode
          </h2>

          <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
            {episode.description || "Listen to this episode from ALASS Radio."}
          </p>
          {podcastPresenters.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-extrabold text-[#071d49]">
                Presented By
              </h3>

              <div className="space-y-4">
                {podcastPresenters.map((assignment, index) => {
                  const presenter = assignment.presenters;

                  if (!presenter) return null;

                  return (
                    <Link
                      key={`${presenter.id}-${index}`}
                      href={`/presenters/${presenter.slug}`}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-[#e31b23] hover:shadow-md"
                    >
                      {presenter.photo_url ? (
                        <img
                          src={presenter.photo_url}
                          alt={presenter.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                          👤
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-[#071d49]">
                          {presenter.name}
                        </p>

                        {presenter.radio_nickname && (
                          <p className="text-sm text-slate-500">
                            {presenter.radio_nickname}
                          </p>
                        )}

                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#e31b23]">
                          {assignment.role} · View Profile →
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-3 text-sm font-bold text-[#071d49]">
              Episode Audio
            </p>

            <audio
              controls
              preload="metadata"
              className="w-full"
              src={episode.audio_url}
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>
      </section>

      {relatedPodcasts && relatedPodcasts.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
          <div className="mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-extrabold text-[#071d49]">
              More Episodes
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPodcasts.map((related) => (
              <Link
                key={related.id}
                href={`/podcasts/${related.slug}`}
                className="overflow-hidden rounded-xl border border-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-video bg-[#071d49]">
                  {related.cover_image ? (
                    <img
                      src={related.cover_image}
                      alt={related.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-bold text-white">
                      ALASS RADIO
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-[#071d49]">{related.title}</h3>
                  <p className="mt-2 text-xs font-semibold text-[#e31b23]">
                    Listen to episode →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
