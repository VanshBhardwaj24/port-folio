"use client";

import React from "react";
import Link from "next/link";
import { GitBranch } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-muted/30 border-t border-outline-variant/30 py-16 mt-auto">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 self-start">
              <div className="w-6 h-6 rounded bg-ink-deep flex items-center justify-center text-accent-lime">
                <GitBranch size={14} weight="bold" />
              </div>
              <span className="font-display text-sm font-extrabold tracking-tight text-ink-deep">
                N8N GALLERY
              </span>
            </Link>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-deep/60 leading-relaxed">
              © 2026 AUTOMATION STUDIO. BUILT WITH PRECISION.
            </p>
            <p className="font-sans text-sm text-ink-deep/75 max-w-[360px]">
              Designing resilient, production-grade workflows for modern technical teams and hyper-growth agencies.
            </p>
          </div>

          {/* Links Column */}
          <div className="flex flex-col md:items-end justify-between h-full gap-6">
            <nav className="flex flex-wrap gap-x-8 gap-y-2">
              <Link href="/workflows" className="font-sans text-sm font-semibold text-ink-deep hover:text-primary transition-colors">
                Workflows
              </Link>
              <a href="/#philosophy" className="font-sans text-sm font-semibold text-ink-deep hover:text-primary transition-colors">
                Solutions
              </a>
              <a href="/#philosophy" className="font-sans text-sm font-semibold text-ink-deep hover:text-primary transition-colors">
                About
              </a>
              <a href="/#connect" className="font-sans text-sm font-semibold text-ink-deep hover:text-primary transition-colors">
                Privacy
              </a>
            </nav>
            <div className="text-left md:text-right">
              <span className="font-mono text-[11px] text-ink-deep/40 uppercase tracking-widest block">
                Infrastructure backbone: n8n.io
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
