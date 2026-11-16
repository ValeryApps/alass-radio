"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ArticleViewCounter({
  articleId,
}: {
  articleId: string;
}) {
  useEffect(() => {
    const storageKey = `alass-article-viewed-${articleId}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, "true");

    const supabase = createClient();

    async function recordView() {
      const { error } = await supabase.rpc("increment_article_views", {
        article_id: articleId,
      });

      if (error) {
        sessionStorage.removeItem(storageKey);
        console.error("Could not record article view:", error);
      }
    }

    recordView();
  }, [articleId]);

  return null;
}
