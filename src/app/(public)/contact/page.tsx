import type { Metadata } from "next";
import { PageHero } from "@/components/site";
import { ContactForm } from "@/components/public/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a conversation with ICAADA about community action, partnership, research or volunteering.",
};

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact ICAADA"
        title="Bring a community, a question or a commitment to act."
        description="Tell us what kind of conversation you want to begin. Your message goes straight to the ICAADA team."
      />
      <section className="section-pad">
        <div className="container-wide contact-grid">
          <div>
            <div className="contact-details">
              <div className="contact-detail">
                <strong>Geographic focus</strong>
                <span>Northern Nigeria</span>
              </div>
              <div className="contact-detail">
                <strong>Partnership approach</strong>
                <span>
                  Shared objectives, clear responsibilities, measurable results,
                  transparency and mutual accountability.
                </span>
              </div>
              <div className="contact-detail">
                <strong>Contact details</strong>
                <span>
                  Official contact channels will be published by ICAADA. No
                  address, email or telephone number has been invented for this
                  interface.
                </span>
              </div>
            </div>
            <div className="contact-message">
              <span>Community ownership</span>
              <strong>Prevention starts with the community.</strong>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
