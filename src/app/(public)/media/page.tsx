"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { useRef, useState } from "react";
import { mediaItems, stakeholderVoices } from "@/data/content";
import { Eyebrow, PageHero } from "@/components/site";
import { VoiceDetailModal, VoiceMediaCard } from "@/components/credibility";

export default function Media() {
  const [filter, setFilter] = useState("All");
  const [selectedVoice, setSelectedVoice] = useState<
    (typeof stakeholderVoices)[number] | null
  >(null);
  const voiceOpener = useRef<HTMLButtonElement | null>(null);
  const types = [
    "All",
    "Photos",
    "Videos",
    "Voices of Support",
    "Events",
    "Press",
    "Publications",
  ];
  const filtered =
    filter === "All"
      ? mediaItems
      : mediaItems.filter((item) => item.category === filter);
  const voiceItems =
    filter === "All" || filter === "Voices of Support" ? stakeholderVoices : [];

  const closeVoice = () => {
    setSelectedVoice(null);
    window.setTimeout(() => voiceOpener.current?.focus(), 0);
  };
  return (
    <>
      <PageHero
        eyebrow="Media"
        title="People. Community. Action. Hope."
        description="A media experience designed to communicate community mobilisation, youth engagement, learning, advocacy, research and locally led action without making drug-use imagery the visual identity of ICAADA."
      />
      <section className="section-pad">
        <div className="container-wide">
          <div className="content-note">
            <strong>Static media concepts</strong>
            <p>
              These items demonstrate the intended media categories and visual
              direction. Stakeholder identities, statements and clips are
              placeholders until verified source material is supplied.
            </p>
          </div>
          <div className="filter-row">
            {types.map((type) => (
              <button
                key={type}
                className={`filter-button ${filter === type ? "active" : ""}`}
                onClick={() => setFilter(type)}
                data-testid={`button-media-filter-${type.toLowerCase().replaceAll(" ", "-")}`}
              >
                {type}
              </button>
            ))}
          </div>
          {voiceItems.length > 0 && (
            <div className="media-voices">
              <div className="section-heading">
                <div>
                  <Eyebrow>Voices of Support</Eyebrow>
                  <h2 className="display">Partners & community voices.</h2>
                </div>
                <p>
                  Placeholder portraits and statements are presented as
                  editorial credibility assets, not as verified endorsements.
                </p>
              </div>
              <div className="voice-media-grid">
                {voiceItems.map((voice) => (
                  <VoiceMediaCard
                    key={voice.id}
                    voice={voice}
                    onOpen={(trigger) => {
                      voiceOpener.current = trigger;
                      setSelectedVoice(voice);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="listing-grid">
            {filtered
              .filter((item) => !item.voiceId)
              .map((item, index) => (
                <article
                  className="listing-item"
                  key={item.title}
                  data-testid={`card-media-${index}`}
                >
                  <div className="media-image">
                    <img src={item.image} alt="" loading="lazy" />
                    {item.video && (
                      <span className="media-play">
                        <Play size={15} fill="currentColor" />
                      </span>
                    )}
                  </div>
                  <div className="card-meta">
                    <span>{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <button
                    type="button"
                    className="link-arrow media-placeholder-action"
                    data-testid={`button-media-open-${index}`}
                  >
                    Media item coming soon <ArrowUpRight size={15} />
                  </button>
                </article>
              ))}
          </div>
        </div>
      </section>
      {selectedVoice && (
        <VoiceDetailModal voice={selectedVoice} onClose={closeVoice} />
      )}
    </>
  );
}
