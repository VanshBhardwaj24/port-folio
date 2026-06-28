import React from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getWorkflowBySlug } from "@/app/actions";
import ChatClient from "./ChatClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function WorkflowChatPage({ params }: PageProps) {
  const { slug } = await params;
  const workflow = await getWorkflowBySlug(slug);

  if (!workflow) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas-bg">
      <Header />
      <ChatClient workflow={workflow} />
      <Footer />
    </div>
  );
}
