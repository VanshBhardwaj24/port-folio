export interface WorkflowStep {
  number: number;
  title: string;
  description: string;
}

export interface WorkflowVisualNode {
  label: string;
  icon: "Globe" | "Envelope" | "Database" | "Gear" | "Brain" | "Slack" | "Storefront" | "CheckCircle" | "Salesforce" | "FileText" | "Shield";
  isAccent?: boolean;
}

export interface Workflow {
  slug: string;
  name: string;
  category: "MARKETING" | "DATA OPS" | "E-COMMERCE" | "DEVOPS" | "AI / OPS";
  shortDescription: string;
  longDescription: string;
  filePath: string;
  nodesCount: number;
  nodeTypes: string[];
  requirements: string[];
  steps: WorkflowStep[];
  before: {
    process: string;
    bottlenecks: string[];
  };
  after: {
    process: string;
    benefits: string[];
  };
  impact: {
    timeSaved: string;
    efficiency: string;
    speed: string;
  };
  visualNodes: WorkflowVisualNode[];
  screenshot?: string;
  mockup?: string;
}

export const workflowsData: Workflow[] = [
  {
    slug: "crm-enrichment",
    name: "Automated Lead Sync: Webhook to Salesforce",
    category: "MARKETING",
    shortDescription: "A robust pipeline that captures incoming webhooks from custom landing pages, validates payload structure, enriches data via Clearbit, and upserts the lead directly into Salesforce. Includes error handling and Slack notifications for failed syncs.",
    longDescription: "Manual data entry is the silent killer of sales momentum. When a lead fills out a form, every hour they wait for a sales rep is a 10x drop in conversion rate. This workflow serves as an automated data layer: capturing incoming webhook leads instantly, performing automated validation to filter out spam, looking up enterprise details using Clearbit, and upserting the completed profile to Salesforce CRM. If any API rate limit or validation error occurs, a detailed error traceback is piped to the Slack Dev team for zero-downtime operations.",
    filePath: "/workflows/crm-enrichment.json",
    nodesCount: 5,
    nodeTypes: ["Webhook", "IF Condition", "HTTP Request", "Salesforce", "Slack"],
    requirements: [
      "Salesforce Developer or Enterprise Account with API access enabled.",
      "Clearbit API Key for lead enrichment (optional but recommended).",
      "Slack workspace for error notification routing."
    ],
    steps: [
      {
        number: 1,
        title: "Webhook Trigger",
        description: "Listens for incoming POST requests containing lead data (name, email, company) from your external forms."
      },
      {
        number: 2,
        title: "Data Validation",
        description: "An IF node ensures the payload contains a valid email address structure. Invalid payloads are routed to a Slack alert."
      },
      {
        number: 3,
        title: "Clearbit Enrichment",
        description: "Calls the Clearbit API to fetch company size, industry, revenue, and social links based on the lead's email domain."
      },
      {
        number: 4,
        title: "Upsert Salesforce",
        description: "Upserts a Lead in Salesforce using the email as an external ID. This prevents duplicates and appends the enriched data."
      },
      {
        number: 5,
        title: "Slack Alert fallback",
        description: "If the upsert or enrichment fails, an error alert with full execution metadata is sent to the Slack channel."
      }
    ],
    before: {
      process: "Sales reps manually copy leads from web forms to spreadsheets, cross-reference them with LinkedIn, and manually create Salesforce accounts.",
      bottlenecks: [
        "Average lead response time of 24-48 hours.",
        "High rate of duplicate accounts and typos.",
        "Missing context (company size, sector) for outbound prioritization."
      ]
    },
    after: {
      process: "Instant webhook synchronization, automated enrichment, deduplicated record updates, and error alerts.",
      benefits: [
        "Lead synchronization in less than 2 seconds.",
        "100% data integrity with automated deduplication.",
        "Lead scoring immediately populated for the sales team."
      ]
    },
    impact: {
      timeSaved: "14 hours/week for Sales Ops",
      efficiency: "0% duplicate records",
      speed: "< 2s sync time"
    },
    visualNodes: [
      { label: "Webhook", icon: "Globe" },
      { label: "Verify Email", icon: "CheckCircle" },
      { label: "Clearbit API", icon: "Brain", isAccent: true },
      { label: "Salesforce CRM", icon: "Salesforce" },
      { label: "Slack Dev Alert", icon: "Slack" }
    ]
  },
  {
    slug: "pdf-summary",
    name: "AI Document Research & Enrichment Engine",
    category: "AI / OPS",
    shortDescription: "Upload a document to get an AI-generated summary + enriched insights. Connects OpenAI GPT-4o-mini and Wikipedia search to log findings to Google Sheets for structured research and consulting.",
    longDescription: "Consultants, analysts, and project managers spend hours parsing long research reports, whitepapers, and customer RFPs. This workflow automates document parsing and background research. When a PDF is uploaded, n8n extracts the text content, feeds it to OpenAI to produce a 3-point structured summary, extracts key mentioned organizations, searches Wikipedia for context on those organizations, and logs all compiled research to a Google Sheet database for immediate retrieval.",
    filePath: "/workflows/pdf-summary.json",
    nodesCount: 5,
    nodeTypes: ["Webhook", "Read Binary File", "OpenAI", "Wikipedia", "Google Sheets"],
    requirements: [
      "OpenAI API Key (GPT-4o-mini access).",
      "Google Sheets API credential and target sheet ID.",
      "n8n environment configured to allow binary file uploads."
    ],
    steps: [
      {
        number: 1,
        title: "Document Upload Webhook",
        description: "Accepts binary file uploads (PDF, DOCX) via an authenticated POST endpoint."
      },
      {
        number: 2,
        title: "Binary Extraction",
        description: "Converts raw PDF binary data into clean, searchable, readable UTF-8 text strings."
      },
      {
        number: 3,
        title: "OpenAI GPT-4o-mini Analysis",
        description: "Summarizes the text, identifies key business concepts, and extracts names of mentioned corporations."
      },
      {
        number: 4,
        title: "Wikipedia Verification",
        description: "Performs automated queries on the extracted company names to gather their corporate background."
      },
      {
        number: 5,
        title: "Google Sheets Logging",
        description: "Logs the summary, Wikipedia snippets, timestamps, and document metadata into a shared research sheet."
      }
    ],
    before: {
      process: "Analysts manually read 50-page reports, Google key players, write summary notes, and copy-paste links into a team tracker.",
      bottlenecks: [
        "Takes 45-60 minutes per document.",
        "Knowledge stays siloed in individual emails/notepads.",
        "Delayed research turnaround limits business agility."
      ]
    },
    after: {
      process: "Single-click upload parses, summarizes, verifies, and publishes structured research to a central database.",
      benefits: [
        "Processing time reduced to under 45 seconds.",
        "Centralized, searchable archive of all reviewed briefs.",
        "Automated Wikipedia fact-checking of core entities."
      ]
    },
    impact: {
      timeSaved: "8 hours/week per Analyst",
      efficiency: "98% faster turnaround",
      speed: "< 45s process time"
    },
    visualNodes: [
      { label: "File Webhook", icon: "Envelope" },
      { label: "PDF Parser", icon: "FileText" },
      { label: "OpenAI LLM", icon: "Brain", isAccent: true },
      { label: "Wikipedia API", icon: "Globe" },
      { label: "Google Sheets", icon: "Database" }
    ]
  },
  {
    slug: "db-backup",
    name: "Nightly Database Backup & Cloud S3 Archiver",
    category: "DEVOPS",
    shortDescription: "Runs daily pg_dump utility, compresses the SQL file using GZIP, uploads the archive to AWS S3, and dispatches detailed telemetry to the DevOps Slack alerts channel.",
    longDescription: "Production databases need rock-solid, automated backups that operate with absolute reliability and visibility. Relying on cron scripts running in background VMs is risky if they fail silently. This workflow acts as an active orchestrator. It triggers daily at 2:00 AM, logs into the database container, runs pg_dump, compresses it with high-efficiency GZIP, and streams the binary output to AWS S3. It then checks the upload status: on success, it logs telemetry (file size, timestamp) to Slack; on failure, it triggers an immediate critical incident alert.",
    filePath: "/workflows/db-backup.json",
    nodesCount: 5,
    nodeTypes: ["Schedule Trigger", "Execute Command", "AWS S3", "Slack (Success)", "Slack (Failure)"],
    requirements: [
      "Database credentials and system utilities (pg_dump, gzip installed).",
      "AWS IAM credentials with write access to target S3 bucket.",
      "Slack Webhook integration for dev alerts."
    ],
    steps: [
      {
        number: 1,
        title: "Schedule Cron Trigger",
        description: "Executes automatically every night at 2:00 AM UTC during low-traffic periods."
      },
      {
        number: 2,
        title: "pg_dump Execution",
        description: "Spawns a shell environment to run postgres dump and pipe it into a GZIP compressed file."
      },
      {
        number: 3,
        title: "AWS S3 Stream",
        description: "Uploads the compressed payload to the secure AWS S3 bucket under the dated backup folder."
      },
      {
        number: 4,
        title: "Success Telemetry",
        description: "Calculates file size and posts a green check confirmation to the engineering slack channel."
      },
      {
        number: 5,
        title: "Failure Fallback",
        description: "If any step fails, alerts the DevOps team immediately with error stderr logs to investigate."
      }
    ],
    before: {
      process: "Backups managed by legacy bash crontab scripts. No success reports; engineers only find out backups failed when they need to restore.",
      bottlenecks: [
        "No monitoring or validation of backup success.",
        "Siloed VM configurations that are hard to maintain.",
        "Risk of silent data corruption or drive fill-ups."
      ]
    },
    after: {
      process: "Centralized orchestrator executing system tasks with active notifications and S3 synchronization.",
      benefits: [
        "Real-time visual logging of backup processes.",
        "100% confidence with positive confirmation alerts.",
        "Automatic error triage and logging of script stderr."
      ]
    },
    impact: {
      timeSaved: "Peace of mind & zero manual audits",
      efficiency: "100% backup validation",
      speed: "Daily automated run"
    },
    visualNodes: [
      { label: "Cron 2 AM", icon: "Gear" },
      { label: "SSH Command", icon: "Shield" },
      { label: "GZIP Archive", icon: "FileText" },
      { label: "AWS S3 Bucket", icon: "Database", isAccent: true },
      { label: "Slack Alerts", icon: "Slack" }
    ]
  },
  {
    slug: "shopify-fulfillment",
    name: "Shopify Order Fulfillment Sync & 3PL Integration",
    category: "E-COMMERCE",
    shortDescription: "Synchronizes paid Shopify orders to ShipStation, triggers custom third-party logistics API requests, and updates order tracking status back to the storefront in real-time.",
    longDescription: "For growing e-commerce brands, manual order management represents a major bottleneck. Doing manual imports leads to slow shipping and data errors. This workflow automates the cycle: immediately when a Shopify order is marked as paid, the payload is captured, shipping details are pushed to ShipStation to generate packing slips, a shipping request is made to the third-party logistics (3PL) center, and once the carrier generates the tracking code, it updates Shopify to notify the buyer.",
    filePath: "/workflows/shopify-fulfillment.json",
    nodesCount: 4,
    nodeTypes: ["Shopify Webhook", "ShipStation", "HTTP Request", "Shopify Update"],
    requirements: [
      "Shopify Partner API Access (Webhook configuration permissions).",
      "ShipStation API Credentials.",
      "Custom 3PL API endpoint and authorization headers."
    ],
    steps: [
      {
        number: 1,
        title: "Shopify Paid Webhook",
        description: "Fires instantly when an order payment is captured on the Shopify storefront."
      },
      {
        number: 2,
        title: "ShipStation Order Creation",
        description: "Maps customer address, line items, and product SKUs into a pending ShipStation order."
      },
      {
        number: 3,
        title: "3PL API Dispatch",
        description: "Sends a request to the third-party warehouse logistics API to schedule packing and labeling."
      },
      {
        number: 4,
        title: "Fulfillment Update",
        description: "Takes the generated tracking number and carrier name and updates the order status on Shopify, triggering customer emails."
      }
    ],
    before: {
      process: "Operations team downloads CSVs of orders at 5 PM daily, uploads them to the shipping tool, and manually emails tracking numbers to customers.",
      bottlenecks: [
        "12 to 24-hour delay in shipping label creation.",
        "High shipping errors from manual address copy-pasting.",
        "Heavy customer service inquiries asking 'Where is my order?'"
      ]
    },
    after: {
      process: "Instant webhook-based fulfillment routing with automated label printing and tracking loop updates.",
      benefits: [
        "Label creation completed within 1 minute of payment.",
        "Fulfillment errors reduced to zero.",
        "Customer tracking emails dispatched automatically in real-time."
      ]
    },
    impact: {
      timeSaved: "18 hours/week for Logistics team",
      efficiency: "99.9% fulfillment accuracy",
      speed: "Immediate (< 60s) routing"
    },
    visualNodes: [
      { label: "Shopify Shop", icon: "Storefront" },
      { label: "ShipStation", icon: "FileText" },
      { label: "3PL API Call", icon: "Gear", isAccent: true },
      { label: "Tracking Sync", icon: "CheckCircle" }
    ]
  }
];
