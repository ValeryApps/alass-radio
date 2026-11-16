"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Comment = {

  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
};


type Commenter = {
  id: string;
  full_name: string | null;
};

export default function ArticleComments({ articleId }: { articleId: string }) {
  const supabase = useMemo(() => createClient(), []);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commenters, setCommenters] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadComments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("article_comments")
      .select("id, user_id, content, created_at, parent_id")
      .eq("article_id", articleId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Unable to load comments.");
      setLoading(false);
      return;
    }

    const loadedComments = (data || []) as Comment[];
    setComments(loadedComments);

    const userIds = [
      ...new Set(loadedComments.map((comment) => comment.user_id)),
    ];

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const names: Record<string, string> = {};

      ((profiles || []) as Commenter[]).forEach((profile) => {
        names[profile.id] = profile.full_name || "Reader";
      });

      setCommenters(names);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function initialize() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      setUserId(user?.id || null);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        setIsAdmin(profile?.role === "admin");
      }

      await loadComments();
    }

    initialize();
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!userId || !content.trim()) return;

    setSubmitting(true);
    setError("");

    const { error } = await supabase.from("article_comments").insert({
      article_id: articleId,
      user_id: userId,
      content: content.trim(),
    });

    if (error) {
      setError("Your comment could not be submitted. Please try again.");
    } else {
      setContent("");
      await loadComments();
    }

    setSubmitting(false);
    
  }

  async function handleReplySubmit(
    e: React.FormEvent<HTMLFormElement>,
    parentId: string,
  ) {
    e.preventDefault();

    if (!userId || !replyContent.trim()) return;

    setReplySubmitting(true);
    setError("");

    const { error } = await supabase.from("article_comments").insert({
      article_id: articleId,
      user_id: userId,
      parent_id: parentId,
      content: replyContent.trim(),
    });

    if (error) {
      setError("Your reply could not be submitted. Please try again.");
    } else {
      setReplyContent("");
      setReplyTo(null);
      await loadComments();
    }

    setReplySubmitting(false);
  }

    function startEditing(comment: Comment) {
      setEditingId(comment.id);
      setEditContent(comment.content);
      setError("");
    }

    async function handleEditSubmit(
      e: React.FormEvent<HTMLFormElement>,
      commentId: string,
    ) {
      e.preventDefault();

      if (!editContent.trim()) return;

      setEditSubmitting(true);
      setError("");

      const { error } = await supabase
        .from("article_comments")
        .update({ content: editContent.trim() })
        .eq("id", commentId);

      if (error) {
        setError("Unable to update this comment. Please try again.");
      } else {
        setEditingId(null);
        setEditContent("");
        await loadComments();
      }

      setEditSubmitting(false);
    }

    async function handleDelete(commentId: string) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this comment? This action cannot be undone.",
      );

      if (!confirmed) return;

      setError("");

      const { error } = await supabase
        .from("article_comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        setError("Unable to delete this comment. Please try again.");
      } else {
        await loadComments();
      }
    }
  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        Comments ({comments.length})
      </h2>

      {userId ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your comment..."
            rows={4}
            maxLength={5000}
            required
            className="w-full rounded-lg border border-gray-300 p-4 text-sm focus:border-blue-600 focus:outline-none"
          />

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="mt-3 rounded-lg bg-[#071d49] px-6 py-3 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="mb-8 rounded-lg bg-gray-50 p-4 text-gray-600">
          Please{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-blue-700 underline"
          >
            sign in
          </Link>{" "}
          to leave a comment.
        </p>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-6">
          {comments
            .filter((comment) => !comment.parent_id)
            .map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-gray-200 p-5"
              >
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="font-semibold text-gray-900">
                    {commenters[comment.user_id] || "Reader"}
                  </p>

                  <time className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </time>
                </div>

                {editingId === comment.id ? (
                  <form
                    onSubmit={(e) => handleEditSubmit(e, comment.id)}
                    className="mt-3"
                  >
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      maxLength={5000}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                    />

                    <div className="mt-2 flex gap-3">
                      <button
                        type="submit"
                        disabled={editSubmitting || !editContent.trim()}
                        className="rounded-lg bg-[#071d49] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {editSubmitting ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="whitespace-pre-wrap text-gray-700">
                    {comment.content}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4">
                  {userId === comment.user_id && (
                    <button
                      type="button"
                      onClick={() => startEditing(comment)}
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      Edit
                    </button>
                  )}

                  {(isAdmin || userId === comment.user_id) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}

                  {userId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(replyTo === comment.id ? null : comment.id);
                        setReplyContent("");
                      }}
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      {replyTo === comment.id ? "Cancel" : "Reply"}
                    </button>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      Sign in to reply
                    </Link>
                  )}
                </div>
                {replyTo === comment.id && userId && (
                  <form
                    onSubmit={(e) => handleReplySubmit(e, comment.id)}
                    className="mt-4"
                  >
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      rows={3}
                      maxLength={5000}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={replySubmitting || !replyContent.trim()}
                      className="mt-2 rounded-lg bg-[#071d49] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-50"
                    >
                      {replySubmitting ? "Sending..." : "Post Reply"}
                    </button>
                  </form>
                )}

                {comments.filter((reply) => reply.parent_id === comment.id)
                  .length > 0 && (
                  <div className="mt-5 ml-4 space-y-4 border-l-2 border-gray-200 pl-4">
                    {comments
                      .filter((reply) => reply.parent_id === comment.id)
                      .map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-lg bg-gray-50 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <p className="font-semibold text-gray-900">
                              {commenters[reply.user_id] || "Reader"}
                            </p>

                            <time className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleString()}
                            </time>
                          </div>

                          {editingId === reply.id ? (
                            <form
                              onSubmit={(e) => handleEditSubmit(e, reply.id)}
                              className="mt-3"
                            >
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                maxLength={5000}
                                required
                                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                              />

                              <div className="mt-2 flex gap-3">
                                <button
                                  type="submit"
                                  disabled={
                                    editSubmitting || !editContent.trim()
                                  }
                                  className="rounded-lg bg-[#071d49] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                  {editSubmitting
                                    ? "Saving..."
                                    : "Save Changes"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="text-sm text-gray-600 hover:underline"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className="whitespace-pre-wrap text-gray-700">
                              {reply.content}
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-4">
                            {userId === reply.user_id && (
                              <button
                                type="button"
                                onClick={() => startEditing(reply)}
                                className="text-sm font-semibold text-blue-700 hover:underline"
                              >
                                Edit
                              </button>
                            )}

                            {(isAdmin || userId === reply.user_id) && (
                              <button
                                type="button"
                                onClick={() => handleDelete(reply.id)}
                                className="text-sm font-semibold text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
