
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ContactForm from "@/components/contact-form";

export const instant = false;

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      {/* PAGE INTRODUCTION */}
      <section className="bg-[#071d49] text-white py-20">
        <div className="max-w-7xl mx-auto px-5">
          <p className="text-red-400 uppercase font-bold text-sm tracking-widest">
            GET IN TOUCH
          </p>

          <h1 className="text-4xl md:text-6xl font-black mt-4">
            Contact ALASS Radio
          </h1>

          <p className="text-gray-200 text-lg max-w-3xl mt-6 leading-relaxed">
            Have a news tip, question, suggestion or business enquiry?
            We would love to hear from you.
          </p>
        </div>
      </section>

      {/* CONTACT INFORMATION */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid md:grid-cols-3 gap-8">

          <div className="p-7 border border-gray-200 rounded-xl">
            <div className="text-red-600 text-3xl mb-4">✉</div>
            <h2 className="text-xl font-bold text-[#071d49]">
              Email Us
            </h2>
            <p className="text-gray-600 mt-3">
              Send us your questions, feedback and enquiries.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Official email address to be added.
            </p>
          </div>

          <div className="p-7 border border-gray-200 rounded-xl">
            <div className="text-red-600 text-3xl mb-4">☎</div>
            <h2 className="text-xl font-bold text-[#071d49]">
              Call Us
            </h2>
            <p className="text-gray-600 mt-3">
              Contact our newsroom for important enquiries.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Official telephone number to be added.
            </p>
          </div>

          <div className="p-7 border border-gray-200 rounded-xl">
            <div className="text-red-600 text-3xl mb-4">📍</div>
            <h2 className="text-xl font-bold text-[#071d49]">
              Our Location
            </h2>
            <p className="text-gray-600 mt-3">
              ALASS Radio Newsroom
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Monrovia, Liberia
            </p>
          </div>

        </div>
      </section>

      {/* CONTACT FORM PLACEHOLDER */}
      <section className="bg-[#f3f6fb] py-16">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="text-red-600 uppercase font-bold text-sm tracking-widest">
            WE WANT TO HEAR FROM YOU
          </p>

          <h2 className="text-3xl font-black text-[#071d49] mt-3">
            Send Us a Message
          </h2>

          <p className="text-gray-600 mt-5 leading-relaxed">
            Whether you want to share a news tip, report a story,
            make a suggestion or contact our team, this is the place
            to reach us.
          </p>

         <div className="mt-10">
  <ContactForm />
</div>
        </div>
      </section>

      {/* BACK TO HOME */}
      <section className="py-12 text-center">
        <Link
          href="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
        >
          Return to Homepage
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}