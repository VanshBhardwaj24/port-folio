import React from "react";
import { getWorkflows } from "@/app/actions";
import HomeClient from "./HomeClient";

// Revalidate the homepage cache every 60 seconds (Incremental Static Regeneration)
export const revalidate = 60;

export default async function Home() {
  const initialWorkflows = await getWorkflows();
  return <HomeClient initialWorkflows={initialWorkflows || []} />;
}
