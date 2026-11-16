import { LoginForm } from "@/components/login-form";

export const instant = false;
type PageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { next } = await searchParams;

  const redirectTo =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/protected";

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-2xl xl:max-w-sm">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
