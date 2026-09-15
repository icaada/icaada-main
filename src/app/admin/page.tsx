"use client";

import Link from "next/link";

export default function AdminDashboardPlaceholder() {
  return (
    <div className="admin-dashboard-layout">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-container">
          <Link href="/" className="brand focus-ring">
            <span className="brand-mark">IC</span>
            <span className="brand-wordmark">
              ICAADA
              <small>Administration Portal</small>
            </span>
          </Link>
          <Link href="/admin/login" className="admin-text-link focus-ring">Sign out</Link>
        </div>
      </header>
      <main className="admin-dashboard-main">
        <div className="admin-dashboard-container">
          <div className="admin-placeholder-card">
            <h1 className="admin-title">Dashboard Overview</h1>
            <p className="admin-subtitle">Welcome to the ICAADA Administration Portal. Digital content management features will be available here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
