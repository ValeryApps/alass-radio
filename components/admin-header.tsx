import Image from "next/image";
import { Radio } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { Suspense } from "react";
import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm sm:px-8">
      <div className="flex items-center gap-3">
        <Link href="/" title="Return to homepage">
          <Image
            src="/alass-radio-logo.png"
            alt="ALASS Radio"
            width={190}
            height={60}
            priority
            className="hidden h-auto w-40 object-contain sm:block"
          />

          <Image
            src="/alass-radio-icon.png"
            alt="ALASS Radio"
            width={48}
            height={48}
            priority
            className="h-11 w-11 object-contain sm:hidden"
          />
        </Link>

        <div className="hidden border-l border-slate-200 pl-3 sm:block">
          <p className="text-sm font-bold text-[#071d49]">Administration</p>
          <p className="text-xs text-slate-500">Digital Newsroom</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
          <Radio size={15} />
          Admin Panel
        </div>
        <Suspense
          fallback={<div className="text-sm text-slate-400">Loading...</div>}
        >
          <AuthButton />
        </Suspense>{" "}
        {/* <AuthButton /> */}
      </div>
    </header>
  );
}
