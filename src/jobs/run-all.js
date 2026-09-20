import { runDriveBackup } from './backup-drive.js';
import { runNotionSync } from './sync-notion.js';

async function main() {
  await runDriveBackup();
  await runNotionSync();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
