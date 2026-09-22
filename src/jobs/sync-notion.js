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

function buildNotionFilter(propertyName, propertyType) {
  if (propertyType === "title") {
    return { property: propertyName, title: { is_not_empty: true } };
  }

  return { property: propertyName, rich_text: { is_not_empty: true } };
}

function getPlainText(propertyName, propertyType, page) {
  const property = page?.properties?.[propertyName];
  if (!property) return "";

  if (propertyType === "title") {
    return (property.title || []).map((entry) => entry?.plain_text || "").join("");
  }

  return (property.rich_text || []).map((entry) => entry?.plain_text || "").join("");
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
  const maxChunkBytes = 1800;
  const richText = [];
  let currentChunk = "";

  for (const char of payload) {
    const candidate = currentChunk + char;
    if (Buffer.byteLength(candidate, "utf8") <= maxChunkBytes) {
      currentChunk = candidate;
    } else {
      if (currentChunk) richText.push({ text: { content: currentChunk } });
      currentChunk = char;
    }

    async function getNotionDatabase(notion, databaseId) {
      return notion.databases.retrieve({ database_id: databaseId });
    }

    function validateNotionProperties(database, config) {
      const keyProperty = database.properties?.[config.notionKeyProperty];
      if (!keyProperty) {
        throw new Error(`Notion key property '${config.notionKeyProperty}' does not exist in database`);
      }

      if (keyProperty.type !== config.notionKeyPropertyType) {
        throw new Error(
          `Notion key property '${config.notionKeyProperty}' must be type '${config.notionKeyPropertyType}', found '${keyProperty.type}'`
        );
      }

      const payloadProperty = database.properties?.[config.notionPayloadProperty];
      if (!payloadProperty) {
        throw new Error(`Notion payload property '${config.notionPayloadProperty}' does not exist in database`);
      }

      if (payloadProperty.type !== "rich_text") {
        throw new Error(
          `Notion payload property '${config.notionPayloadProperty}' must be type 'rich_text', found '${payloadProperty.type}'`
        );
      }
    }
  }
  if (currentChunk) richText.push({ text: { content: currentChunk } });

  if (richText.length === 0) {
    richText.push({ text: { content: "" } });
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

async function buildExistingPagesMap(notion, databaseId, keyProperty, keyPropertyType, keyValues) {
  const mapping = new Map();
  if (keyValues.size === 0) return mapping;

  let cursor = undefined;
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: buildNotionFilter(keyProperty, keyPropertyType),
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      const key = getPlainText(keyProperty, keyPropertyType, page);
      if (keyValues.has(key) && !mapping.has(key)) {
        mapping.set(key, page.id);
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return mapping;
}

async function syncRow(notion, config, row, existingPagesMap) {
  const rowId = row[config.supabaseIdColumn];
  if (rowId === undefined || rowId === null) return "skipped";

  const rowIdValue = String(rowId);
  const keyProperty = buildKeyProperty(config.notionKeyProperty, config.notionKeyPropertyType, rowIdValue);
  const payloadProperty = buildPayloadProperty(config.notionPayloadProperty, row);
  const properties = { ...keyProperty, ...payloadProperty };

  const existingPageId = existingPagesMap.get(rowIdValue);

  if (existingPageId) {
    await notion.pages.update({
      page_id: existingPageId,
      properties,
    });
    return "updated";
  }

  const createdPage = await notion.pages.create({
    parent: { database_id: config.notionDatabaseId },
    properties,
  });
  existingPagesMap.set(rowIdValue, createdPage.id);
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
  const database = await getNotionDatabase(notion, config.notionDatabaseId);
  validateNotionProperties(database, config);

  const rows = await fetchSupabaseRows(supabase, config.supabaseTable, config.supabaseSelect);
  console.log(`Found ${rows.length} row(s) in Supabase table ${config.supabaseTable}`);
  const keyValues = new Set(
    rows
      .map((row) => row[config.supabaseIdColumn])
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value))
  );
  const existingPagesMap = await buildExistingPagesMap(
    notion,
    config.notionDatabaseId,
    config.notionKeyProperty,
    config.notionKeyPropertyType,
    keyValues
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const result = await syncRow(notion, config, row, existingPagesMap);
    if (result === "created") created += 1;
    else if (result === "updated") updated += 1;
    else skipped += 1;
  }

  console.log(`Sync complete. created=${created}, updated=${updated}, skipped=${skipped}`);
}

main().catch((error) => {
  console.error("Sync failed:", error);
  if (error?.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
