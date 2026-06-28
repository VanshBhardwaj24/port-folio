"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlass, 
  Funnel, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Gauge, 
  Plus, 
  Trash, 
  PencilSimple, 
  ArrowClockwise,
  Lock,
  LockOpen,
  X
} from "@phosphor-icons/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Workflow, workflowsData } from "@/components/workflows";
import WorkflowIcon from "@/components/WorkflowIcon";
import { 
  getWorkflows, 
  createWorkflow, 
  updateWorkflow, 
  deleteWorkflow, 
  resetDatabaseToDefaults,
  verifyAdminPasscode,
  checkSessionActive,
  logoutAdmin
} from "@/app/actions";

interface WorkflowsGalleryClientProps {
  initialWorkflows: Workflow[];
}

export default function WorkflowsGalleryClient({ initialWorkflows }: WorkflowsGalleryClientProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Admin Panel states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [passphraseInput, setPassphraseInput] = useState("");
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Form states
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Workflow["category"]>("DATA OPS");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [filePath, setFilePath] = useState("");
  const [nodesCount, setNodesCount] = useState(4);
  const [nodeTypes, setNodeTypes] = useState("");
  const [requirements, setRequirements] = useState("");
  const [beforeProcess, setBeforeProcess] = useState("");
  const [beforeBottlenecks, setBeforeBottlenecks] = useState("");
  const [afterProcess, setAfterProcess] = useState("");
  const [afterBenefits, setAfterBenefits] = useState("");
  const [timeSaved, setTimeSaved] = useState("");
  const [efficiency, setEfficiency] = useState("");
  const [speed, setSpeed] = useState("");
  const [visualNodesJson, setVisualNodesJson] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [mockup, setMockup] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getWorkflows();
      setWorkflows(data || []);
    } catch (e) {
      console.error("Error loading workflows", e);
      setWorkflows(workflowsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    checkSessionActive().then((active) => {
      if (active) {
        setIsPasscodeUnlocked(true);
        setIsAdminMode(true);
      }
    });
  }, []);

  // Pre-fill the form with clean, professional template values for fast testing
  const prefillForm = (flow: Workflow | null = null) => {
    if (flow) {
      setSlug(flow.slug);
      setName(flow.name);
      setCategory(flow.category);
      setShortDesc(flow.shortDescription);
      setLongDesc(flow.longDescription);
      setFilePath(flow.filePath);
      setNodesCount(flow.nodesCount);
      setNodeTypes(flow.nodeTypes.join(", "));
      setRequirements(flow.requirements.join("\n"));
      setBeforeProcess(flow.before.process);
      setBeforeBottlenecks(flow.before.bottlenecks.join("\n"));
      setAfterProcess(flow.after.process);
      setAfterBenefits(flow.after.benefits.join("\n"));
      setTimeSaved(flow.impact.timeSaved);
      setEfficiency(flow.impact.efficiency);
      setSpeed(flow.impact.speed);
      setVisualNodesJson(JSON.stringify(flow.visualNodes, null, 2));
      setScreenshot(flow.screenshot || "");
      setMockup(flow.mockup || "");
    } else {
      // Create empty/default mock data
      setSlug("custom-router");
      setName("PostHog Analytics Router");
      setCategory("DATA OPS");
      setShortDesc("Routes production webhooks to PostHog and active data lakes.");
      setLongDesc("Intercepts incoming app event payloads, formats variables, and streams them simultaneously to analytic dashboards with built-in retry parameters.");
      setFilePath("/workflows/custom-router.json");
      setNodesCount(3);
      setNodeTypes("Webhook, Code, HTTP Request");
      setRequirements("PostHog project API key\nAWS IAM bucket permissions");
      setBeforeProcess("Direct tracking calls causing analytics drift and slow script execution.");
      setBeforeBottlenecks("Drift rate of 12%\nNo offline retries\nSlow browser response times");
      setAfterProcess("Asynchronous event router filtering bot requests and formatting parameters.");
      setAfterBenefits("Zero client-side delays\n99.9% event matches\nAutomated bot filters");
      setTimeSaved("12 hours/week for Growth team");
      setEfficiency("99.9% telemetry matches");
      setSpeed("< 10ms processing");
      setVisualNodesJson(JSON.stringify([
        { label: "Webhook", icon: "Globe" },
        { label: "Check Bot", icon: "Gear", isAccent: true },
        { label: "PostHog", icon: "Database" }
      ], null, 2));
      setScreenshot("");
      setMockup("");
    }
  };

  const handleOpenCreateModal = () => {
    setEditingWorkflow(null);
    prefillForm(null);
    setShowAdminModal(true);
  };

  const handleOpenEditModal = (flow: Workflow) => {
    setEditingWorkflow(flow);
    prefillForm(flow);
    setShowAdminModal(true);
  };

  const handleCloseModal = () => {
    setShowAdminModal(false);
    setEditingWorkflow(null);
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyAdminPasscode(passphraseInput);
    if (result.success) {
      setIsPasscodeUnlocked(true);
      setIsAdminMode(true);
    } else {
      alert(result.error || "Invalid passcode.");
    }
  };

  const handleDelete = async (slugToDelete: string) => {
    if (confirm(`Are you sure you want to delete the workflow '${slugToDelete}'?`)) {
      const success = await deleteWorkflow(slugToDelete);
      if (success) {
        alert("Workflow deleted successfully!");
        loadData();
      } else {
        alert("Failed to delete workflow from Neon DB.");
      }
    }
  };

  const handleReset = async () => {
    if (confirm("This will erase all custom entries and restore the database to the 4 default n8n workflows. Proceed?")) {
      const success = await resetDatabaseToDefaults();
      if (success) {
        alert("Database successfully reset to defaults!");
        loadData();
      } else {
        alert("Failed to reset database.");
      }
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        // Pre-fill Name
        if (json.name) setName(json.name);

        // Count nodes
        const nodes = json.nodes || [];
        setNodesCount(nodes.length);

        // Extract unique node types
        const types: string[] = Array.from(new Set(nodes.map((n: any) => {
          const parts = (n.type || "").split(".");
          const rawName = parts[parts.length - 1] || "";
          return rawName.charAt(0).toUpperCase() + rawName.slice(1);
        })));
        setNodeTypes(types.join(", "));

        // Auto generate visual nodes
        const generatedVisuals = types.slice(0, 5).map((t, idx) => {
          let iconName: any = "Gear";
          if (["Webhook", "Globe", "Envelope", "Database", "Slack", "Storefront", "Brain", "Shield"].includes(t)) {
            iconName = t;
          }
          return {
            label: t,
            icon: iconName,
            isAccent: idx === Math.floor(Math.min(types.length, 5) / 2)
          };
        });
        setVisualNodesJson(JSON.stringify(generatedVisuals, null, 2));

        // Generate slugs
        const generatedSlug = (json.name || "imported-workflow")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .trim();
        setSlug(generatedSlug);
        setFilePath(`/workflows/${generatedSlug}.json`);

        alert("Successfully imported & parsed n8n workflow file!");
      } catch (err) {
        alert("Failed to parse JSON file. Please ensure it is a valid n8n export.");
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "screenshot" | "mockup") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Image size is over 1.5MB. Storing large images in Neon DB as Base64 may cause slow rendering. Please compress your screenshot before uploading.");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "screenshot") {
        setScreenshot(reader.result as string);
      } else {
        setMockup(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse visual nodes JSON safely
    let parsedVisualNodes = [];
    try {
      parsedVisualNodes = JSON.parse(visualNodesJson);
    } catch (err) {
      alert("Invalid Visual Nodes JSON format. Using standard placeholder nodes instead.");
      parsedVisualNodes = [
        { label: "Webhook", icon: "Globe" },
        { label: "Custom Node", icon: "Gear", isAccent: true },
        { label: "SaaS Target", icon: "Database" }
      ];
    }

    // Structure form data into Workflow shape
    const flowData: Workflow = {
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""),
      name: name.trim(),
      category,
      shortDescription: shortDesc.trim(),
      longDescription: longDesc.trim(),
      filePath: filePath.trim(),
      nodesCount: Number(nodesCount),
      nodeTypes: nodeTypes.split(",").map(t => t.trim()).filter(Boolean),
      requirements: requirements.split("\n").map(r => r.trim()).filter(Boolean),
      steps: [
        { number: 1, title: "Initialize Request", description: "Accepts dynamic inputs from source endpoints." },
        { number: 2, title: "Data processing", description: "Formats parameters and performs validation checks." },
        { number: 3, title: "API Dispatch", description: "Pushes formatted data to endpoints and handles return packets." }
      ],
      before: {
        process: beforeProcess.trim(),
        bottlenecks: beforeBottlenecks.split("\n").map(b => b.trim()).filter(Boolean)
      },
      after: {
        process: afterProcess.trim(),
        benefits: afterBenefits.split("\n").map(b => b.trim()).filter(Boolean)
      },
      impact: {
        timeSaved: timeSaved.trim(),
        efficiency: efficiency.trim(),
        speed: speed.trim()
      },
      visualNodes: parsedVisualNodes,
      screenshot: screenshot || undefined,
      mockup: mockup || undefined
    };

    let success = false;
    if (editingWorkflow) {
      success = await updateWorkflow(editingWorkflow.slug, flowData);
    } else {
      success = await createWorkflow(flowData);
    }

    if (success) {
      alert(editingWorkflow ? "Workflow updated!" : "Workflow added to Neon DB!");
      setShowAdminModal(false);
      loadData();
    } else {
      alert("Database operation failed. Check that the slug is unique and Neon is reachable.");
    }
  };

  const downloadWorkflowJson = async (flow: Workflow) => {
    try {
      let jsonText = "";
      let fileName = `${flow.slug}.json`;
      let isFallback = false;

      if (flow.filePath && flow.filePath.startsWith("/workflows")) {
        const response = await fetch(flow.filePath);
        if (response.ok) {
          jsonText = await response.text();
          fileName = flow.filePath.split("/").pop() || fileName;
        } else {
          isFallback = true;
        }
      } else {
        isFallback = true;
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

      if (isFallback) {
        showToast("Dynamic mock schema downloaded (Source JSON not configured)", "info");
      } else {
        showToast("Workflow JSON downloaded successfully", "success");
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
      showToast("Failed to download JSON file", "error");
    }
  };

  const filteredWorkflows = workflows.filter((flow) => {
    const matchesSearch = 
      flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.nodeTypes.some(node => node.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === "ALL" || 
      flow.category.toUpperCase() === selectedCategory.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  const categories = ["ALL", "MARKETING", "DATA OPS", "E-COMMERCE", "DEVOPS", "AI / OPS"];

  return (
    <>
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-12 pt-16 pb-24 flex-grow">
        {/* Header Block & Admin Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
          <div className="max-w-[650px]">
            <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-primary mb-3 block">
              Neon DB Blueprint Repository
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-ink-deep leading-none mb-4">
              Discover Automation Patterns.
            </h1>
            <p className="font-sans text-base text-ink-deep/75">
              Browse through my live PostgreSQL-backed collection of n8n workflows designed to remove manual friction and orchestrate systems.
            </p>
          </div>

          {/* Admin Mode Toggle Panel */}
          <div className="bg-white border border-outline-variant/50 rounded-2xl p-4 lg:w-80 shrink-0 self-start">
            {!isPasscodeUnlocked ? (
              <form onSubmit={handlePasscodeSubmit} className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-ink-deep/50" />
                  <span className="font-display text-xs font-bold uppercase text-ink-deep">
                    Enable Database Admin
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="Enter Passphrase"
                  value={passphraseInput}
                  onChange={(e) => setPassphraseInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-canvas-bg/50 border border-outline-variant/30 rounded-lg text-xs focus:outline-none focus:border-accent-lime font-sans"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-ink-deep text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded hover:bg-ink-deep/90 transition-colors"
                >
                  Unlock CRUD Controls
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                  <div className="flex items-center gap-2 text-primary">
                    <LockOpen size={16} />
                    <span className="font-display text-xs font-bold uppercase">
                      Admin Mode Active
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await logoutAdmin();
                      setIsPasscodeUnlocked(false);
                      setIsAdminMode(false);
                      setPassphraseInput("");
                    }}
                    className="text-ink-deep/40 hover:text-ink-deep text-[10px] font-mono uppercase"
                  >
                    Lock
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-1 py-2 bg-accent-lime text-ink-deep border border-ink-deep/10 font-mono text-[9px] font-bold uppercase tracking-wider rounded hover:bg-accent-lime/90 transition-colors"
                  >
                    <Plus size={10} weight="bold" /> Add Custom
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-1 py-2 bg-white text-ink-deep border border-outline font-mono text-[9px] font-bold uppercase tracking-wider rounded hover:bg-surface-muted/50 transition-colors"
                  >
                    <ArrowClockwise size={10} /> Reset Seed
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-12 bg-white p-4 rounded-xl border border-outline-variant/40">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <MagnifyingGlass 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-deep/40" 
            />
            <input
              type="text"
              placeholder="Search workflows, nodes, or tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-canvas-bg/50 border border-outline-variant/30 rounded-lg text-sm text-ink-deep placeholder-ink-deep/40 focus:outline-none focus:border-accent-lime focus:ring-2 focus:ring-accent-lime/20 font-sans transition-all"
            />
          </div>

          {/* Categories Horizontal Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Funnel size={14} className="text-ink-deep/50 hidden lg:block shrink-0 mr-1" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap border transition-all ${
                  selectedCategory === category
                    ? "bg-ink-deep text-accent-lime border-ink-deep"
                    : "bg-canvas-bg/30 text-ink-deep/60 border-outline-variant/30 hover:border-outline hover:text-ink-deep"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter / Loader */}
        <div className="flex items-center justify-between mb-6">
          <div className="font-mono text-xs text-ink-deep/50 uppercase tracking-widest">
            Showing {filteredWorkflows.length} blueprints
          </div>
          {loading && (
            <span className="font-mono text-xs text-primary animate-pulse uppercase tracking-wider">
              Syncing with Neon DB...
            </span>
          )}
        </div>

        {/* Workflow Grid */}
        {filteredWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredWorkflows.map((flow) => (
                <motion.div
                  key={flow.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-outline-variant/50 rounded-2xl p-6 hover:border-accent-lime shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_16px_35px_-15px_rgba(0,0,0,0.03)] transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Admin floating delete/edit overlay */}
                  {isAdminMode && (
                    <div className="absolute top-4 right-4 flex gap-1.5 z-30">
                      <button
                        onClick={() => handleOpenEditModal(flow)}
                        className="p-2 bg-white/95 text-ink-deep hover:bg-accent-lime rounded border border-outline-variant/50 transition-colors shadow-sm"
                        title="Edit Workflow"
                      >
                        <PencilSimple size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(flow.slug)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-colors shadow-sm"
                        title="Delete Workflow"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
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
                    <div className="w-full bg-canvas-bg/40 rounded-xl p-4 border border-outline-variant/20 flex items-center justify-between relative mt-1">
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
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full bg-white border border-outline-variant/40 rounded-2xl py-24 text-center px-6">
            <h3 className="font-display text-lg font-bold text-ink-deep mb-2">
              No Workflows Found
            </h3>
            <p className="font-sans text-sm text-ink-deep/60 max-w-sm mx-auto mb-6">
              Clear filters or reload defaults if you deleted all items in Admin mode.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
              className="px-5 py-2.5 bg-ink-deep text-white font-sans font-semibold text-xs rounded-lg hover:bg-ink-deep/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Admin Creator / Edit Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-deep/50 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-canvas-bg border-2 border-ink-deep rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-outline-variant/40">
              <h3 className="font-display text-lg font-extrabold text-ink-deep">
                {editingWorkflow ? `Edit Workflow: ${slug}` : "Create Custom Workflow in Neon DB"}
              </h3>
              <button onClick={handleCloseModal} className="text-ink-deep/60 hover:text-ink-deep">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex-grow space-y-6">
              {/* JSON Import Section */}
              <div className="bg-white border border-dashed border-outline-variant/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="font-display text-xs font-bold text-ink-deep block">Import from n8n JSON Export</span>
                  <span className="font-sans text-[10px] text-ink-deep/60 block">Select your exported `.json` file to auto-populate the form fields below.</span>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-ink-deep text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded hover:bg-ink-deep/90 transition-colors inline-block text-center shrink-0">
                  Select n8n File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJsonImport}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans"
                    placeholder="E.g., Salesforce Integration Pipeline"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Slug (Primary Key)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingWorkflow}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans disabled:bg-surface-muted/40"
                    placeholder="E.g., salesforce-lead-sync"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Workflow["category"])}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans"
                  >
                    <option value="MARKETING">MARKETING</option>
                    <option value="DATA OPS">DATA OPS</option>
                    <option value="E-COMMERCE">E-COMMERCE</option>
                    <option value="DEVOPS">DEVOPS</option>
                    <option value="AI / OPS">AI / OPS</option>
                  </select>
                </div>

                {/* File Path */}
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    n8n JSON Path
                  </label>
                  <input
                    type="text"
                    required
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-mono text-xs"
                    placeholder="/workflows/custom.json"
                  />
                </div>

                {/* Nodes Count */}
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Nodes Count
                  </label>
                  <input
                    type="number"
                    required
                    value={nodesCount}
                    onChange={(e) => setNodesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans"
                  />
                </div>
              </div>

              {/* Short & Long Description */}
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    required
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans"
                    placeholder="Keep it to 2 lines max in listing view"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Long Case Study Narrative
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={longDesc}
                    onChange={(e) => setLongDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans leading-relaxed"
                    placeholder="Introduce the operational challenge, implementation details, and business context..."
                  />
                </div>
              </div>

              {/* Node Types & Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Node Types (Comma-Separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={nodeTypes}
                    onChange={(e) => setNodeTypes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-mono text-xs"
                    placeholder="Webhook, Clearbit, Salesforce, Slack"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    System Prerequisites (Newline-Separated)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans"
                    placeholder="Salesforce Enterprise access&#10;Clearbit active key"
                  />
                </div>
              </div>

              {/* Before vs After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-outline-variant/30">
                <div className="space-y-3">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-red-500 block">
                    Before (Legacy Friction)
                  </span>
                  <div>
                    <label className="text-[10px] text-ink-deep/60 block mb-0.5">Process Overview</label>
                    <input
                      type="text"
                      required
                      value={beforeProcess}
                      onChange={(e) => setBeforeProcess(e.target.value)}
                      className="w-full px-3 py-1.5 bg-canvas-bg/50 border border-outline-variant/20 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-deep/60 block mb-0.5">Bottlenecks (Newline-Separated)</label>
                    <textarea
                      rows={2}
                      required
                      value={beforeBottlenecks}
                      onChange={(e) => setBeforeBottlenecks(e.target.value)}
                      className="w-full px-3 py-1.5 bg-canvas-bg/50 border border-outline-variant/20 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3 md:border-l md:border-outline-variant/20 md:pl-6">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary block">
                    After (n8n Automated flow)
                  </span>
                  <div>
                    <label className="text-[10px] text-ink-deep/60 block mb-0.5">Process Overview</label>
                    <input
                      type="text"
                      required
                      value={afterProcess}
                      onChange={(e) => setAfterProcess(e.target.value)}
                      className="w-full px-3 py-1.5 bg-canvas-bg/50 border border-outline-variant/20 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-deep/60 block mb-0.5">Benefits (Newline-Separated)</label>
                    <textarea
                      rows={2}
                      required
                      value={afterBenefits}
                      onChange={(e) => setAfterBenefits(e.target.value)}
                      className="w-full px-3 py-1.5 bg-canvas-bg/50 border border-outline-variant/20 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Time Saved Label
                  </label>
                  <input
                    type="text"
                    required
                    value={timeSaved}
                    onChange={(e) => setTimeSaved(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans"
                    placeholder="E.g., 18 hours/week"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Quality Increase Label
                  </label>
                  <input
                    type="text"
                    required
                    value={efficiency}
                    onChange={(e) => setEfficiency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans"
                    placeholder="E.g., 100% data integrity"
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                    Latency/Speed Label
                  </label>
                  <input
                    type="text"
                    required
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-sm focus:outline-none focus:border-accent-lime font-sans"
                    placeholder="E.g., < 2s sync time"
                  />
                </div>
              </div>

              {/* Visual Nodes JSON representation */}
              <div>
                <label className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block mb-1">
                  Visual Nodes Config (JSON Array)
                </label>
                <textarea
                  rows={4}
                  required
                  value={visualNodesJson}
                  onChange={(e) => setVisualNodesJson(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-outline-variant/50 rounded-lg text-xs focus:outline-none focus:border-accent-lime font-mono"
                />
              </div>

              {/* Base64 Image Uploaders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Canvas */}
                <div className="bg-white border border-outline-variant/50 rounded-xl p-4 flex flex-col gap-3">
                  <span className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block">
                    Primary Workflow Canvas
                  </span>
                  {screenshot ? (
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-outline-variant/30 bg-canvas-bg/30">
                      <img src={screenshot} alt="Screenshot Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setScreenshot("")}
                        className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 text-[10px] font-mono uppercase"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 rounded-lg p-6 hover:border-accent-lime cursor-pointer bg-canvas-bg/15 hover:bg-canvas-bg/40 transition-all text-center">
                      <span className="font-sans text-xs font-semibold text-ink-deep">Upload Screenshot</span>
                      <span className="font-sans text-[9px] text-ink-deep/50 mt-1">n8n Canvas PNG/JPG (Max 1.5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "screenshot")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Secondary Mockup */}
                <div className="bg-white border border-outline-variant/50 rounded-xl p-4 flex flex-col gap-3">
                  <span className="font-mono text-[10px] uppercase font-bold text-ink-deep/60 block">
                    Secondary Mockup / App Preview (Optional)
                  </span>
                  {mockup ? (
                    <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-outline-variant/30 bg-canvas-bg/30">
                      <img src={mockup} alt="Mockup Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setMockup("")}
                        className="absolute top-2 right-2 bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700 text-[10px] font-mono uppercase"
                      >
                        Clear
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 rounded-lg p-6 hover:border-accent-lime cursor-pointer bg-canvas-bg/15 hover:bg-canvas-bg/40 transition-all text-center">
                      <span className="font-sans text-xs font-semibold text-ink-deep">Upload App Mockup</span>
                      <span className="font-sans text-[9px] text-ink-deep/50 mt-1">WhatsApp or Result UI (Max 1.5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "mockup")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-outline text-sm font-semibold text-ink-deep rounded-lg hover:bg-canvas-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent-lime text-ink-deep border border-ink-deep/10 text-sm font-bold rounded-lg hover:bg-accent-lime/90 transition-colors"
                >
                  {editingWorkflow ? "Save Changes" : "Create Workflow"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />

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
    </>
  );
}
