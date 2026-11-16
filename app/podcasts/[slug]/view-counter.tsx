"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PodcastViewCounter({
  podcastId,
}: {
  podcastId: string;
}) {
  useEffect(() => {
    const storageKey = `alass-podcast-viewed-${podcastId}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, "true");

    const supabase = createClient();

    async function recordView() {
      const { error } = await supabase.rpc("increment_podcast_views", {
        podcast_id: podcastId,
      });

      if (error) {
        sessionStorage.removeItem(storageKey);
        console.error("Could not record podcast view:", error);
      }
    }

    recordView();
  }, [podcastId]);

  return null;
}
