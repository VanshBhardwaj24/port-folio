import React from "react";
import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { workflowsData } from "@/components/workflows";
import { getWorkflowBySlug } from "@/app/actions";
import CaseStudyClient from "./CaseStudyClient";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return workflowsData.map((flow) => ({
    slug: flow.slug,
  }));
}

export const dynamicParams = true;

// Call Gemini API to get a professional summary
async function getAiSummary(workflow: any, jsonContent: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "";
  }

  try {
    const prompt = `You are an expert automation solutions architect. Provide a brief, professional 2-sentence AI summary of the following n8n automation workflow, highlighting its operational business impact. Do not include markdown formatting, bold tags, or quotes.
    
    Workflow Name: ${workflow.name}
    Description: ${workflow.longDescription}
    Nodes Used: ${workflow.nodeTypes ? workflow.nodeTypes.join(", ") : ""}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim();
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
  }

  return "";
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  console.log(">>> CaseStudyPage called with slug:", slug);
  
  const workflow = await getWorkflowBySlug(slug);
  console.log(">>> Resolved workflow from getWorkflowBySlug:", slug, "Found:", !!workflow);

  if (!workflow) {
    console.log(">>> Workflow not found, rendering notFound()");
    notFound();
  }

  let jsonContent = "";
  let cleanFilePath = workflow.filePath;

  // Clean lead/trailing slashes on Windows to prevent absolute path confusion in path.join
  if (cleanFilePath && (cleanFilePath.startsWith("/") || cleanFilePath.startsWith("\\"))) {
    cleanFilePath = cleanFilePath.substring(1);
  }

  if (cleanFilePath) {
    try {
      const filePath = path.join(process.cwd(), "public", cleanFilePath);
      jsonContent = await fs.readFile(filePath, "utf-8");
    } catch (err) {
      console.error(`Error reading n8n json at: ${cleanFilePath}`, err);
    }
  }

  const isCustomWorkflow = !jsonContent;

  if (isCustomWorkflow) {
    jsonContent = JSON.stringify({
      name: workflow.name,
      description: workflow.shortDescription,
      nodesCount: workflow.nodesCount,
      nodeTypes: workflow.nodeTypes,
      requirements: workflow.requirements,
      info: "Custom user-generated n8n schema. Create public file to display detailed code triggers."
    }, null, 2);
  }

  // Get AI summary
  const aiSummary = await getAiSummary(workflow, jsonContent);

  return (
    <>
      <Header />
      <CaseStudyClient 
        workflow={workflow} 
        jsonContent={jsonContent} 
        isCustomWorkflow={isCustomWorkflow} 
        aiSummary={aiSummary}
      />
      <Footer />
    </>
  );
}
