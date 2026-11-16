export const instant = false;
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Newspaper,
  Images,
  Mic2,
  Users,
  Settings,
  Plus,
  FileText,
  Clock3,
  ArrowUpRight,
  Mail,
  Radio,
} from "lucide-react";

const publishingTools = [
  {
    title: "News Articles",
    description: "Write, edit and publish news stories.",
    icon: Newspaper,
    status: "Coming soon",
  },
  {
    title: "Photo News",
    description: "Upload photographs and create photo reports.",
    icon: Images,
    status: "Coming soon",
  },
  {
    title: "Podcasts",
    description: "Upload audio news, interviews and episodes.",
    icon: Mic2,
    status: "Coming soon",
  },
  {
    title: "Journalists",
    description: "Manage writers, editors and contributors.",
    icon: Users,
    status: "Coming soon",
  },
];

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }
  const { count: unreadMessages, error: messagesError } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);

  if (messagesError) {
    console.error("Error counting unread messages:", messagesError);
  }
  // Count published articles
  const { count: publishedArticles, error: publishedError } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  // Count draft articles
  const { count: draftArticles, error: draftError } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("status", "draft");

  if (publishedError) {
    console.error("Error counting published articles:", publishedError);
  }

  if (draftError) {
    console.error("Error counting draft articles:", draftError);
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 text-slate-900">
      {/* Dashboard header */}
      <header className="flex flex-col gap-4 border-b bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
            title="Return to homepage"
          >
            <Radio className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight">
              ALASS <span className="text-emerald-600">RADIO</span>
            </h1>
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            Digital News & Media Administration
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Administration
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome section */}
        <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              ADMINISTRATION PANEL
            </p>
            <h2 className="mt-2 text-3xl font-bold">Welcome to ALASS Radio</h2>
            <p className="mt-2 text-slate-500">
              Manage your news publications, photographs and podcasts from one
              place.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm text-slate-600">
            <Clock3 className="h-4 w-4" />
            Publishing workspace
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Published Articles",
              value: publishedArticles ?? 0,
              icon: Newspaper,
              description: "Live database count",
            },
            {
              label: "Draft Articles",
              value: draftArticles ?? 0,
              icon: FileText,
              description: "Live database count",
            },
            {
              label: "Photo Stories",
              value: 0,
              icon: Images,
              description: "Feature coming soon",
            },
            {
              label: "Podcast Episodes",
              value: 0,
              icon: Mic2,
              description: "Feature coming soon",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg cursor-default"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="mt-4 text-3xl font-bold">{item.value}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </section>
        {/* Contact messages */}
        <section className="mb-10">
          <Link
            href="/protected/messages"
            className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <Mail className="h-6 w-6 text-emerald-600" />
                </div>

                <div>
                  <h3 className="text-lg font-bold">Contact Messages</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    View and manage messages from website visitors.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600">
                  {unreadMessages ?? 0}
                </p>
                <p className="text-xs text-slate-500">Unread messages</p>
              </div>
            </div>
          </Link>
        </section>
        {/* Publishing tools */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Publishing tools</h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage the different types of content on ALASS Radio.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {publishingTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <div
                  key={tool.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg cursor-default"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                      {tool.status}
                    </span>
                  </div>

                  <h4 className="mt-5 text-lg font-semibold">{tool.title}</h4>

                  <p className="mt-2 text-sm text-slate-500">
                    {tool.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    Under development
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick information */}
        <section className="mt-10 rounded-xl bg-slate-900 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold">Your newsroom starts here.</h3>
              <p className="mt-2 text-sm text-slate-300">
                We are building your digital publishing system, one feature at a
                time.
              </p>
            </div>

            <div className="flex items-center gap-2 text-emerald-400">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-sm font-medium">ALASS Media Workspace</span>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} ALASS Radio. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
