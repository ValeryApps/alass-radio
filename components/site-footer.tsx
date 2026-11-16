
import Link from "next/link";
import {connection} from "next/server";
export default async function SiteFooter() {
    await connection();
  return (
    <footer className="bg-[#071d49] text-white">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* BRAND */}
          <div>
            <h2 className="text-2xl font-black">
              ALASS <span className="text-[#e31b23]">RADIO</span>
            </h2>

            <p className="text-gray-300 text-sm mt-4 leading-relaxed">
              Your News. Your Voice. Your Radio.
              Bringing you reliable news and current affairs
              from Liberia, Africa and around the world.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-bold uppercase text-sm mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-300">
              <Link href="/" className="hover:text-red-400">Home</Link>
              <Link href="/categories/liberia" className="hover:text-red-400">Liberia</Link>
              <Link href="/categories/africa" className="hover:text-red-400">Africa</Link>
              <Link href="/categories/politics" className="hover:text-red-400">Politics</Link>
              <Link href="/categories/business" className="hover:text-red-400">Business</Link>
              <Link href="/categories/sports" className="hover:text-red-400">Sports</Link>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="font-bold uppercase text-sm mb-4">
              About ALASS Radio
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed">
              An international digital news platform based in Liberia,
              committed to informing audiences through accurate,
              balanced and timely reporting.
            </p>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/20 mt-10 pt-6 text-center">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} ALASS Radio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
