"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeletePresenterButtonProps = {
  presenterId: string;
  presenterName: string;
  photoUrl: string | null;
};

export default function DeletePresenterButton({
  presenterId,
  presenterName,
  photoUrl,
}: DeletePresenterButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${presenterName}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    // Find any programme assignments for this presenter.
    const { error: assignmentError } = await supabase
      .from("programme_presenters")
      .delete()
      .eq("presenter_id", presenterId);

    if (assignmentError) {
      setMessage(
        "Could not remove programme assignments: " + assignmentError.message,
      );
      setLoading(false);
      return;
    }

    // Delete the presenter record.
    const { error: deleteError } = await supabase
      .from("presenters")
      .delete()
      .eq("id", presenterId);

    if (deleteError) {
      setMessage("Could not delete presenter: " + deleteError.message);
      setLoading(false);
      return;
    }

    // Remove the photograph from Supabase Storage, if one exists.
    if (photoUrl) {
      try {
        const photoPath = decodeURIComponent(
          new URL(photoUrl).pathname.split("/news-images/")[1]?.split("?")[0] ||
            "",
        );

        if (photoPath) {
          const { error: photoError } = await supabase.storage
            .from("news-images")
            .remove([photoPath]);

          if (photoError) {
            console.error(
              "Presenter deleted, but photo removal failed:",
              photoError,
            );
          }
        }
      } catch (error) {
        console.error(
          "Presenter deleted, but photo path could not be processed:",
          error,
        );
      }
    }

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {message && (
        <p className="mt-2 max-w-xs text-xs text-red-600">{message}</p>
      )}
    </div>
  );
}
