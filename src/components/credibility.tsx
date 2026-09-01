import { ArrowLeft, ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { useRef, useState } from "react";
import {
  leaderVideos,
  partnershipGroups,
  stakeholderVoices,
} from "@/data/content";
import { Eyebrow } from "@/components/site";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";


type Voice = (typeof stakeholderVoices)[number];
type LeaderVideo = (typeof leaderVideos)[number];

export function VoiceDetailModal({
  voice,
  onClose,
}: {
  voice: Voice;
  onClose: () => void;
}) {
  const video = leaderVideos.find((item) => item.id === voice.videoId);
  const [showVideo, setShowVideo] = useState(false);
  const videoButton = useRef<HTMLButtonElement | null>(null);
  if (showVideo && video)
    return (
      <VideoModal
        video={video}
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
          <Image src={voice.image} alt="" fill className="object-cover"/>
        </div>
        <div className="modal-copy">
          <Eyebrow>{voice.category} · Profile</Eyebrow>
          <DialogTitle className="credibility-dialog-title">
            {voice.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Placeholder stakeholder profile, statement, related envisioned event
            and related video.
          </DialogDescription>
          <p className="modal-role">{voice.role}</p>
          <blockquote>{voice.quote}</blockquote>
          <p>{voice.description}</p>
          {/* <div className="modal-relationship">
            <strong>Placeholder relationship · envisioned event</strong>
            <Link href={`/events/${voice.eventSlug}`} onClick={onClose}>
              {voice.eventLabel} <ArrowUpRight size={14} />
            </Link>
          </div> */}
          {video && (
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

export function VoiceCarousel({
  voices = stakeholderVoices,
}: {
  voices?: Voice[];
}) {
  const [active, setActive] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
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
            Selected stakeholder perspectives are shown here as replaceable
            placeholders until verified names, roles, organisations and
            statements are supplied.
          </p>
        </div>
        <div className="voice-composition">
          <div className="voice-portrait relative">
            <Image src={voice.image} alt="" fill />
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
            <p>{voice.description}</p>
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
  video,
  onClose,
}: {
  video: LeaderVideo;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="video-modal"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="video-placeholder">
          <video controls playsInline className="w-full rounded-lg h-105">
            <source src={video.videoUrl} type="video/mp4" />
          </video>
          {/* <span>
            <Play size={25} fill="currentColor" />
          </span> */}
          <small>{video.name} · {video.role}</small>
        </div>
        <div className="modal-copy">
          <Eyebrow>Featured video placeholder</Eyebrow>
          <DialogTitle className="credibility-dialog-title">
            {video.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Static placeholder for a future verified stakeholder video.
          </DialogDescription>
          <p className="modal-role">
            {video.name} · {video.role}
          </p>
          <p>{video.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function FeaturedVideo() {
  const [active, setActive] = useState(0);
  const video = leaderVideos[active];

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
            and more resilient communities. All names, roles and clips below
            are placeholders for verified material.
          </p>
        </div>

        <div className="featured-video-layout">
          <div className="featured-video">
            <div className="w-full aspect-video overflow-hidden rounded-lg">
              <video
                key={video.videoUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            </div>

            <small>
              {video.name} · {video.role}
            </small>
          </div>

          <div className="featured-video-copy">
            <Eyebrow>Featured perspective</Eyebrow>

            <h3>{video.title}</h3>

            <strong>{video.name}</strong>

            <span>{video.role}</span>

            {/* <p>{video.description}</p> */}

            <div className="video-list">
              {leaderVideos.map((item, index) => (
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
                    <Image src={item.image} alt="" fill/>
                    <Play size={15} fill="currentColor" />
                  </span>

                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.title}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CredibilitySection() {
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
          <Image
          width={360}
          height={480}
            src={stakeholderVoices[0].image}
            alt="Placeholder stakeholder portrait"
          />
          <Image
          width={360}
          height={250}
            src={stakeholderVoices[1].image}
            alt="Placeholder community gathering"
          />
          <Image
          width={360}
          height={220}
            src={stakeholderVoices[2].image}
            alt="Placeholder youth representatives"
          />
          <div className="credibility-ecosystem">
            <span>Collaboration ecosystem · placeholder grouping</span>
            {partnershipGroups.slice(0, 9).map((partner) => (
              <strong key={partner}>{partner}</strong>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// export function VoiceMediaCard({
//   voice,
//   onOpen,
// }: {
//   voice: Voice;
//   onOpen: (trigger: HTMLButtonElement) => void;
// }) {
//   return (
//     <button
//       className="voice-media-card"
//       onClick={(event) => onOpen(event.currentTarget)}
//     >
//       <img src={voice.image} alt="" />
//       <span className="voice-media-overlay">
//         <Eyebrow>{voice.category}</Eyebrow>
//         <strong>{voice.name}</strong>
//         <small>{voice.role}</small>
//         <span className="link-arrow">
//           View placeholder profile <ArrowUpRight size={14} />
//         </span>
//       </span>
//     </button>
//   );
// }
