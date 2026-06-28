"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { 
  ArrowRight, 
  GitBranch, 
  Check,
  CheckCircle,
  WhatsappLogo,
  Phone,
  Calendar,
  EnvelopeSimple
} from "@phosphor-icons/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { workflowsData } from "@/components/workflows";
import WorkflowIcon from "@/components/WorkflowIcon";

import { getWorkflows } from "@/app/actions";
import { Workflow } from "@/components/workflows";

// Framer motion animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

interface HomeClientProps {
  initialWorkflows: Workflow[];
}

export default function HomeClient({ initialWorkflows }: HomeClientProps) {
  const [workflows, setWorkflows] = React.useState<Workflow[]>(initialWorkflows);

  React.useEffect(() => {
    getWorkflows().then((data) => {
      if (data && data.length > 0) {
        setWorkflows(data);
      }
    });
  }, []);

  // Grab 3 workflows to feature on homepage (fallback to static)
  const featuredWorkflows = workflows.length > 0 
    ? workflows.slice(0, 3) 
    : workflowsData.slice(0, 3);

  const downloadWorkflowJson = async (flow: Workflow) => {
    try {
      let jsonText = "";
      let fileName = `${flow.slug}.json`;

      if (flow.filePath && flow.filePath.startsWith("/workflows")) {
        const response = await fetch(flow.filePath);
        if (response.ok) {
          jsonText = await response.text();
          fileName = flow.filePath.split("/").pop() || fileName;
        }
      }

      if (!jsonText) {
        const nodeTypesArray = Array.isArray(flow.nodeTypes) ? flow.nodeTypes : [];
        const exportData = {
          name: flow.name,
          nodes: nodeTypesArray.map((type) => ({
            type: `n8n-nodes-base.${type.toLowerCase().replace(/\s+/g, "")}`,
            name: type,
            parameters: {}
          })),
          connections: {}
        };
        jsonText = JSON.stringify(exportData, null, 2);
      }

      const blob = new Blob([jsonText], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download workflow JSON:", err);
    }
  };

  return (
    <>
      <Header />
      
      {/* Hero Section - Asymmetric layout */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 px-6 md:px-12 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Hero Column */}
          <motion.div 
            className="lg:col-span-7 flex flex-col items-start text-left"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 bg-surface-muted rounded-full border border-outline-variant/30 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-accent-lime animate-pulse" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-deep/80">
                PRO-GRADE n8n SOLUTIONS
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-ink-deep leading-[1.05] mb-6"
            >
              We turn n8n workflows into <span className="underline decoration-accent-lime decoration-wavy decoration-2">production power.</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="font-sans text-base sm:text-lg md:text-xl text-ink-deep/85 leading-relaxed max-w-[550px] mb-8"
            >
              Everyone else is still in the strategy session. We build resilient, AI-powered automation layers, database pipes, and integrations. Shipped fast. Designed with operational precision.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                href="#connect"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-lime text-ink-deep font-sans font-semibold rounded-lg hover:bg-accent-lime/90 active:scale-[0.98] transition-all border border-ink-deep/10 shadow-[0_4px_12px_rgba(193,225,97,0.15)] text-center"
              >
                Book an Automation Call
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                href="/workflows"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-ink-deep font-sans font-semibold rounded-lg border border-ink-deep hover:bg-surface-muted/50 active:scale-[0.98] transition-all text-center"
              >
                Explore Workflows
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Hero Column (Visual Deck / Mockup) */}
          <motion.div 
            className="lg:col-span-5 relative w-full aspect-[4/3] lg:aspect-square rounded-2xl border border-outline-variant/60 bg-surface-muted overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.3, stiffness: 60, damping: 15 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-muted via-transparent to-accent-lime/10 pointer-events-none z-10" />
            <Image
              src="/brandkit_deck.png"
              alt="Automation Studio Identity & Workflow Deck"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Metrics Section - Warm Grid */}
      <section className="border-y border-outline-variant/30 bg-surface-muted/15 py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { num: "100+", label: "Workflows Deployed" },
              { num: "99.99%", label: "Pipeline Uptime" },
              { num: "300+", label: "Tasks Automated" },
              { num: "1000s", label: "Hours Saved" }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-start">
                <span className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink-deep tracking-tight mb-2">
                  {stat.num}
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-deep/60">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workflows Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-[600px]">
            <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary mb-3 block">
              Flagship blueprints
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-ink-deep leading-tight">
              Featured Workflows
            </h2>
            <p className="font-sans text-base text-ink-deep/75 mt-4">
              Curated, production-grade automation systems connecting enterprise SaaS, data lakes, and LLM providers.
            </p>
          </div>
          <Link
            href="/workflows"
            className="inline-flex items-center gap-2 font-sans font-bold text-sm text-ink-deep group hover:text-primary transition-colors self-start md:self-auto"
          >
            View all workflows
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Workflow list: custom cards with node visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredWorkflows.map((flow) => (
            <motion.div
              key={flow.slug}
              className="bg-white border border-outline-variant/50 rounded-2xl p-6 hover:border-accent-lime shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_16px_35px_-15px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between group relative overflow-hidden h-full"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              <div className="flex flex-col gap-4 h-full justify-between">
                {/* Image Container with Hover Action Overlay */}
                <div className="relative w-full aspect-[16/10] rounded-xl border border-outline-variant/30 bg-canvas-bg/30 overflow-hidden group/img">
                  {flow.screenshot ? (
                    <img
                      src={flow.screenshot}
                      alt={flow.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-canvas-bg/60 p-4 text-center">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-ink-deep/30 mb-1">
                        n8n studio canvas
                      </span>
                      <span className="font-sans text-xs font-bold text-ink-deep/45">
                        Canvas Preview Not Uploaded
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-ink-deep/80 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3 z-10 p-4">
                    <Link
                      href={`/cases/${flow.slug}`}
                      className="w-48 py-2 bg-accent-lime text-ink-deep font-sans font-semibold text-xs rounded hover:bg-accent-lime/90 text-center transition-all shadow-sm"
                    >
                      View Case Study / Git
                    </Link>
                    <button
                      onClick={() => downloadWorkflowJson(flow)}
                      className="w-48 py-2 bg-white text-ink-deep border border-outline font-sans font-semibold text-xs rounded hover:bg-surface-muted/95 text-center transition-all shadow-sm"
                    >
                      Download JSON File
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-lg font-bold text-ink-deep leading-snug group-hover:text-primary transition-colors">
                  {flow.name}
                </h3>

                {/* Dot-Pin Visual Node Connection Chain */}
                <div className="w-full bg-canvas-bg/40 rounded-xl p-4 border border-outline-variant/20 flex items-center justify-between relative mt-auto">
                  {/* Horizontal connector line */}
                  <div className="absolute top-1/2 left-8 right-8 h-[2px] border-t border-dashed border-ink-deep/20 -translate-y-1/2 pointer-events-none" />

                  {flow.visualNodes.slice(0, 3).map((node, nIdx) => (
                    <div key={nIdx} className="flex flex-col items-center gap-1 relative z-10">
                      <div 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                          node.isAccent 
                            ? "bg-accent-lime border-ink-deep/20 text-ink-deep scale-110 shadow-[0_2px_8px_rgba(193,225,97,0.2)]" 
                            : "bg-white border-outline-variant/60 text-ink-deep"
                        }`}
                      >
                        <WorkflowIcon name={node.icon} size={14} />
                      </div>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-ink-deep/50 max-w-[60px] text-center truncate">
                        {node.label}
                      </span>
                    </div>
                  ))}

                  {flow.visualNodes.length > 3 && (
                    <div className="flex flex-col items-center gap-1 relative z-10">
                      <div className="w-8 h-8 rounded-lg bg-surface-muted border border-outline-variant/30 flex items-center justify-center font-mono text-[10px] font-bold text-ink-deep/50">
                        +{flow.visualNodes.length - 3}
                      </div>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-ink-deep/50">
                        More
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Before / After Map Section */}
      <section id="philosophy" className="bg-surface-muted/30 border-y border-outline-variant/30 py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-[650px] mb-20">
            <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary mb-3 block">
              OPERATIONAL FRAMEWORK
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-ink-deep leading-tight">
              We Design Resilient Systems, Not One-Off Hacks
            </h2>
            <p className="font-sans text-base text-ink-deep/75 mt-4">
              Automation is only as good as its stability. We design n8n deployments with enterprise frameworks to ensure 100% processing continuity and clear traceability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left side: Before n8n */}
            <div className="bg-white border border-outline-variant/50 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-outline-variant/30">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-mono font-bold text-sm">
                  ✖
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-deep">
                    Before n8n Systemization
                  </h3>
                  <p className="font-sans text-xs text-ink-deep/60 mt-0.5">
                    Fragile pipelines, manual operations, and zero observability.
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  "Sales teams copying customer data manually, causing hours of delay.",
                  "VM batch scripts crashing silently with zero notification logic.",
                  "Duplicate records and invalid emails clogging Salesforce pipeline.",
                  "PDF summarization and fact-checking eating up valuable analyst hours."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-1 text-sm">•</span>
                    <span className="font-sans text-sm text-ink-deep/80 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side: After n8n */}
            <div className="bg-white border-2 border-accent-lime rounded-2xl p-8 shadow-[0_12px_30px_-10px_rgba(193,225,97,0.15)] relative">
              <div className="absolute -top-3 right-6 px-3 py-1 bg-accent-lime text-ink-deep font-mono text-[9px] font-bold uppercase tracking-wider rounded-full border border-ink-deep/10">
                RECOMMENDED ARCHITECTURE
              </div>

              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-outline-variant/30">
                <div className="w-8 h-8 rounded-full bg-accent-lime/20 text-ink-deep flex items-center justify-center">
                  <Check size={16} weight="bold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink-deep">
                    After n8n Integration Layer
                  </h3>
                  <p className="font-sans text-xs text-ink-deep/60 mt-0.5">
                    Automated, validated, self-healing pipelines with telemetry.
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  "Real-time webhook routing syncs new leads in under 2 seconds.",
                  "Active Slack notifications with execution payloads on pipeline failures.",
                  "Clearbit lookup enriches corporate metadata automatically.",
                  "AI document extracts, facts, and logs records to spreadsheets in 45s."
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1 text-sm">✓</span>
                    <span className="font-sans text-sm text-ink-deep/90 leading-relaxed font-medium">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Connect / CTA Section - Large Shadcn Style */}
      <section id="connect" className="py-24 md:py-32 px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="bg-white border border-outline-variant/50 rounded-3xl p-8 md:p-16 shadow-[0_16px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-lime" />
          
          <div className="text-center max-w-[650px] mx-auto mb-16">
            <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary mb-4 block">
              Let's Collaborate
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink-deep tracking-tight mb-6">
              Ready to Streamline Your Operations?
            </h2>
            <p className="font-sans text-base text-ink-deep/75 leading-relaxed">
              Choose your preferred channel below to discuss your custom n8n workflows, CRM automation pipelines, or AI integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WhatsApp */}
            <a 
              href="https://wa.me/918340582336"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start p-8 bg-canvas-bg/15 border border-outline-variant/40 rounded-2xl hover:border-accent-lime hover:bg-white hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <WhatsappLogo size={26} weight="fill" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink-deep mb-2">
                WhatsApp Chat
              </h3>
              <p className="font-sans text-xs text-ink-deep/60 mb-6 leading-relaxed">
                Send a message for direct, real-time responses to custom blueprint inquiries.
              </p>
              <span className="font-mono text-xs text-ink-deep/80 font-bold mt-auto group-hover:underline flex items-center gap-1">
                +91 83405 82336 →
              </span>
            </a>

            {/* Calendly */}
            <a 
              href="https://calendly.com/dkkr698"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start p-8 bg-canvas-bg/15 border border-outline-variant/40 rounded-2xl hover:border-accent-lime hover:bg-white hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-lime/20 text-ink-deep flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Calendar size={26} weight="bold" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink-deep mb-2">
                Book a Meeting
              </h3>
              <p className="font-sans text-xs text-ink-deep/60 mb-6 leading-relaxed">
                Schedule a 15-minute consulting call to explore your automation integrations.
              </p>
              <span className="font-mono text-xs text-ink-deep/80 font-bold mt-auto group-hover:underline flex items-center gap-1">
                Open Calendar →
              </span>
            </a>

            {/* Email */}
            <a 
              href="mailto:dkkr698@gmail.com"
              className="flex flex-col items-start p-8 bg-canvas-bg/15 border border-outline-variant/40 rounded-2xl hover:border-accent-lime hover:bg-white hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-ink-deep/10 text-ink-deep flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <EnvelopeSimple size={26} weight="bold" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink-deep mb-2">
                Send Email
              </h3>
              <p className="font-sans text-xs text-ink-deep/60 mb-6 leading-relaxed">
                Drop us a detailed email regarding your workflow blueprint or project specifications.
              </p>
              <span className="font-mono text-xs text-ink-deep/80 font-bold mt-auto group-hover:underline flex items-center gap-1">
                dkkr698@gmail.com →
              </span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
