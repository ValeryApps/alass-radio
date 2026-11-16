import AdminHeader from "@/components/admin-header";
import AdminSidebar from "@/components/admin-sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const instant = false;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect users who are not logged in.
  if (!user) {
    redirect("/auth/login");
  }

  // Check the user's role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only administrators can access this area.
  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
