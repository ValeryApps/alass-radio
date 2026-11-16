import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";

export const instant = false;

type Programme = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  programme_presenters: {
    role: string;
    display_order: number;
    presenters: {
      name: string;
      radio_nickname: string | null;
      photo_url: string | null;
    } | null;
  }[];
};

export default async function ProgrammesPage() {
  const supabase = await createClient();

  const { data: programmes, error } = await supabase
    .from("radio_programmes")
    .select(
      `
    id,
    name,
    slug,
    description,
    programme_presenters (
      role,
      display_order,
      presenters (
        name,
        radio_nickname,
        photo_url
      )
    )
  `,
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching programmes:", error);
  }
  const programmeList = (programmes ?? []) as unknown as Programme[];
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-[#071d49] px-5 py-16 text-center text-white sm:py-20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
          ALASS Radio
        </p>

        <h1 className="text-4xl font-extrabold sm:text-5xl">Our Programmes</h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
          Discover our radio programmes, explore interesting discussions, and
          listen to episodes covering topics that matter to you.
        </p>

        <div className="mx-auto mt-7 h-1 w-20 rounded-full bg-[#e31b23]" />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-9 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-extrabold text-[#071d49]">
            Explore Our Programmes
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a programme to discover its published episodes.
          </p>
        </div>

        {!programmes || programmes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <h3 className="text-xl font-bold text-[#071d49]">
              No programmes available yet
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Our programmes will appear here soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {programmeList.map((programme) => (
              <Link
                key={programme.id}
                href={`/programmes/${programme.slug}`}
                className="group rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#e31b23] hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-[#e31b23]">
                  🎙
                </div>

                <h3 className="text-xl font-extrabold text-[#071d49] transition group-hover:text-[#e31b23]">
                  {programme.name}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {programme.description ||
                    "Explore episodes from this ALASS Radio programme."}
                </p>
                {programme.programme_presenters.length > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Programme Presenters
                    </p>

                    <div className="space-y-3">
                      {programme.programme_presenters.map(
                        (assignment, index) => (
                          <div
                            key={`${assignment.role}-${assignment.display_order}-${index}`}
                            className="flex items-center gap-3"
                          >
                            {assignment.presenters?.photo_url ? (
                              <img
                                src={assignment.presenters.photo_url}
                                alt={assignment.presenters.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                                👤
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-bold text-[#071d49]">
                                {assignment.presenters?.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {assignment.role}
                                {assignment.presenters?.radio_nickname
                                  ? ` · ${assignment.presenters.radio_nickname}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
                <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[#e31b23]">
                  Explore Episodes →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
