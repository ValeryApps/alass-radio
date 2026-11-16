import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/site-header";

type Presenter = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  radio_nickname: string | null;
};

export const instant = false;

export default async function PresentersPage() {
  const supabase = await createClient();

  const { data: presenters, error } = await supabase
    .from("presenters")
    .select("id, name, slug, bio, photo_url, radio_nickname")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching presenters:", error);
  }

  const presenterList = (presenters ?? []) as Presenter[];

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-[#071d49] px-5 py-16 text-center text-white sm:py-20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-red-500">
          ALASS Radio
        </p>

        <h1 className="text-4xl font-extrabold sm:text-5xl">
          Meet Our Presenters
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
          Get to know the voices behind ALASS Radio. Discover our presenters,
          their stories, and the programmes they bring to life.
        </p>

        <div className="mx-auto mt-7 h-1 w-20 rounded-full bg-[#e31b23]" />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-9 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-extrabold text-[#071d49]">
            Our Radio Personalities
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Explore the profiles of our presenters.
          </p>
        </div>

        {presenterList.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <h3 className="text-xl font-bold text-[#071d49]">
              No presenters available yet
            </h3>

            <p className="mt-3 text-sm text-slate-500">
              Our presenters will appear here soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {presenterList.map((presenter) => (
              <article
                key={presenter.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col items-center px-6 pt-8 text-center">
                  {presenter.photo_url ? (
                    <img
                      src={presenter.photo_url}
                      alt={presenter.name}
                      className="h-32 w-32 rounded-full border-4 border-slate-100 object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 text-5xl">
                      👤
                    </div>
                  )}

                  <h3 className="mt-5 text-xl font-extrabold text-[#071d49]">
                    {presenter.name}
                  </h3>

                  {presenter.radio_nickname && (
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {presenter.radio_nickname}
                    </p>
                  )}
                </div>

                <div className="px-6 pb-7 pt-5">
                  <p className="line-clamp-3 min-h-[4.5rem] text-center text-sm leading-6 text-slate-600">
                    {presenter.bio || "ALASS Radio presenter."}
                  </p>

                  <Link
                    href={`/presenters/${presenter.slug}`}
                    className="mt-6 block rounded-lg bg-[#e31b23] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    View Profile →
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
