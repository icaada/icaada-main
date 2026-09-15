"use client";

import { ArrowRight, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TeamMember } from "@/data/content";
import Image from "next/image";

export function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <div className="team-directory-grid">
      {members.map((member) => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const close = () => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="team-member-card focus-ring text-left"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`View profile of ${member.name}`}
      >
        <div className="w-full h-65 relative">
            <Image
          src={member.image}
          alt=""
          loading="lazy"
          fill
          className="team-member-photo object-cover object-top"
        />
        </div>
        <span className="team-member-info">
          <span className="team-member-name">{member.name}</span>
          <span className="team-member-position">{member.position}</span>
          <span className="team-member-button">
            View Profile <ArrowRight size={15} />
          </span>
        </span>
      </button>
      {open && <TeamMemberModal member={member} onClose={close} />}
    </>
  );
}

export function TeamMemberModal({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) {
  const socialLinks = member.socialLinks.filter(
    (social) => social.url && social.label,
  );
  return (
    <Dialog open onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        className="team-modal-content"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="team-modal-layout">
          <div className="team-modal-sidebar">
            <img src={member.image} alt="" className="team-modal-photo" />
            {(member.email ||
              member.phone ||
              member.location ||
              socialLinks.length > 0) && (
              <div className="team-modal-sidebar-info">
                <h3 className="team-modal-section-title">
                  Contact & professional links
                </h3>
                <div className="team-modal-contact">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="team-modal-contact-link focus-ring"
                    >
                      <Mail size={16} /> {member.email}
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="team-modal-contact-link focus-ring"
                    >
                      <Phone size={16} /> {member.phone}
                    </a>
                  )}
                  {member.location && (
                    <span className="team-modal-contact-link">
                      <MapPin size={16} /> {member.location}
                    </span>
                  )}
                  {socialLinks.map((social) => (
                    <a
                      key={social.url}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="team-modal-contact-link focus-ring"
                    >
                      <Linkedin size={16} /> {social.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="team-modal-body">
            <DialogTitle className="team-modal-name">{member.name}</DialogTitle>
            <DialogDescription className="team-modal-position">
              Profile · {member.position}
            </DialogDescription>
            <p className="team-modal-bio">{member.biography}</p>
            {member.responsibilities.length > 0 && (
              <section>
                <h3 className="team-modal-section-title">
                  Key Responsibilities
                </h3>
                <ul className="team-modal-list">
                  {member.responsibilities.map((responsibility) => (
                    <li key={responsibility}>{responsibility}</li>
                  ))}
                </ul>
              </section>
            )}
            {member.expertise.length > 0 && (
              <section>
                <h3 className="team-modal-section-title">Areas of Expertise</h3>
                <ul className="team-modal-list">
                  {member.expertise.map((expertise) => (
                    <li key={expertise}>{expertise}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
