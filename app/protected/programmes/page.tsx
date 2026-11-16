"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Power, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Programme = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export default function ProgrammesPage() {
  const router = useRouter();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadProgrammes() {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("radio_programmes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setProgrammes((data as Programme[]) || []);
      setMessage("");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProgrammes();
  }, []);

  async function changeStatus(programme: Programme) {
    setBusyId(programme.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("radio_programmes")
      .update({ is_active: !programme.is_active })
      .eq("id", programme.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        programme.is_active
          ? "Programme deactivated successfully."
          : "Programme activated successfully.",
      );
      await loadProgrammes();
    }

    setBusyId(null);
  }

  async function deleteProgramme(programme: Programme) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${programme.name}"? Existing podcast episodes will remain, but will no longer be linked to this programme.`,
    );

    if (!confirmed) return;

    setBusyId(programme.id);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("radio_programmes")
      .delete()
      .eq("id", programme.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Programme deleted successfully.");
      await loadProgrammes();
    }

    setBusyId(null);
  }

  const filteredProgrammes = programmes.filter((programme) =>
    programme.name.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = programmes.filter(
    (programme) => programme.is_active,
  ).length;

  const inactiveCount = programmes.filter(
    (programme) => !programme.is_active,
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Radio Programmes</h1>
          <p className="mt-2 text-gray-500">
            Create and manage ALASS Radio programmes.
          </p>
        </div>

        <button
          onClick={() => router.push("/protected/programmes/new")}
          className="rounded-lg bg-blue-700 px-5 py-3 text-white hover:bg-blue-800"
        >
          + Add New Programme
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Total Programmes</p>
          <h2 className="mt-2 text-3xl font-bold">{programmes.length}</h2>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Active Programmes</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {activeCount}
          </h2>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">Inactive Programmes</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-500">
            {inactiveCount}
          </h2>
        </div>
      </div>

      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search programmes by name..."
          className="w-full rounded-lg border p-3"
        />
      </div>

      {message && (
        <div className="rounded-lg bg-gray-100 p-3 text-gray-800">
          {message}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        {loading ? (
          <p className="p-6">Loading programmes...</p>
        ) : filteredProgrammes.length === 0 ? (
          <p className="p-6 text-gray-500">No programmes found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Programme Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProgrammes.map((programme) => (
                <tr key={programme.id} className="border-t">
                  <td className="min-w-48 p-4 font-medium">{programme.name}</td>

                  <td className="p-4 text-gray-500">{programme.slug}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        programme.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {programme.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap p-4">
                    {new Date(programme.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={busyId === programme.id}
                        onClick={() => changeStatus(programme)}
                        title={
                          programme.is_active
                            ? "Deactivate programme"
                            : "Activate programme"
                        }
                        aria-label={
                          programme.is_active
                            ? "Deactivate programme"
                            : "Activate programme"
                        }
                        className="rounded-lg border px-3 py-2 text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
                      >
                        {busyId === programme.id ? (
                          <Clock3 size={17} className="animate-spin" />
                        ) : (
                          <Power size={17} />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/protected/programmes/${programme.id}/edit`,
                          )
                        }
                        title="Edit programme"
                        aria-label="Edit programme"
                        className="rounded-lg border px-3 py-2 text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        disabled={busyId === programme.id}
                        onClick={() => deleteProgramme(programme)}
                        title="Delete programme"
                        aria-label="Delete programme"
                        className="rounded-lg border border-red-300 px-3 py-2 text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
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
