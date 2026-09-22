const { createClient } = require("@supabase/supabase-js");
const { Client } = require("@notionhq/client");
require("dotenv").config();

const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_TABLE",
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID",
];

function requireEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function buildNotionFilter(propertyName, propertyType, value) {
  if (propertyType === "title") {
    return { property: propertyName, title: { equals: value } };
  }

  return { property: propertyName, rich_text: { equals: value } };
}

function buildKeyProperty(propertyName, propertyType, value) {
  if (propertyType === "title") {
    return {
      [propertyName]: {
        title: [{ text: { content: value } }],
      },
    };
  }

  return {
    [propertyName]: {
      rich_text: [{ text: { content: value } }],
    },
  };
}

function buildPayloadProperty(propertyName, row) {
  const payload = JSON.stringify(row);
  const chunkSize = 1900;
  const chunkCount = Math.ceil(payload.length / chunkSize);

  if (chunkCount > 100) {
    throw new Error(
      "Serialized payload is too large for a single Notion rich_text property. Narrow SUPABASE_SELECT or row size."
    );
  }

  const richText = [];
  for (let i = 0; i < payload.length; i += chunkSize) {
    richText.push({ text: { content: payload.slice(i, i + chunkSize) } });
  }

  return {
    [propertyName]: {
      rich_text: richText,
    },
  };
}

async function fetchSupabaseRows(supabase, table, selectClause) {
  const pageSize = 1000;
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select(selectClause)
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function findExistingPage(notion, databaseId, keyProperty, keyPropertyType, keyValue) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: buildNotionFilter(keyProperty, keyPropertyType, keyValue),
    page_size: 1,
  });

  return response.results[0]?.id;
}

async function syncRow(notion, config, row) {
  const rowId = row[config.supabaseIdColumn];
  if (rowId === undefined || rowId === null) return "skipped";

  const rowIdValue = String(rowId);
  const keyProperty = buildKeyProperty(config.notionKeyProperty, config.notionKeyPropertyType, rowIdValue);
  const payloadProperty = buildPayloadProperty(config.notionPayloadProperty, row);
  const properties = { ...keyProperty, ...payloadProperty };

  const existingPageId = await findExistingPage(
    notion,
    config.notionDatabaseId,
    config.notionKeyProperty,
    config.notionKeyPropertyType,
    rowIdValue
  );

  if (existingPageId) {
    await notion.pages.update({
      page_id: existingPageId,
      properties,
    });
    return "updated";
  }

  await notion.pages.create({
    parent: { database_id: config.notionDatabaseId },
    properties,
  });
  return "created";
}

async function main() {
  requireEnv();

  const config = {
    supabaseTable: process.env.SUPABASE_TABLE,
    supabaseSelect: process.env.SUPABASE_SELECT || "*",
    supabaseIdColumn: process.env.SUPABASE_ID_COLUMN || "id",
    notionDatabaseId: process.env.NOTION_DATABASE_ID,
    notionKeyProperty: process.env.NOTION_KEY_PROPERTY || "Supabase ID",
    notionKeyPropertyType: process.env.NOTION_KEY_PROPERTY_TYPE || "rich_text",
    notionPayloadProperty: process.env.NOTION_PAYLOAD_PROPERTY || "Payload",
  };

  if (!["title", "rich_text"].includes(config.notionKeyPropertyType)) {
    throw new Error("NOTION_KEY_PROPERTY_TYPE must be either 'title' or 'rich_text'");
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  const rows = await fetchSupabaseRows(supabase, config.supabaseTable, config.supabaseSelect);
  console.log(`Found ${rows.length} row(s) in Supabase table ${config.supabaseTable}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const result = await syncRow(notion, config, row);
    if (result === "created") created += 1;
    else if (result === "updated") updated += 1;
    else skipped += 1;
  }

  console.log(`Sync complete. created=${created}, updated=${updated}, skipped=${skipped}`);
}

main().catch((error) => {
  console.error("Sync failed:", error.message);
  process.exit(1);
});
