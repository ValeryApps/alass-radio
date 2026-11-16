"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ReactionType = "like" | "love" | "wow" | "sad" | "angry";

type ReactionItem = {
  reaction: ReactionType;
  user_id: string;
};

const reactions: {
  type: ReactionType;
  emoji: string;
  label: string;
}[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];

const emptyCounts: Record<ReactionType, number> = {
  like: 0,
  love: 0,
  wow: 0,
  sad: 0,
  angry: 0,
};

export default function ArticleReactions({ articleId }: { articleId: string }) {
  const supabase = useMemo(() => createClient(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [counts, setCounts] = useState(emptyCounts);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReactions() {
      const { data: authData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("article_reactions")
        .select("reaction, user_id")
        .eq("article_id", articleId);

      if (!active) return;

      if (error) {
        setMessage("Unable to load reactions.");
        setLoading(false);
        return;
      }

      const rows = (data || []) as ReactionItem[];
      const newCounts = { ...emptyCounts };

      rows.forEach((item) => {
        newCounts[item.reaction]++;
      });

      setCounts(newCounts);
      setUserId(authData.user?.id || null);

      const currentReaction = rows.find(
        (item) => item.user_id === authData.user?.id,
      );

      setUserReaction(currentReaction?.reaction || null);
      setLoading(false);
    }

    loadReactions();

    return () => {
      active = false;
    };
  }, [articleId, supabase]);

  async function handleReaction(reaction: ReactionType) {
    if (!userId) {
      setMessage("Please sign in to react to this story.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("article_reactions").upsert(
      {
        article_id: articleId,
        user_id: userId,
        reaction,
      },
      { onConflict: "article_id,user_id" },
    );

    if (error) {
      setMessage("Unable to save your reaction. Please try again.");
      setSaving(false);
      return;
    }

    setUserReaction(reaction);

    const { data } = await supabase
      .from("article_reactions")
      .select("reaction, user_id")
      .eq("article_id", articleId);

    const rows = (data || []) as ReactionItem[];
    const newCounts = { ...emptyCounts };

    rows.forEach((item) => {
      newCounts[item.reaction]++;
    });

    setCounts(newCounts);
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading reactions...</p>;
  }

  return (
    <section className="border-y border-gray-200 py-6 my-10">
      <h2 className="text-xl font-bold mb-4">
        What do you think about this story?
      </h2>

      <div className="flex flex-wrap gap-3">
        {reactions.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => handleReaction(item.type)}
            disabled={saving}
            aria-pressed={userReaction === item.type}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 transition ${
              userReaction === item.type
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-gray-300 bg-white hover:bg-gray-100"
            } disabled:opacity-50`}
          >
            <span>{item.emoji}</span>
            <span className="text-sm font-medium">{item.label}</span>
            <span className="text-sm">{counts[item.type]}</span>
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-red-600 mt-4">{message}</p>}

      {userId && userReaction && (
        <p className="text-sm text-gray-500 mt-3">You reacted to this story.</p>
      )}
    </section>
  );
}
