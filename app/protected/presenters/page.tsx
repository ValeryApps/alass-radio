import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeletePresenterButton from "./delete-presenter-button";

export const instant = false;

type Presenter = {
  id: string;
  name: string;
  radio_nickname: string | null;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
};

export default async function PresentersPage() {
  const supabase = await createClient();

  const { data: presenters, error } = await supabase
    .from("presenters")
    .select("id, name, radio_nickname, slug, bio, photo_url, is_active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching presenters:", error);
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#071d49]">Presenters</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage ALASS Radio presenters and their profiles.
          </p>
        </div>

        <Link
          href="/protected/presenters/new"
          className="rounded-lg bg-[#071d49] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e31b23]"
        >
          + Add New Presenter
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Total Presenters</p>
        <p className="mt-2 text-3xl font-extrabold text-[#071d49]">
          {presenters?.length ?? 0}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Could not load presenters. Please try again.
        </div>
      ) : !presenters || presenters.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-[#071d49]">
            No presenters added yet
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Start by adding your first ALASS Radio presenter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {presenters.map((presenter: Presenter) => (
              <div
                key={presenter.id}
                className="flex flex-wrap items-center gap-4 p-5"
              >
                {presenter.photo_url ? (
                  <img
                    src={presenter.photo_url}
                    alt={presenter.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
                    👤
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#071d49]">{presenter.name}</h3>
                  {presenter.radio_nickname && (
                    <p className="mt-1 text-sm text-slate-500">
                      on air: ({presenter.radio_nickname})
                    </p>
                  )}
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                    {presenter.bio || "No biography added yet."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      presenter.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {presenter.is_active ? "Active" : "Inactive"}
                  </span>

                  <Link
                    href={`/protected/presenters/${presenter.id}/edit`}
                    className="rounded-lg border border-[#071d49] px-4 py-2 text-sm font-semibold text-[#071d49] transition hover:bg-[#071d49] hover:text-white"
                  >
                    Edit
                  </Link>
                  <DeletePresenterButton
                    presenterId={presenter.id}
                    presenterName={presenter.name}
                    photoUrl={presenter.photo_url}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
