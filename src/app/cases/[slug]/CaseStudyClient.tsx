"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Cpu, 
  Sliders, 
  SealCheck,
  Warning,
  Clock,
  Gauge,
  ShieldCheck,
  GithubLogo
} from "@phosphor-icons/react";
import { Workflow } from "@/components/workflows";
import WorkflowIcon from "@/components/WorkflowIcon";

interface CaseStudyClientProps {
  workflow: Workflow;
  jsonContent: string;
  isCustomWorkflow?: boolean;
  aiSummary?: string;
}

export default function CaseStudyClient({ 
  workflow, 
  jsonContent, 
  isCustomWorkflow = false, 
  aiSummary 
}: CaseStudyClientProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"visual" | "json">("visual");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      setCopied(true);
      showToast("JSON Schema copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
      showToast("Failed to copy JSON", "error");
    }
  };

  const handleDownload = () => {
    try {
      if (!jsonContent) {
        showToast("No JSON content available to download", "error");
        return;
      }

      const element = document.createElement("a");
      const file = new Blob([jsonContent], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(file);
      
      element.href = downloadUrl;
      element.download = `${workflow.slug}.json`;
      document.body.appendChild(element);
      element.click();
      
      document.body.removeChild(element);
      URL.revokeObjectURL(downloadUrl);

      if (isCustomWorkflow) {
        showToast("Dynamic mock schema downloaded (Source JSON not configured)", "info");
      } else {
        showToast("Workflow JSON downloaded successfully", "success");
      }
    } catch (err) {
      console.error("Download failed:", err);
      showToast("Failed to download JSON file", "error");
    }
  };

  // Map slugs to screenshots uploaded in public/
  const getScreenshot = (slug: string) => {
    switch (slug) {
      case "crm-enrichment": return "/workflow_lead.png";
      case "pdf-summary": return "/workflow_pdf.png";
      case "db-backup": return "/workflow_sync.png";
      case "shopify-fulfillment": return "/workflow_sync.png";
      default: return "/workflow_lead.png";
    }
  };

  return (
    <main className="max-w-[1280px] mx-auto px-6 md:px-12 pt-8 pb-24 flex-grow">
      {/* Back Button */}
      <Link
        href="/workflows"
        className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-deep/60 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={12} weight="bold" />
        Back to Workflows
      </Link>

      {/* Grid Layout: Top Header Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        {/* Left column: Title & Descriptions */}
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-surface-muted rounded text-ink-deep/80">
              {workflow.category}
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-accent-lime/20 rounded text-ink-deep/80">
              n8n BLUEPRINT
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-ink-deep leading-tight mb-6">
            {workflow.name}
          </h1>

          <p className="font-sans text-base sm:text-lg text-ink-deep/85 leading-relaxed">
            {workflow.longDescription}
          </p>

          {aiSummary && (
            <div className="mt-8 p-5 bg-accent-lime/10 border border-accent-lime/30 rounded-xl flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-accent-lime text-ink-deep flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Cpu size={18} weight="fill" className="animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary block mb-1">
                  AI-Generated Architecture Summary
                </span>
                <p className="font-sans text-sm text-ink-deep/90 leading-relaxed italic">
                  "{aiSummary}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Impact Highlights Card */}
        <div className="lg:col-span-4 bg-white border border-outline-variant/50 rounded-2xl p-6 h-fit shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink-deep border-b border-outline-variant/30 pb-3 mb-4">
            Proven Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-canvas-bg flex items-center justify-center text-primary shrink-0">
                <Clock size={16} weight="bold" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-ink-deep/40 uppercase tracking-widest block">Time Saved</span>
                <span className="font-sans text-sm font-bold text-ink-deep">{workflow.impact.timeSaved}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-canvas-bg flex items-center justify-center text-primary shrink-0">
                <ShieldCheck size={16} weight="bold" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-ink-deep/40 uppercase tracking-widest block">Quality Increase</span>
                <span className="font-sans text-sm font-bold text-ink-deep">{workflow.impact.efficiency}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-canvas-bg flex items-center justify-center text-primary shrink-0">
                <Gauge size={16} weight="bold" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-ink-deep/40 uppercase tracking-widest block">Latency Rate</span>
                <span className="font-sans text-sm font-bold text-ink-deep">{workflow.impact.speed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Tabs: Visual vs Raw JSON */}
      <div className="border border-outline-variant/50 rounded-2xl bg-white overflow-hidden mb-16 shadow-[0_6px_30px_rgba(0,0,0,0.02)]">
        {/* Tab Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-muted/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("visual")}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide uppercase transition-colors ${
                activeTab === "visual"
                  ? "bg-ink-deep text-accent-lime"
                  : "text-ink-deep/60 hover:text-ink-deep"
              }`}
            >
              System Canvas
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide uppercase transition-colors ${
                activeTab === "json"
                  ? "bg-ink-deep text-accent-lime"
                  : "text-ink-deep/60 hover:text-ink-deep"
              }`}
            >
              Raw Schema
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant text-xs font-semibold text-ink-deep rounded-md hover:bg-canvas-bg transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-primary" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy JSON
                </>
              )}
            </button>
             <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-deep text-white text-xs font-semibold rounded-md hover:bg-ink-deep/90 transition-colors"
            >
              <Download size={14} />
              Download
            </button>
            <a
              href="https://github.com/VanshBhardwaj24/port-folio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent-lime text-ink-deep text-xs font-bold rounded-md hover:bg-accent-lime/90 transition-all border border-ink-deep/10 shadow-sm"
            >
              <GithubLogo size={14} weight="bold" />
              GitHub Repository
            </a>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 md:p-8 bg-canvas-bg/30">
          {activeTab === "visual" ? (
            <div className="space-y-8">
              {/* Interactive Node Path */}
              <div className="w-full bg-white rounded-xl p-6 border border-outline-variant/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden">
                {/* Connector line for desktop */}
                <div className="absolute top-1/2 left-12 right-12 h-[2px] border-t border-dashed border-outline/35 -translate-y-1/2 pointer-events-none hidden md:block" />

                {workflow.visualNodes.map((node, idx) => (
                  <div key={idx} className="flex flex-row md:flex-col items-center gap-4 md:gap-2 relative z-10">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                        node.isAccent
                          ? "bg-accent-lime border-ink-deep/20 text-ink-deep scale-110 shadow-[0_4px_12px_rgba(193,225,97,0.3)]"
                          : "bg-white border-outline-variant/80 text-ink-deep"
                      }`}
                    >
                      <WorkflowIcon name={node.icon} size={22} />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-deep/50 block">Node 0{idx + 1}</span>
                      <span className="font-sans text-xs font-bold text-ink-deep block">{node.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Real n8n Builder Screenshot / Mockups */}
              {workflow.mockup ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative w-full aspect-[16/10] rounded-xl border border-outline-variant/40 bg-white overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                    <img
                      src={workflow.screenshot || getScreenshot(workflow.slug)}
                      alt={`${workflow.name} n8n workflow canvas`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative w-full aspect-[16/10] rounded-xl border border-outline-variant/40 bg-white overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                    <img
                      src={workflow.mockup}
                      alt={`${workflow.name} secondary mockup`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-[16/9] rounded-xl border border-outline-variant/40 bg-white overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                  <img
                    src={workflow.screenshot || getScreenshot(workflow.slug)}
                    alt={`${workflow.name} n8n workflow canvas`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ) : (
            /* Dark Terminal Codeblock */
            <div className="w-full bg-[#1E1B18] rounded-xl border border-outline/20 p-5 font-mono text-xs text-[#ECE8E1] overflow-x-auto shadow-inner leading-relaxed">
              <div className="flex items-center justify-between border-b border-[#3E3A36] pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <span className="text-[#A29E97] text-[10px] uppercase tracking-widest">{workflow.slug}.json</span>
              </div>
              <pre className="max-h-[480px] overflow-y-auto whitespace-pre pr-2 custom-scrollbar">
                {jsonContent}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Requirements Box & How It Works Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        {/* Left Side: Requirements Card */}
        <div className="lg:col-span-4 bg-white border border-outline-variant/50 rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2.5 mb-6 border-b border-outline-variant/30 pb-4">
            <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center text-ink-deep shrink-0">
              <Cpu size={16} weight="bold" />
            </div>
            <h3 className="font-display text-base font-bold text-ink-deep">
              System Prerequisites
            </h3>
          </div>

          <ul className="space-y-4">
            {workflow.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border border-outline-variant/60 flex items-center justify-center bg-canvas-bg shrink-0 mt-0.5">
                  <span className="font-mono text-[9px] font-bold text-ink-deep">0{idx + 1}</span>
                </div>
                <span className="font-sans text-sm text-ink-deep/80 leading-normal">
                  {req}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Step-by-Step Timeline */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-accent-lime flex items-center justify-center text-ink-deep shrink-0 border border-ink-deep/10">
              <Sliders size={16} weight="bold" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-deep">
              How the Logic Flows
            </h3>
          </div>

          <div className="space-y-6 relative pl-6 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-outline-variant/35">
            {workflow.steps.map((step) => (
              <div key={step.number} className="relative group">
                {/* Timeline Circle */}
                <div className="absolute -left-[23px] top-1 w-6 h-6 rounded-full bg-white border-2 border-outline-variant/80 group-hover:border-accent-lime flex items-center justify-center transition-colors">
                  <span className="font-mono text-[9px] font-bold text-ink-deep/60 group-hover:text-ink-deep">
                    {step.number}
                  </span>
                </div>
                
                {/* Step Content */}
                <div className="bg-white border border-outline-variant/40 rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                  <h4 className="font-display text-sm font-bold text-ink-deep mb-2">
                    {step.title}
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-ink-deep/75 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Before vs After Friction Mapping */}
      <section className="bg-surface-muted/35 border border-outline-variant/40 rounded-3xl p-8 md:p-12 mb-16">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-ink-deep mb-8 border-b border-outline-variant/30 pb-4">
          Friction Audit: Manual vs. Automated
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded self-start">
              Legacy Manual Friction
            </span>
            <p className="font-sans text-sm font-semibold text-ink-deep/85 leading-relaxed">
              {workflow.before.process}
            </p>
            <ul className="space-y-3 mt-2">
              {workflow.before.bottlenecks.map((bot, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-ink-deep/70">
                  <Warning size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{bot}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-outline-variant/40 pt-6 md:pt-0 md:pl-8">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-container/20 border border-primary-container/50 px-2 py-0.5 rounded self-start">
              n8n Orchestrated Continuity
            </span>
            <p className="font-sans text-sm font-semibold text-ink-deep leading-relaxed">
              {workflow.after.process}
            </p>
            <ul className="space-y-3 mt-2">
              {workflow.after.benefits.map((ben, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-ink-deep/80 font-medium">
                  <SealCheck size={14} weight="fill" className="text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{ben}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer Call to Action card */}
      <section className="bg-ink-deep text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent-lime" />
        <h3 className="font-display text-2xl sm:text-3xl font-extrabold mb-4">
          Need This Workflow Adapted to Your Stack?
        </h3>
        <p className="font-sans text-sm md:text-base text-white/80 max-w-[620px] mx-auto mb-8">
          Every tech infrastructure has its own quirks. I can modify this logic, integrate custom authorization headers, write JS function loops, or connect custom databases for your agency.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="mailto:dkkr698@gmail.com?subject=Inquiry regarding n8n blueprint: Workflows"
            className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 bg-accent-lime text-ink-deep font-sans font-bold text-sm rounded-lg hover:bg-accent-lime/90 active:scale-[0.98] transition-all"
          >
            Request Customization
          </a>
          <Link
            href="/#connect"
            className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 bg-transparent text-white border border-white/40 font-sans font-semibold text-sm rounded-lg hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            Schedule a Consulting Call
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-ink-deep text-[#f6efea] border border-outline-variant/30 rounded-xl shadow-2xl font-mono text-[11px] uppercase tracking-wider"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${
              toast.type === "success" 
                ? "bg-accent-lime shadow-[0_0_8px_rgba(193,225,97,0.8)]" 
                : toast.type === "error" 
                  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
                  : "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
            }`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
