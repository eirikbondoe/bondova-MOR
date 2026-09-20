import { appendFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ensureDir } from './utils.js';

const repoRoot = process.cwd();
const statusDir = path.join(repoRoot, 'artifacts', 'status');

export async function writeJobStatus(jobName, payload) {
  await ensureDir(statusDir);
  const filePath = path.join(statusDir, `${jobName}.json`);
  await writeFile(
    filePath,
    `${JSON.stringify({ jobName, generatedAt: new Date().toISOString(), ...payload }, null, 2)}\n`,
    'utf8',
  );
}

export async function appendStepSummary(lines) {
  if (!process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  const content = `${lines.join('\n')}\n`;
  await appendFile(process.env.GITHUB_STEP_SUMMARY, content, 'utf8');
}
