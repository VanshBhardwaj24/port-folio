"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitBranch, List, X } from "@phosphor-icons/react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Workflows", href: "/workflows" },
    { name: "Philosophy", href: "/#philosophy" },
    { name: "Connect", href: "/#connect" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-canvas-bg/85 backdrop-blur-xl border-b border-outline-variant/30 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-ink-deep flex items-center justify-center text-accent-lime transition-transform duration-300 group-hover:rotate-12">
            <GitBranch size={18} weight="bold" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-deep">
            N8N GALLERY
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-sans text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary font-semibold" : "text-ink-deep/70"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Link
            href="/#connect"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-accent-lime text-ink-deep font-sans font-semibold text-sm rounded-lg hover:bg-accent-lime/90 active:scale-95 transition-all duration-250 border border-ink-deep/10 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
          >
            Book a Call
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-ink-deep hover:bg-surface-muted rounded-md transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-canvas-bg border-b border-outline-variant/40 py-6 px-6 shadow-xl flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-sans text-base font-medium py-1 transition-colors hover:text-primary ${
                    isActive ? "text-primary font-semibold" : "text-ink-deep/70"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-outline-variant/20">
            <Link
              href="/#connect"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center py-3 bg-accent-lime text-ink-deep font-sans font-semibold text-sm rounded-lg border border-ink-deep/10 hover:bg-accent-lime/90 transition-colors"
            >
              Book a Call
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
