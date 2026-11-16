"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewProgrammePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter a programme name.");
      return;
    }

    const slug = createSlug(name);

    if (!slug) {
      setMessage("Please enter a valid programme name.");
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.from("radio_programmes").insert({
      name: name.trim(),
      slug,
      description: description.trim() || null,
      is_active: true,
    });

    if (error) {
      setMessage(
        error.code === "23505"
          ? "A programme with this name or slug already exists."
          : error.message,
      );
      setLoading(false);
      return;
    }

    router.push("/protected/programmes");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <Link
          href="/protected/programmes"
          className="text-sm font-semibold text-blue-700 hover:underline"
        >
          ← Back to Programmes
        </Link>

        <h1 className="mt-5 text-3xl font-bold">Add New Programme</h1>

        <p className="mt-2 text-gray-500">
          Add a new radio programme to ALASS Radio.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Programme Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning Conversations"
            required
            className="w-full rounded-lg border p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe this radio programme..."
            rows={5}
            className="w-full rounded-lg border p-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          This programme will be created as an active programme.
        </div>

        {message && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Saving Programme..." : "Save Programme"}
          </button>

          <Link
            href="/protected/programmes"
            className="rounded-lg border px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
