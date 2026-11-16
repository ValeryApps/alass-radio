import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  let displayName = user?.email || "User";
  let userRole = "reader";

  if (user?.sub) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.sub)
      .maybeSingle();

    displayName = profile?.full_name?.trim().split(/\s+/)[0] || displayName;
    userRole = profile?.role || "reader";
  }

  return user ? (
    <div className="flex flex-col items-start gap-3 w-full lg:flex-row lg:items-center lg:w-auto">
      <span className="break-words whitespace-normal max-w-full md:max-w-[150px]">
        Welcome, {displayName}!
      </span>

      {userRole === "admin" && (
        <Button asChild size="sm" variant="outline">
          <Link href="/protected" className="text-black">
            Dashboard
          </Link>
        </Button>
      )}

      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
