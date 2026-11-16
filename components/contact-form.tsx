"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactForm() {
      const supabase = createClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        const form = event.currentTarget;
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject,
        message,
      });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage("Sorry, your message could not be sent. Please try again.");
      console.error("Contact form error:", error);
      return;
    }

    setSuccessMessage("Thank you! Your message has been sent successfully.");
   form.reset();
  }
  return (
    <form
  onSubmit={handleSubmit}
  className="bg-white p-8 rounded-xl shadow-sm space-y-6 text-left"
>

      {/* NAME */}
      <div>
        <label htmlFor="name" className="block font-semibold text-gray-700 mb-2">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Enter your full name"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* EMAIL */}
      <div>
        <label htmlFor="email" className="block font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Enter your email address"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* SUBJECT */}
      <div>
        <label htmlFor="subject" className="block font-semibold text-gray-700 mb-2">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          placeholder="What is your message about?"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* MESSAGE */}
      <div>
        <label htmlFor="message" className="block font-semibold text-gray-700 mb-2">
          Your Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Write your message here..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* SUBMIT BUTTON */}
     <button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
>
  {isSubmitting ? "Sending..." : "Send Message"}
</button>
      {successMessage && (
        <p className="text-green-700 bg-green-50 p-4 rounded-lg">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="text-red-700 bg-red-50 p-4 rounded-lg">
          {errorMessage}
        </p>
      )}
    </form>
  );
}