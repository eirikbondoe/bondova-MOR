#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
const { Client } = require("@notionhq/client");

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

// Logging utility
const log = {
  debug: (...args) => LOG_LEVEL === "debug" && console.log("[DEBUG]", ...args),
  info: (...args) => console.log("[INFO]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

/**
 * Validate environment configuration
 */
function validateConfig() {
  const required = ["SUPABASE_URL", "SUPABASE_KEY", "NOTION_TOKEN"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    log.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  log.info("✓ Configuration validated");
}

/**
 * Parse table mappings from environment variables
 * Returns array of { supabaseTable, notionDatabaseId, name }
 */
function getTableMappings() {
  const mappings = [];
  const tablePattern = /^SUPABASE_TABLE_(.+)$/;
  const databasePattern = /^NOTION_DATABASE_(.+)$/;

  const tables = {};
  const databases = {};

  // Collect all table mappings
  Object.entries(process.env).forEach(([key, value]) => {
    const tableMatch = key.match(tablePattern);
    const dbMatch = key.match(databasePattern);

    if (tableMatch) {
      const name = tableMatch[1];
      tables[name] = value;
    }

    if (dbMatch) {
      const name = dbMatch[1];
      databases[name] = value;
    }
  });

  // Match tables with databases
  Object.entries(tables).forEach(([name, supabaseTable]) => {
    if (databases[name]) {
      mappings.push({
        name,
        supabaseTable,
        notionDatabaseId: databases[name],
      });
    } else {
      log.warn(`No NOTION_DATABASE_${name} found for SUPABASE_TABLE_${name}`);
    }
  });

  if (mappings.length === 0) {
    log.warn("No table mappings configured");
  }

  return mappings;
}

/**
 * Sync a single Supabase table to a Notion database
 */
async function syncTableToNotion(supabase, notion, mapping) {
  const { name, supabaseTable, notionDatabaseId } = mapping;

  try {
    log.info(`Syncing ${supabaseTable} to Notion database...`);

    // Fetch data from Supabase
    const { data, error } = await supabase.from(supabaseTable).select("*");

    if (error) {
      log.error(`Failed to fetch from ${supabaseTable}:`, error.message);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      log.info(`No data found in ${supabaseTable}`);
      return { success: true, rowsProcessed: 0 };
    }

    log.info(`Fetched ${data.length} rows from ${supabaseTable}`);

    // Get existing pages in Notion database
    const existingPages = await notion.databases.query({
      database_id: notionDatabaseId,
    });

    log.debug(
      `Found ${existingPages.results.length} existing pages in Notion`
    );

    // Process each row
    let created = 0;
    let updated = 0;

    for (const row of data) {
      // For MVP, we'll do a simple sync:
      // - Match by a unique ID field (assumes 'id' exists)
      // - Create new or update existing entries
      const id = row.id || row.uuid || row.ID;

      if (!id) {
        log.warn(`Row missing ID field, skipping:`, row);
        continue;
      }

      // Check if page exists
      const existingPage = existingPages.results.find((page) => {
        const pageId = page.properties.ID?.rich_text?.[0]?.plain_text;
        return pageId === String(id);
      });

      const properties = buildNotionProperties(row);

      if (existingPage) {
        // Update existing page
        await notion.pages.update({
          page_id: existingPage.id,
          properties,
        });
        updated++;
      } else {
        // Create new page
        await notion.pages.create({
          parent: { database_id: notionDatabaseId },
          properties,
        });
        created++;
      }
    }

    log.info(
      `✓ Sync complete: ${created} created, ${updated} updated for ${supabaseTable}`
    );

    return {
      success: true,
      rowsProcessed: data.length,
      created,
      updated,
    };
  } catch (err) {
    log.error(`Error syncing ${supabaseTable}:`, err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Build Notion properties from a Supabase row
 * Converts row data to Notion property format
 */
function buildNotionProperties(row) {
  const properties = {};

  Object.entries(row).forEach(([key, value]) => {
    // Skip null/undefined values
    if (value === null || value === undefined) {
      return;
    }

    const notionKey = key.toUpperCase().replace(/_/g, " ");

    // Determine property type and format value
    if (typeof value === "string") {
      properties[notionKey] = {
        rich_text: [
          {
            text: { content: value.substring(0, 2000) }, // Notion limit
          },
        ],
      };
    } else if (typeof value === "number") {
      properties[notionKey] = {
        number: value,
      };
    } else if (typeof value === "boolean") {
      properties[notionKey] = {
        checkbox: value,
      };
    } else if (value instanceof Date) {
      properties[notionKey] = {
        date: {
          start: value.toISOString().split("T")[0],
        },
      };
    } else {
      // Default to text for other types
      properties[notionKey] = {
        rich_text: [
          {
            text: {
              content: String(value).substring(0, 2000),
            },
          },
        ],
      };
    }
  });

  return properties;
}

/**
 * Main sync function
 */
async function main() {
  log.info("Starting Supabase-to-Notion sync...");

  try {
    // Validate configuration
    validateConfig();

    // Initialize clients
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const notion = new Client({ auth: NOTION_TOKEN });

    log.info("✓ Clients initialized");

    // Get table mappings
    const mappings = getTableMappings();

    if (mappings.length === 0) {
      log.warn("No mappings configured, nothing to sync");
      process.exit(0);
    }

    // Sync each table
    const results = [];
    for (const mapping of mappings) {
      const result = await syncTableToNotion(supabase, notion, mapping);
      results.push({ mapping: mapping.name, ...result });
    }

    // Summary
    log.info("\n=== Sync Summary ===");
    results.forEach((result) => {
      if (result.success) {
        log.info(`${result.mapping}: ✓ (${result.rowsProcessed} rows)`);
      } else {
        log.error(`${result.mapping}: ✗ (${result.error})`);
      }
    });

    const allSuccess = results.every((r) => r.success);
    log.info("\n✓ Sync complete");
    process.exit(allSuccess ? 0 : 1);
  } catch (err) {
    log.error("Fatal error:", err.message);
    process.exit(1);
  }
}

// Run
main().catch((err) => {
  log.error("Unhandled error:", err);
  process.exit(1);
});
