function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name, fallback) {
  return process.env[name] ?? fallback;
}

function parseInteger(value, name, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer.`);
  }

  return parsed;
}

function parseJsonEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Environment variable ${name} must contain valid JSON. ${error.message}`);
  }
}

function parsePrivateKey(name) {
  return requiredEnv(name).replace(/\\n/g, '\n');
}

export function getSupabaseConfig() {
  return {
    url: requiredEnv('SUPABASE_URL').replace(/\/$/, ''),
    serviceRoleKey: requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    schema: optionalEnv('SUPABASE_SCHEMA', 'public'),
    table: requiredEnv('SUPABASE_TABLE'),
    select: optionalEnv('SUPABASE_SELECT', '*'),
    pageSize: parseInteger(process.env.SUPABASE_PAGE_SIZE, 'SUPABASE_PAGE_SIZE', 1000),
    orderField: optionalEnv('SUPABASE_ORDER_FIELD', 'id'),
    filters: parseJsonEnv('SUPABASE_FILTERS_JSON', []),
  };
}

export function getNotionConfig() {
  const fieldMap = parseJsonEnv('NOTION_FIELD_MAP_JSON');
  if (!fieldMap || typeof fieldMap !== 'object' || Array.isArray(fieldMap)) {
    throw new Error('Environment variable NOTION_FIELD_MAP_JSON must be a JSON object.');
  }

  return {
    token: requiredEnv('NOTION_TOKEN'),
    databaseId: requiredEnv('NOTION_DATABASE_ID'),
    sourceIdField: optionalEnv('NOTION_SOURCE_ID_FIELD', 'id'),
    sourceIdProperty: requiredEnv('NOTION_SOURCE_ID_PROPERTY'),
    syncHashProperty: requiredEnv('NOTION_SYNC_HASH_PROPERTY'),
    titleFallback: optionalEnv('NOTION_TITLE_FALLBACK', 'Untitled'),
    fieldMap,
  };
}

export function getDriveConfig() {
  return {
    serviceAccountEmail: requiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    privateKey: parsePrivateKey('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'),
    folderId: requiredEnv('GOOGLE_DRIVE_FOLDER_ID'),
    outputDirectory: optionalEnv('BACKUP_OUTPUT_DIR', 'artifacts/backups'),
    filePrefix: optionalEnv('BACKUP_FILE_PREFIX', 'supabase-export'),
  };
}
