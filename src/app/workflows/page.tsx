import React from "react";
import { getWorkflows } from "@/app/actions";
import WorkflowsGalleryClient from "./WorkflowsGalleryClient";

// Revalidate the workflows list cache every 60 seconds (Incremental Static Regeneration)
export const revalidate = 60;

export default async function WorkflowsPage() {
  const initialWorkflows = await getWorkflows();
  return <WorkflowsGalleryClient initialWorkflows={initialWorkflows || []} />;
}
