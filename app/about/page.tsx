import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const instant = false;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      {/* PAGE INTRODUCTION */}
      <section className="bg-[#071d49] text-white py-20">
        <div className="max-w-7xl mx-auto px-5">
          <p className="text-red-400 uppercase font-bold text-sm tracking-widest">
            WHO WE ARE
          </p>

          <h1 className="text-4xl md:text-6xl font-black mt-4">
            About ALASS Radio
          </h1>

          <p className="text-gray-200 text-lg max-w-3xl mt-6 leading-relaxed">
            Your News. Your Voice. Your Radio. Bringing you reliable,
            timely and engaging news from Liberia, Africa and around
            the world.
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="max-w-4xl">
          <p className="text-red-600 uppercase font-bold text-sm tracking-widest">
            OUR STORY
          </p>

          <h2 className="text-3xl font-black text-[#071d49] mt-3">
            A Voice for News and Information
          </h2>

          <p className="text-gray-600 mt-6 leading-8">
            ALASS Radio is a digital news platform based in Liberia,
            committed to bringing audiences closer to the stories
            that matter. We cover developments in Liberia, across
            Africa and throughout the international community.
          </p>

          <p className="text-gray-600 mt-4 leading-8">
            Through news reports, interviews, analysis and public
            discussions, we aim to inform our audience, encourage
            meaningful conversations and give important stories
            the attention they deserve.
          </p>
        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="bg-[#f3f6fb] py-16">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-8">

          <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-red-600">
            <h2 className="text-2xl font-black text-[#071d49]">
              Our Mission
            </h2>

            <p className="text-gray-600 mt-5 leading-8">
              To provide accurate, timely and responsible news and
              information while promoting public awareness,
              accountability and informed citizenship.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-[#071d49]">
            <h2 className="text-2xl font-black text-[#071d49]">
              Our Vision
            </h2>

            <p className="text-gray-600 mt-5 leading-8">
              To become a trusted and influential digital media
              platform connecting Liberia, Africa and the world
              through credible journalism and meaningful storytelling.
            </p>
          </div>

        </div>
      </section>

      {/* OUR COVERAGE */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-red-600 uppercase font-bold text-sm tracking-widest">
            WHAT WE COVER
          </p>

          <h2 className="text-3xl font-black text-[#071d49] mt-3">
            News Without Borders
          </h2>

          <p className="text-gray-600 mt-4 leading-relaxed">
            From local developments to major international events,
            we bring important stories to our audience.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

          {[
            ["Liberia News", "Politics, government, communities and national developments."],
            ["Africa News", "Regional affairs, ECOWAS, African leadership and development."],
            ["International News", "Global events and developments shaping our world."],
            ["Business & Economy", "Markets, investment, trade and economic developments."],
            ["Sports", "Local, African and international sporting events."],
            ["Education & Society", "Education, health, culture and issues affecting communities."]
          ].map(([title, description]) => (
            <div
              key={title}
              className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-[#071d49]">
                {title}
              </h3>

              <p className="text-gray-600 mt-3 leading-relaxed">
                {description}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-[#071d49] text-white py-16">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-black">
            Stay Informed. Stay Connected.
          </h2>

          <p className="text-gray-200 mt-5 leading-relaxed">
            Follow ALASS Radio for the latest news, reports and
            developments from Liberia, Africa and around the world.
          </p>

          <Link
            href="/"
            className="inline-block mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            Explore Latest News
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}