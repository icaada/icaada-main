"use client";

import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/site";

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact ICAADA"
        title="Bring a community, a question or a commitment to act."
        description="Use this static contact interface to indicate the kind of conversation you want to begin. No information is submitted or stored in this UI-only website."
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
          <form
            className="contact-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" data-testid="input-contact-name" />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                data-testid="input-contact-email"
              />
            </div>
            <div className="field full">
              <label htmlFor="reason">I am reaching out as</label>
              <select
                id="reason"
                defaultValue="community"
                data-testid="select-contact-reason"
              >
                <option value="community">A community representative</option>
                <option value="youth">
                  A young person or youth organisation
                </option>
                <option value="institution">
                  A government or institutional partner
                </option>
                <option value="research">A researcher or practitioner</option>
                <option value="development">
                  A development or private-sector partner
                </option>
                <option value="individual">An individual supporter</option>
              </select>
            </div>
            <div className="field full">
              <label htmlFor="message">
                Conversation or partnership interest
              </label>
              <textarea
                id="message"
                placeholder="Share the question, community priority or contribution you would like to discuss."
                data-testid="textarea-contact-message"
              />
            </div>
            <div className="content-note field full">
              <strong>UI-only form</strong>
              <p>
                This form does not submit or store information. It is ready to
                be connected to an approved contact channel in a future
                implementation.
              </p>
            </div>
            <div className="field full">
              <button
                className="button-primary"
                type="button"
                data-testid="button-contact-submit"
                aria-disabled="true"
              >
                Send <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
