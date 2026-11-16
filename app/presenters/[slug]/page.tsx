import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";

type ProgrammeAssignment = {
  role: string;
  radio_programmes: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  } | null;
};

export const instant = false;

export default async function PresenterProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: presenter, error } = await supabase
    .from("presenters")
    .select("id, name, slug, bio, photo_url, radio_nickname")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !presenter) {
    notFound();
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("programme_presenters")
    .select(
      `
      role,
      radio_programmes (
        id,
        name,
        slug,
        description
      )
    `,
    )
    .eq("presenter_id", presenter.id);

  if (assignmentsError) {
    console.error("Error fetching presenter programmes:", assignmentsError);
  }

  const programmeList = (assignments ?? []) as unknown as ProgrammeAssignment[];

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-[#071d49] px-5 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/podcasts"
            className="text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            ← Back to Podcasts
          </Link>

          <div className="mt-10 flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
            {presenter.photo_url ? (
              <img
                src={presenter.photo_url}
                alt={presenter.name}
                className="h-40 w-40 rounded-full border-4 border-white/20 object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/10 text-6xl">
                👤
              </div>
            )}

            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
                ALASS Radio Presenter
              </p>

              <h1 className="text-3xl font-extrabold sm:text-5xl">
                {presenter.name}
              </h1>

              {presenter.radio_nickname && (
                <p className="mt-3 text-lg text-slate-300">
                  {presenter.radio_nickname}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <div className="mb-12">
          <h2 className="mb-5 border-b border-slate-200 pb-4 text-2xl font-extrabold text-[#071d49]">
            About the Presenter
          </h2>

          <p className="whitespace-pre-line text-base leading-8 text-slate-600">
            {presenter.bio || "Presenter biography coming soon."}
          </p>
        </div>

        <div>
          <div className="mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-extrabold text-[#071d49]">
              Programmes
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Discover the programmes featuring this presenter.
            </p>
          </div>

          {programmeList.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No programmes available yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {programmeList.map((assignment, index) => {
                const programme = assignment.radio_programmes;

                if (!programme) return null;

                return (
                  <Link
                    key={`${programme.id}-${index}`}
                    href={`/programmes/${programme.slug}`}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#e31b23] hover:shadow-lg"
                  >
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#e31b23]">
                      {assignment.role}
                    </p>

                    <h3 className="text-xl font-extrabold text-[#071d49]">
                      {programme.name}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {programme.description ||
                        "Discover this programme on ALASS Radio."}
                    </p>

                    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#e31b23]">
                      Explore Programme →
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
