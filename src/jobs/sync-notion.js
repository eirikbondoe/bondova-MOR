import { getNotionConfig, getSupabaseConfig } from '../lib/config.js';
import { createLogger } from '../lib/logger.js';
import { fetchNotionIndex, buildMappedProperties, createNotionPage, updateNotionPage } from '../lib/notion.js';
import { writeJobStatus, appendStepSummary } from '../lib/status.js';
import { fetchSupabaseRows } from '../lib/supabase.js';

export async function runNotionSync() {
  const logger = createLogger('notion-sync');
  const supabaseConfig = getSupabaseConfig();
  const notionConfig = getNotionConfig();

  logger.info('Starting Notion sync', {
    table: supabaseConfig.table,
    databaseId: notionConfig.databaseId,
  });

  const rows = await fetchSupabaseRows(supabaseConfig, logger);
  const notionIndex = await fetchNotionIndex(notionConfig, logger);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const { properties, sourceId, syncHash } = buildMappedProperties(row, notionConfig);
    const existing = notionIndex.get(sourceId);

    if (!existing) {
      await createNotionPage(notionConfig, properties);
      created += 1;
      continue;
    }

    if (existing.syncHash === syncHash) {
      skipped += 1;
      continue;
    }

    await updateNotionPage(notionConfig, existing.id, properties);
    updated += 1;
  }

  const summary = {
    status: 'success',
    sourceTable: supabaseConfig.table,
    notionDatabaseId: notionConfig.databaseId,
    totalRows: rows.length,
    created,
    updated,
    skipped,
  };

  logger.info('Completed Notion sync', summary);
  await writeJobStatus('notion-sync', summary);
  await appendStepSummary([
    '## Notion sync',
    `- Source table: ${supabaseConfig.table}`,
    `- Total rows: ${rows.length}`,
    `- Created: ${created}`,
    `- Updated: ${updated}`,
    `- Skipped: ${skipped}`,
  ]);

  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runNotionSync().catch(async (error) => {
    console.error(error);
    await writeJobStatus('notion-sync', {
      status: 'error',
      message: error.message,
      details: error.details ?? null,
    });
    process.exitCode = 1;
  });
}
