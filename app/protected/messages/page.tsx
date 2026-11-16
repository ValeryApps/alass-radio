"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Trash2, Mail, MessageSquare } from "lucide-react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};
export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  async function loadMessages() {
    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading messages:", error);
    } else {
      setMessages(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function deleteMessage(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Could not delete message.");
      console.error(error);
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== id),
    );
  }
  async function markAsRead(id: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      alert("Could not update message status.");
      console.error(error);
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === id ? { ...message, is_read: true } : message,
      ),
    );
  }
  return (
    <div className="p-6">
      <p className="mt-2 text-sm font-medium text-gray-500">
        {messages.length} message{messages.length !== 1 ? "s" : ""} received
      </p>
      <p className="mt-1 text-sm font-semibold text-blue-700">
        {messages.filter((message) => !message.is_read).length} unread
        message(s)
      </p>
      <p className="mt-2 text-gray-600">
        Messages submitted through the ALASS Radio website.
      </p>
      <div className="mt-6">
        <input
          type="text"
          placeholder="Search by name or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowUnreadOnly(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              !showUnreadOnly
                ? "bg-[#071d49] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Messages
          </button>

          <button
            onClick={() => setShowUnreadOnly(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              showUnreadOnly
                ? "bg-[#071d49] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Unread Only
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
              No contact messages found.
            </p>
          ) : (
            messages
              .filter(
                (item) =>
                  (!showUnreadOnly || !item.is_read) &&
                  `${item.name} ${item.subject}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
              )
              .map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-[#071d49]">
                          {item.subject}
                        </h2>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            item.is_read
                              ? "bg-gray-100 text-gray-600"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.is_read ? "Read" : "Unread"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {item.name} · {item.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </p>

                      {!item.is_read && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          Mark as Read
                        </button>
                      )}

                      <button
                        onClick={() => deleteMessage(item.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Delete message"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-gray-700">
                    {item.message}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
