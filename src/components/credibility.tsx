"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { useRef, useState } from "react";
import { Eyebrow } from "@/components/site";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import type { PartnerDto } from "@/Services/partner.service";
import type { VoiceDto } from "@/Services/voice.service";

// Stakeholder voices and their leader videos are one Voice record (videoUrl,
// videoTitle and videoPosterUrl are optional), loaded by the page on the server.

export function VoiceDetailModal({
  voice,
  onClose,
}: {
  voice: VoiceDto;
  onClose: () => void;
}) {
  const [showVideo, setShowVideo] = useState(false);
  const videoButton = useRef<HTMLButtonElement | null>(null);
  if (showVideo && voice.videoUrl)
    return (
      <VideoModal
        voice={voice}
        onClose={() => {
          setShowVideo(false);
          window.setTimeout(() => videoButton.current?.focus(), 0);
        }}
      />
    );
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="credibility-modal"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="h-full w-full relative">
          {voice.imageUrl && <Image src={voice.imageUrl} alt="" fill className="object-cover"/>}
        </div>
        <div className="modal-copy">
          <Eyebrow>{voice.category ? `${voice.category} · ` : ""}Profile</Eyebrow>
          <DialogTitle className="credibility-dialog-title">
            {voice.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Stakeholder profile, statement and related video.
          </DialogDescription>
          <p className="modal-role">{voice.role}</p>
          <blockquote>{voice.quote}</blockquote>
          {voice.description && <p>{voice.description}</p>}
          {voice.videoUrl && (
            <button
              ref={videoButton}
              className="button-primary modal-video-button"
              onClick={() => setShowVideo(true)}
            >
              <Play size={15} fill="currentColor" /> Hear what he has to say
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VoiceCarousel({ voices }: { voices: VoiceDto[] }) {
  const [active, setActive] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<VoiceDto | null>(null);
  const detailOpener = useRef<HTMLButtonElement | null>(null);
  const voice = voices[active] ?? voices[0];
  if (!voice) return null;
  const move = (direction: number) =>
    setActive(
      (current) => (current + direction + voices.length) % voices.length,
    );
  const closeDetail = () => {
    setSelectedVoice(null);
    window.setTimeout(() => detailOpener.current?.focus(), 0);
  };
  return (
    <section className="section-pad credibility-section" id="voices-of-support">
      <div className="container-wide">
        <div className="section-heading">
          <div>
            <Eyebrow>Voices of Support</Eyebrow>
            <h2 className="display">
              Building healthier communities requires collective action.
            </h2>
          </div>
          <p>
            Leaders and partners from across Nigeria share why community
            action against drug abuse matters.
          </p>
        </div>
        <div className="voice-composition">
          <div className="voice-portrait relative">
            {voice.imageUrl && <Image src={voice.imageUrl} alt="" fill />}
          </div>
          <div className="voice-copy">
            <div className="card-meta">
              <span>{voice.category}</span>
              <span>
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(voices.length).padStart(2, "0")}
              </span>
            </div>
            <blockquote>{voice.quote}</blockquote>
            <div className="voice-identity">
              <strong>{voice.name}</strong>
              <span>{voice.role}</span>
            </div>
            {voice.description && <p>{voice.description}</p>}
            <button
              ref={detailOpener}
              className="link-arrow"
              onClick={() => setSelectedVoice(voice)}
            >
              View stakeholder details <ArrowUpRight size={15} />
            </button>
            <div className="voice-controls">
              <div className="voice-dots">
                {voices.map((item, index) => (
                  <button
                    key={item.id}
                    className={index === active ? "active" : ""}
                    onClick={() => setActive(index)}
                    aria-label={`Show ${item.name}`}
                    aria-current={index === active ? "true" : undefined}
                  >
                    <span />
                  </button>
                ))}
              </div>
              <div className="voice-arrows">
                <button
                  className="hero-arrow focus-ring"
                  onClick={() => move(-1)}
                  aria-label="Previous voice"
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  className="hero-arrow focus-ring"
                  onClick={() => move(1)}
                  aria-label="Next voice"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedVoice && (
        <VoiceDetailModal voice={selectedVoice} onClose={closeDetail} />
      )}
    </section>
  );
}

function VideoModal({
  voice,
  onClose,
}: {
  voice: VoiceDto;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="video-modal"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="video-placeholder">
          <video controls playsInline className="w-full rounded-lg h-105" poster={voice.videoPosterUrl ?? undefined}>
            <source src={voice.videoUrl ?? undefined} type="video/mp4" />
          </video>
          <small>{voice.name} · {voice.role}</small>
        </div>
        <div className="modal-copy">
          <Eyebrow>Featured video</Eyebrow>
          <DialogTitle className="credibility-dialog-title">
            {voice.videoTitle ?? voice.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Video message from {voice.name}.
          </DialogDescription>
          <p className="modal-role">
            {voice.name} · {voice.role}
          </p>
          {voice.description && <p>{voice.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Leader/partner videos: every published voice that has a video. */
export function FeaturedVideo({ voices }: { voices: VoiceDto[] }) {
  const videos = voices.filter((voice) => voice.videoUrl);
  const [active, setActive] = useState(0);
  const video = videos[active] ?? videos[0];
  if (!video) return null;

  return (
    <section className="section-pad work-band" id="leaders-partners">
      <div className="container-wide">
        <div className="section-heading">
          <div>
            <Eyebrow>Hear From Our Leaders & Partners</Eyebrow>

            <h2 className="display">
              Respected voices supporting community action.
            </h2>
          </div>

          <p>
            Hear directly from voices connected to the movement for healthier
            and more resilient communities.
          </p>
        </div>

        <div className="featured-video-layout">
          <div className="featured-video">
            <div className="w-full aspect-video overflow-hidden rounded-lg">
              <video
                key={video.videoUrl}
                controls
                playsInline
                poster={video.videoPosterUrl ?? undefined}
                className="w-full h-full object-contain"
              >
                <source src={video.videoUrl ?? undefined} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            </div>

            <small>
              {video.name} · {video.role}
            </small>
          </div>

          <div className="featured-video-copy">
            <Eyebrow>Featured perspective</Eyebrow>

            <h3>{video.videoTitle ?? video.name}</h3>

            <strong>{video.name}</strong>

            <span>{video.role}</span>

            <div className="video-list">
              {videos.map((item, index) => {
                const thumbnail = item.videoPosterUrl ?? item.imageUrl;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`video-card ${
                      index === active ? "active" : ""
                    }`}
                    onClick={() => setActive(index)}
                    aria-pressed={index === active}
                  >
                    <span className="video-card-image relative">
                      {thumbnail && <Image src={thumbnail} alt="" fill/>}
                      <Play size={15} fill="currentColor" />
                    </span>

                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.videoTitle}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CredibilitySection({ voices, partners }: { voices: VoiceDto[]; partners: PartnerDto[] }) {
  const portraits = voices.filter((voice) => voice.imageUrl).slice(0, 3);
  const sizes = [
    { width: 360, height: 480 },
    { width: 360, height: 250 },
    { width: 360, height: 220 },
  ];
  return (
    <section className="section-pad credibility-partnership">
      <div className="container-wide">
        <div className="section-heading">
          <div>
            <Eyebrow>A movement built through partnership</Eyebrow>
            <h2 className="display">Working together for lasting change.</h2>
          </div>
          <p>
            ICAADA’s partnership philosophy connects community knowledge,
            trusted institutions, professional practice, evidence and practical
            action.
          </p>
        </div>
        <div className="credibility-gallery">
          {portraits.map((voice, index) => (
            <Image
              key={voice.id}
              width={sizes[index].width}
              height={sizes[index].height}
              src={voice.imageUrl as string}
              alt={`${voice.name}, ${voice.role}`}
            />
          ))}
          <div className="credibility-ecosystem">
            <span>Collaboration ecosystem</span>
            {partners.slice(0, 9).map((partner) => (
              <strong key={partner.id}>{partner.name}</strong>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function VoiceMediaCard({
  voice,
  onOpen,
}: {
  voice: VoiceDto;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  return (
    <button
      className="voice-media-card"
      onClick={(event) => onOpen(event.currentTarget)}
    >
      {voice.imageUrl && <Image width={470} height={400} src={voice.imageUrl} alt="" />}
      <span className="voice-media-overlay">
        <Eyebrow>{voice.category}</Eyebrow>
        <strong>{voice.name}</strong>
        <small>{voice.role}</small>
        <span className="link-arrow">
          View profile <ArrowUpRight size={14} />
        </span>
      </span>
    </button>
  );
}
