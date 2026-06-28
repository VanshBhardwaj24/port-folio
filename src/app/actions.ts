"use server";

import { neon } from "@neondatabase/serverless";
import { Workflow, workflowsData } from "@/components/workflows";

// Initialize Neon Client
const getDb = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }
  return neon(dbUrl);
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

/**
 * Fetch all workflows from Neon
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    await initDatabase();
    const sql = getDb();
    const rows = await sql`SELECT * FROM workflows ORDER BY created_at ASC`;
    return rows.map(mapRowToWorkflow);
  } catch (error) {
    console.error("Failed to fetch workflows from database, falling back to static data:", error);
    return workflowsData;
  }
}

/**
 * Fetch single workflow by slug
 */
export async function getWorkflowBySlug(slug: string): Promise<Workflow | null> {
  try {
    await initDatabase();
    const sql = getDb();
    const rows = await sql`SELECT * FROM workflows WHERE slug = ${slug} LIMIT 1`;
    if (rows.length === 0) return null;
    return mapRowToWorkflow(rows[0]);
  } catch (error) {
    console.error(`Failed to fetch workflow ${slug} from DB:`, error);
    // Fallback to static
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
    return true;
  } catch (error) {
    console.error("Failed to reset database:", error);
    return false;
  }
}
