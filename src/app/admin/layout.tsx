import { type ReactNode } from 'react';
import { photos } from '@/data/content';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-auth-layout">
      <div className="admin-auth-brand">
        <Image
          src={photos.community}
          alt="Community members gathered in conversation"
          className="admin-auth-image"
          fill
        />
        <div className="admin-auth-brand-overlay">
          <Link href="/" className="brand admin-auth-home focus-ring" aria-label="Return to the ICAADA website">
            <span className="brand-mark admin-auth-mark" aria-hidden="true">IC</span>
            <span className="brand-wordmark">
              ICAADA
              <small>Initiative for Community Action Against Drug Abuse</small>
            </span>
          </Link>
          <div className="admin-auth-brand-copy">
            <span>ICAADA Administration</span>
            <p>Mobilising Communities. Empowering People. Preventing Drug Abuse.</p>
          </div>
        </div>
      </div>
      <div className="admin-auth-content">
        {children}
      </div>
    </div>
  );
}
