import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { getDriveConfig, getSupabaseConfig } from '../lib/config.js';
import { uploadFileToDrive } from '../lib/drive.js';
import { createLogger } from '../lib/logger.js';
import { appendStepSummary, writeJobStatus } from '../lib/status.js';
import { fetchSupabaseRows } from '../lib/supabase.js';
import { ensureDir, resolvePathFromRepoRoot, sanitizeFileComponent, timestampForFile } from '../lib/utils.js';

export async function runDriveBackup() {
  const logger = createLogger('drive-backup');
  const supabaseConfig = getSupabaseConfig();
  const driveConfig = getDriveConfig();

  logger.info('Starting Drive backup', {
    table: supabaseConfig.table,
    folderId: driveConfig.folderId,
  });

  const rows = await fetchSupabaseRows(supabaseConfig, logger);
  const snapshot = {
    createdAt: new Date().toISOString(),
    source: {
      url: supabaseConfig.url,
      schema: supabaseConfig.schema,
      table: supabaseConfig.table,
      select: supabaseConfig.select,
      filters: supabaseConfig.filters,
      rowCount: rows.length,
    },
    rows,
  };

  const fileName = `${sanitizeFileComponent(driveConfig.filePrefix)}-${sanitizeFileComponent(supabaseConfig.table)}-${timestampForFile()}.json`;
  const outputDirectory = resolvePathFromRepoRoot(process.cwd(), driveConfig.outputDirectory);
  await ensureDir(outputDirectory);
  const outputPath = path.join(outputDirectory, fileName);
  const contents = `${JSON.stringify(snapshot, null, 2)}\n`;
  await writeFile(outputPath, contents, 'utf8');

  const driveFile = await uploadFileToDrive(driveConfig, {
    fileName,
    contentType: 'application/json',
    content: contents,
  });

  const summary = {
    status: 'success',
    sourceTable: supabaseConfig.table,
    rowCount: rows.length,
    outputPath,
    driveFile,
  };

  logger.info('Completed Drive backup', summary);
  await writeJobStatus('drive-backup', summary);
  await appendStepSummary([
    '## Drive backup',
    `- Source table: ${supabaseConfig.table}`,
    `- Rows exported: ${rows.length}`,
    `- Local snapshot: ${outputPath}`,
    `- Drive file: ${driveFile.name} (${driveFile.id})`,
  ]);

  return summary;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDriveBackup().catch(async (error) => {
    console.error(error);
    await writeJobStatus('drive-backup', {
      status: 'error',
      message: error.message,
      details: error.details ?? null,
    });
    process.exitCode = 1;
  });
}
