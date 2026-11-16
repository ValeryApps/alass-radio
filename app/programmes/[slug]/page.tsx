import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";

type PresenterAssignment = {
  role: string;
  display_order: number;
  presenters: {
    name: string;
    radio_nickname: string | null;
    photo_url: string | null;
  } | null;
};
type Podcast = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  duration: number | null;
  published_at: string | null;
  views: number;
};
export const instant = false;

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: programme, error } = await supabase
    .from("radio_programmes")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !programme) {
    notFound();
  }
  const { data: presenterAssignments, error: presentersError } = await supabase
    .from("programme_presenters")
    .select(
      `
        role,
        display_order,
        presenters (
          name,
          radio_nickname,
          photo_url
        )
      `,
    )
    .eq("programme_id", programme.id)
    .order("display_order", { ascending: true });

  if (presentersError) {
    console.error("Error fetching programme presenters:", presentersError);
  }

  const presenterList = (presenterAssignments ??
    []) as unknown as PresenterAssignment[];
  const { data: podcasts, error: podcastsError } = await supabase
    .from("podcasts")
    .select(
      `
      id,
      title,
      slug,
      description,
      cover_image,
      duration,
      published_at,
      views
    `,
    )
    .eq("program_id", programme.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (podcastsError) {
    console.error("Error fetching programme podcasts:", podcastsError);
  }
  const podcastList = (podcasts ?? []) as unknown as Podcast[];
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-[#071d49] px-5 py-16 text-center text-white sm:py-20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
          ALASS Radio
        </p>

        <h1 className="text-4xl font-extrabold sm:text-5xl">
          {programme.name}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
          {programme.description ||
            "Discover this programme and explore its latest episodes."}
        </p>

        <div className="mx-auto mt-7 h-1 w-20 rounded-full bg-[#e31b23]" />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Link
          href="/programmes"
          className="text-sm font-bold text-[#e31b23] hover:underline"
        >
          ← Back to All Programmes
        </Link>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-extrabold text-[#071d49]">
            Meet Our Presenters
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Get to know the voices behind this programme.
          </p>
        </div>

        {presenterList.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Presenter information will be available soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {presenterList.map((assignment, index) => (
              <div
                key={`${assignment.role}-${assignment.display_order}-${index}`}
                className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
              >
                {assignment.presenters?.photo_url ? (
                  <img
                    src={assignment.presenters.photo_url}
                    alt={assignment.presenters.name}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-4xl shadow-md">
                    👤
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-[#071d49]">
                    {assignment.presenters?.name}
                  </h3>

                  {assignment.presenters?.radio_nickname && (
                    <p className="text-sm text-slate-500">
                      {assignment.presenters.radio_nickname}
                    </p>
                  )}

                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#e31b23]">
                    {assignment.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-extrabold text-[#071d49]">
            Latest Episodes
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Listen to the latest episodes from this programme.
          </p>
        </div>

        {podcastList.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-6 py-12 text-center">
            <h3 className="text-lg font-bold text-[#071d49]">
              No episodes available yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Published episodes from this programme will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {podcastList.map((podcast) => (
              <article
                key={podcast.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {podcast.cover_image ? (
                  <img
                    src={podcast.cover_image}
                    alt={podcast.title}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-[#071d49] text-5xl text-white">
                    🎙️
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-extrabold text-[#071d49]">
                    {podcast.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {podcast.description ||
                      "Listen to this episode from ALASS Radio."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                    {podcast.published_at && (
                      <span>
                        {new Date(podcast.published_at).toLocaleDateString()}
                      </span>
                    )}

                    <span>{podcast.views.toLocaleString()} views</span>

                    {podcast.duration !== null && (
                      <span>{Math.floor(podcast.duration / 60)} min</span>
                    )}
                  </div>

                  <Link
                    href={`/podcasts/${podcast.slug}`}
                    className="mt-6 inline-block rounded-lg bg-[#e31b23] px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Listen to Episode →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
