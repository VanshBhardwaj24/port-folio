"use server";

import { neon } from "@neondatabase/serverless";
import { Workflow, workflowsData } from "@/components/workflows";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

// Initialize Neon Client with Singleton Pattern
let sqlInstance: any = null;

const getDb = () => {
  if (sqlInstance) return sqlInstance;
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }
  sqlInstance = neon(dbUrl);
  return sqlInstance;
};

// Map Database Row back to typescript Workflow model
function mapRowToWorkflow(row: any): Workflow {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    filePath: row.file_path,
    nodesCount: Number(row.nodes_count),
    nodeTypes: JSON.parse(row.node_types),
    requirements: JSON.parse(row.requirements),
    steps: JSON.parse(row.steps),
    before: JSON.parse(row.before),
    after: JSON.parse(row.after),
    impact: JSON.parse(row.impact),
    visualNodes: JSON.parse(row.visual_nodes),
    screenshot: row.screenshot || undefined,
    mockup: row.mockup || undefined
  };
}

/**
 * Self-healing DB initializer.
 * Creates workflows table and seeds it if it is empty.
 */
export async function initDatabase() {
  try {
    const sql = getDb();

    // Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS workflows (
        slug TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        short_description TEXT NOT NULL,
        long_description TEXT NOT NULL,
        file_path TEXT NOT NULL,
        nodes_count INTEGER NOT NULL,
        node_types TEXT NOT NULL,
        requirements TEXT NOT NULL,
        steps TEXT NOT NULL,
        before TEXT NOT NULL,
        after TEXT NOT NULL,
        impact TEXT NOT NULL,
        visual_nodes TEXT NOT NULL,
        screenshot TEXT,
        mockup TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Alter table to add screenshot and mockup columns if they don't exist
    await sql`ALTER TABLE workflows ADD COLUMN IF NOT EXISTS screenshot TEXT`;
    await sql`ALTER TABLE workflows ADD COLUMN IF NOT EXISTS mockup TEXT`;

    // Check count
    const result = await sql`SELECT COUNT(*) as count FROM workflows`;
    const count = Number(result[0]?.count || 0);

    if (count === 0) {
      console.log("Database table 'workflows' is empty. Seeding defaults...");
      // Seed default workflows from static workflowsData
      for (const flow of workflowsData) {
        await sql`
          INSERT INTO workflows (
            slug, name, category, short_description, long_description, 
            file_path, nodes_count, node_types, requirements, steps, 
            before, after, impact, visual_nodes
          ) VALUES (
            ${flow.slug}, 
            ${flow.name}, 
            ${flow.category}, 
            ${flow.shortDescription}, 
            ${flow.longDescription}, 
            ${flow.filePath}, 
            ${flow.nodesCount}, 
            ${JSON.stringify(flow.nodeTypes)}, 
            ${JSON.stringify(flow.requirements)}, 
            ${JSON.stringify(flow.steps)}, 
            ${JSON.stringify(flow.before)}, 
            ${JSON.stringify(flow.after)}, 
            ${JSON.stringify(flow.impact)}, 
            ${JSON.stringify(flow.visualNodes)}
          )
        `;
      }
      console.log("Successfully seeded workflows.");
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

// Server-side process-lifetime memory cache to solve the 2MB data cache limit for Base64 screenshots
interface MemoryCache {
  workflows: Workflow[] | null;
  workflowBySlug: Map<string, Workflow>;
}

const memoryCache: MemoryCache = {
  workflows: null,
  workflowBySlug: new Map()
};

function clearMemoryCache() {
  memoryCache.workflows = null;
  memoryCache.workflowBySlug.clear();
}

/**
 * Fetch all workflows from Neon (with fast server memory cache)
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    if (memoryCache.workflows) {
      return memoryCache.workflows;
    }
    const sql = getDb();
    const rows = await sql`SELECT * FROM workflows ORDER BY created_at ASC`;
    const list = rows.map(mapRowToWorkflow);
    memoryCache.workflows = list;
    return list.length === 0 ? workflowsData : list;
  } catch (error: any) {
    if (error?.message?.includes("relation \"workflows\" does not exist") || error?.message?.includes("does not exist")) {
      console.log("Workflows table does not exist, self-healing initialization starting...");
      await initDatabase();
      try {
        const sql = getDb();
        const rows = await sql`SELECT * FROM workflows ORDER BY created_at ASC`;
        const list = rows.map(mapRowToWorkflow);
        memoryCache.workflows = list;
        return list.length === 0 ? workflowsData : list;
      } catch (retryError) {
        console.error("Failed to fetch workflows after initialization:", retryError);
        return workflowsData;
      }
    }
    console.error("Failed to fetch workflows from database, falling back to static data:", error);
    return workflowsData;
  }
}

/**
 * Fetch single workflow by slug (with fast server memory cache)
 */
export async function getWorkflowBySlug(slug: string): Promise<Workflow | null> {
  try {
    if (memoryCache.workflowBySlug.has(slug)) {
      return memoryCache.workflowBySlug.get(slug) || null;
    }
    const sql = getDb();
    const rows = await sql`SELECT * FROM workflows WHERE slug = ${slug} LIMIT 1`;
    if (rows.length === 0) {
      const staticFlow = workflowsData.find(f => f.slug === slug) || null;
      if (staticFlow) {
        memoryCache.workflowBySlug.set(slug, staticFlow);
      }
      return staticFlow;
    }
    const flow = mapRowToWorkflow(rows[0]);
    memoryCache.workflowBySlug.set(slug, flow);
    return flow;
  } catch (error: any) {
    if (error?.message?.includes("relation \"workflows\" does not exist") || error?.message?.includes("does not exist")) {
      console.log("Workflows table does not exist, self-healing initialization starting for single slug...");
      await initDatabase();
      try {
        const sql = getDb();
        const rows = await sql`SELECT * FROM workflows WHERE slug = ${slug} LIMIT 1`;
        if (rows.length === 0) {
          return workflowsData.find(f => f.slug === slug) || null;
        }
        const flow = mapRowToWorkflow(rows[0]);
        memoryCache.workflowBySlug.set(slug, flow);
        return flow;
      } catch (retryError) {
        console.error("Failed to fetch workflow after initialization:", retryError);
        return workflowsData.find(f => f.slug === slug) || null;
      }
    }
    console.error(`Failed to fetch workflow ${slug} from DB:`, error);
    return workflowsData.find(f => f.slug === slug) || null;
  }
}

/**
 * Create a new workflow (INSERT)
 */
export async function createWorkflow(flow: Workflow): Promise<boolean> {
  try {
    await initDatabase();
    const sql = getDb();
    await sql`
      INSERT INTO workflows (
        slug, name, category, short_description, long_description, 
        file_path, nodes_count, node_types, requirements, steps, 
        before, after, impact, visual_nodes, screenshot, mockup
      ) VALUES (
        ${flow.slug}, 
        ${flow.name}, 
        ${flow.category}, 
        ${flow.shortDescription}, 
        ${flow.longDescription}, 
        ${flow.filePath}, 
        ${flow.nodesCount}, 
        ${JSON.stringify(flow.nodeTypes)}, 
        ${JSON.stringify(flow.requirements)}, 
        ${JSON.stringify(flow.steps)}, 
        ${JSON.stringify(flow.before)}, 
        ${JSON.stringify(flow.after)}, 
        ${JSON.stringify(flow.impact)}, 
        ${JSON.stringify(flow.visualNodes)},
        ${flow.screenshot || null},
        ${flow.mockup || null}
      )
    `;
    clearMemoryCache();
    revalidatePath("/");
    revalidatePath("/workflows");
    return true;
  } catch (error) {
    console.error("Failed to insert workflow in database:", error);
    return false;
  }
}

/**
 * Update an existing workflow (UPDATE)
 */
export async function updateWorkflow(slug: string, flow: Workflow): Promise<boolean> {
  try {
    await initDatabase();
    const sql = getDb();
    await sql`
      UPDATE workflows SET
        name = ${flow.name},
        category = ${flow.category},
        short_description = ${flow.shortDescription},
        long_description = ${flow.longDescription},
        file_path = ${flow.filePath},
        nodes_count = ${flow.nodesCount},
        node_types = ${JSON.stringify(flow.nodeTypes)},
        requirements = ${JSON.stringify(flow.requirements)},
        steps = ${JSON.stringify(flow.steps)},
        before = ${JSON.stringify(flow.before)},
        after = ${JSON.stringify(flow.after)},
        impact = ${JSON.stringify(flow.impact)},
        visual_nodes = ${JSON.stringify(flow.visualNodes)},
        screenshot = ${flow.screenshot || null},
        mockup = ${flow.mockup || null}
      WHERE slug = ${slug}
    `;
    clearMemoryCache();
    revalidatePath("/");
    revalidatePath("/workflows");
    return true;
  } catch (error) {
    console.error(`Failed to update workflow ${slug}:`, error);
    return false;
  }
}

/**
 * Delete a workflow (DELETE)
 */
export async function deleteWorkflow(slug: string): Promise<boolean> {
  try {
    await initDatabase();
    const sql = getDb();
    await sql`DELETE FROM workflows WHERE slug = ${slug}`;
    clearMemoryCache();
    revalidatePath("/");
    revalidatePath("/workflows");
    return true;
  } catch (error) {
    console.error(`Failed to delete workflow ${slug}:`, error);
    return false;
  }
}

/**
 * Resets the database to defaults
 */
export async function resetDatabaseToDefaults(): Promise<boolean> {
  try {
    const sql = getDb();
    await sql`DROP TABLE IF EXISTS workflows`;
    await initDatabase();
    clearMemoryCache();
    revalidatePath("/");
    revalidatePath("/workflows");
    return true;
  } catch (error) {
    console.error("Failed to reset database:", error);
    return false;
  }
}

/**
 * Ask the AI agent about the workflow context
 */
export async function askWorkflowAgent(slug: string, messages: { role: "user" | "model"; content: string }[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment." };
  }

  const workflow = await getWorkflowBySlug(slug);
  if (!workflow) {
    return { error: "Workflow not found." };
  }

  // Load static file content if available
  let fileContent = "";
  if (workflow.filePath) {
    try {
      let cleanFilePath = workflow.filePath;
      if (cleanFilePath.startsWith("/") || cleanFilePath.startsWith("\\")) {
        cleanFilePath = cleanFilePath.substring(1);
      }
      const filePath = path.join(process.cwd(), "public", cleanFilePath);
      fileContent = await fs.readFile(filePath, "utf-8");
    } catch (e) {
      console.warn("Could not read file for chat agent context", e);
    }
  }

  const systemPrompt = `You are a Senior n8n Solutions Architect and Automation Engineer.
You are helping a client understand and customize the following n8n workflow.

Workflow Name: ${workflow.name}
Category: ${workflow.category}
Description: ${workflow.longDescription}
Nodes Used: ${workflow.nodeTypes.join(", ")}
Requirements: ${workflow.requirements.join(", ")}
JSON Configuration Details:
${fileContent || "Custom DB Workflow with standard n8n node connectivity."}

Provide highly specific, technical, and actionable answers. If the client asks how to configure nodes, explain the parameters clearly. If they ask for JavaScript code for a Code node, provide clean, optimized code blocks. Speak with authority, but keep responses digestible. Do not mention HTML tags.`;

  try {
    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      ...messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return { text };
      }
    }
    
    const errorData = await response.text();
    console.error("Gemini API call failed:", errorData);
    return { error: "Failed to generate AI response. Please check logs." };
  } catch (error: any) {
    console.error("Error in askWorkflowAgent:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}
