"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  PaperPlaneRight, 
  Cpu, 
  Sparkle,
  ArrowRight,
  Chats,
  Circle,
  Warning,
  Paperclip
} from "@phosphor-icons/react";
import { Workflow } from "@/components/workflows";
import { askWorkflowAgent } from "@/app/actions";
import WorkflowIcon from "@/components/WorkflowIcon";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatClientProps {
  workflow: Workflow;
}

export default function ChatClient({ workflow }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: `Hello! I am your AI Solutions Architect. I have analyzed the blueprint schema for **"${workflow.name}"**.\n\nAsk me anything about its node configuration, integrations, prerequisites, code snippets, or how to adapt it to your company's stack.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Explain the business impact of this workflow.",
    "What credentials/APIs do I need to configure?",
    "Could you write a Javascript snippet to customize this?",
    "How does error handling work in this pipeline?"
  ];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Map history to server action structure
      const response = await askWorkflowAgent(workflow.slug, updatedMessages);
      
      if (response.error) {
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            content: `⚠️ Error: ${response.error}`
          }
        ]);
      } else if (response.text) {
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            content: response.text
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "model",
          content: "⚠️ Connection error. Please make sure the server is online and the Gemini API key is correct."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto w-full px-6 md:px-12 pt-8 pb-16 flex-grow flex flex-col lg:flex-row gap-8 items-stretch min-h-[calc(100vh-200px)]">
      
      {/* Left Sidebar: Context and Node Pipeline Overview */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        {/* Back Link */}
        <Link
          href={`/cases/${workflow.slug}`}
          className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-deep/60 hover:text-primary transition-colors"
        >
          <ArrowLeft size={12} weight="bold" />
          Back to Case Study
        </Link>

        {/* Workflow Card Info */}
        <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-surface-muted rounded text-ink-deep/80">
              {workflow.category}
            </span>
          </div>

          <h2 className="font-display text-lg font-bold text-ink-deep">
            {workflow.name}
          </h2>

          <p className="font-sans text-xs text-ink-deep/75 leading-relaxed">
            {workflow.shortDescription}
          </p>

          <div className="border-t border-outline-variant/35 pt-4 mt-2">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-deep/50 mb-3">
              Blueprint Node Sequence
            </h3>
            
            <div className="space-y-3">
              {workflow.visualNodes.map((node, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-canvas-bg/35 rounded-lg p-2 border border-outline-variant/20">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-ink-deep bg-white ${
                    node.isAccent ? "border-accent-lime shadow-sm" : "border-outline-variant/50"
                  }`}>
                    <WorkflowIcon name={node.icon} size={16} />
                  </div>
                  <div>
                    <span className="font-sans text-xs font-semibold text-ink-deep block leading-tight">{node.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col bg-white border border-outline-variant/50 rounded-2xl overflow-hidden shadow-sm h-[650px] lg:h-[720px]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-outline-variant/35 bg-surface-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-lime text-ink-deep flex items-center justify-center border border-ink-deep/10">
              <Cpu size={20} weight="fill" className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-ink-deep flex items-center gap-2">
                n8n AI Architect Agent
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27C93F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#27C93F]"></span>
                </span>
              </h3>
              <span className="font-mono text-[10px] text-ink-deep/45 uppercase tracking-widest">Active Session</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-ink-deep/50 bg-white border border-outline-variant/45 px-2.5 py-1 rounded-md">
            <Sparkle size={12} className="text-primary animate-spin" />
            GEMINI FLASH 1.5
          </div>
        </div>

        {/* Message Logs */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-canvas-bg/15 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isAi = msg.role === "model";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isAi ? "justify-start" : "justify-end"} items-start gap-3`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-lg bg-ink-deep text-accent-lime flex items-center justify-center shrink-0 border border-outline-variant/30 text-xs">
                      <Cpu size={14} weight="bold" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm font-sans ${
                      isAi
                        ? "bg-white border border-outline-variant/50 text-ink-deep"
                        : "bg-ink-deep text-white"
                    }`}
                  >
                    {/* Render formatting safely */}
                    <div className="whitespace-pre-wrap select-text selection:bg-accent-lime selection:text-ink-deep">
                      {msg.content.split("\n").map((paragraph, pIdx) => {
                        // Minimal codeblock renderer
                        if (paragraph.startsWith("```")) {
                          return null;
                        }
                        
                        // Bold parsing
                        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
                            {parts.map((part, ptIdx) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                return (
                                  <strong key={ptIdx} className="font-bold text-primary">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-ink-deep text-accent-lime flex items-center justify-center shrink-0 border border-outline-variant/30 text-xs">
                <Cpu size={14} weight="bold" />
              </div>
              <div className="bg-white border border-outline-variant/50 rounded-2xl px-5 py-3.5 flex items-center gap-1.5 shadow-sm">
                <Circle size={6} weight="fill" className="text-primary animate-bounce delay-75" />
                <Circle size={6} weight="fill" className="text-primary animate-bounce delay-150" />
                <Circle size={6} weight="fill" className="text-primary animate-bounce delay-300" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="px-6 py-3 bg-canvas-bg/30 border-t border-outline-variant/20 flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="font-sans text-xs bg-white text-ink-deep hover:bg-accent-lime/10 hover:border-accent-lime/40 border border-outline-variant/60 rounded-full px-3 py-1.5 transition-all text-left shadow-sm shrink-0"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Area */}
        <div className="p-4 border-t border-outline-variant/35 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-3 bg-canvas-bg/30 border border-outline-variant/40 rounded-xl px-4 py-2 hover:border-outline-variant focus-within:border-accent-lime transition-colors"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a technical configuration question..."
              disabled={loading}
              className="flex-grow bg-transparent text-sm text-ink-deep outline-none border-none placeholder-ink-deep/40 font-sans"
            />
            
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-ink-deep text-white hover:bg-ink-deep/90 active:scale-95 disabled:opacity-30 disabled:scale-100 rounded-lg transition-all"
            >
              <PaperPlaneRight size={16} weight="fill" />
            </button>
          </form>
        </div>
      </div>

    </main>
  );
}
