"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";
import { Eyebrow } from "@/components/site";
import { VoiceDetailModal, VoiceMediaCard } from "@/components/credibility";
import type { MediaItemDto } from "@/Services/media.service";
import type { VoiceDto } from "@/Services/voice.service";

const VOICES = "Voices of Support";
const preferredOrder = ["Photos", "Videos", VOICES, "Events", "Press", "Publications"];

export function MediaGallery({ items, voices }: { items: MediaItemDto[]; voices: VoiceDto[] }) {
  const [filter, setFilter] = useState("All");
  const [selectedVoice, setSelectedVoice] = useState<VoiceDto | null>(null);
  const voiceOpener = useRef<HTMLButtonElement | null>(null);

  // Filters come from the data (known categories first, then any new ones editors add).
  const present = new Set([...items.map((item) => item.category), ...(voices.length ? [VOICES] : [])]);
  const types = ["All", ...preferredOrder.filter((c) => present.has(c)), ...[...present].filter((c) => !preferredOrder.includes(c)).sort()];

  const filtered = filter === "All" ? items : items.filter((item) => item.category === filter);
  const voiceItems = filter === "All" || filter === VOICES ? voices : [];

  const closeVoice = () => {
    setSelectedVoice(null);
    window.setTimeout(() => voiceOpener.current?.focus(), 0);
  };

  return (
    <>
      <div className="filter-row">
        {types.map((type) => (
          <button
            key={type}
            className={`filter-button ${filter === type ? "active" : ""}`}
            onClick={() => setFilter(type)}
            aria-pressed={filter === type}
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
              Leaders and partners who have lent their voice to community
              action against drug abuse.
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
          // Items linked to a voice are shown through the voice cards above.
          .filter((item) => !item.voiceId)
          .map((item) => {
            const isVideo = item.type === "VIDEO" || item.type === "AUDIO";
            return (
              <article className="listing-item" key={item.id} data-testid={`card-media-${item.slug}`}>
                <div className="media-image">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.altText ?? ""} loading="lazy" width={850} height={460} />}
                  {isVideo && (
                    <span className="media-play">
                      <Play size={15} fill="currentColor" />
                    </span>
                  )}
                </div>
                <div className="card-meta">
                  <span>{item.category}</span>
                  {item.dateLabel && <span>{item.dateLabel}</span>}
                </div>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                {item.assetUrl ? (
                  <a href={item.assetUrl} target="_blank" rel="noopener noreferrer" className="link-arrow" data-testid={`link-media-open-${item.slug}`}>
                    {item.type === "DOCUMENT" ? "Open document" : isVideo ? "Play" : "Open"} <ArrowUpRight size={15} />
                  </a>
                ) : (
                  <button type="button" className="link-arrow media-placeholder-action" data-testid={`button-media-open-${item.slug}`}>
                    Media item coming soon <ArrowUpRight size={15} />
                  </button>
                )}
              </article>
            );
          })}
      </div>
      {selectedVoice && (
        <VoiceDetailModal voice={selectedVoice} onClose={closeVoice} />
      )}
    </>
  );
}
