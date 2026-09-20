import { requestJson } from './http.js';
import { getNestedValue, sha256Hex, stableStringify, toRichTextString } from './utils.js';

const notionVersion = '2022-06-28';

function buildHeaders(token) {
  return {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Notion-Version': notionVersion,
  };
}

export function buildNotionPropertyValue(type, value, titleFallback) {
  switch (type) {
    case 'title': {
      const content = toRichTextString(value) || titleFallback;
      return {
        title: [{ text: { content } }],
      };
    }
    case 'rich_text': {
      const content = toRichTextString(value);
      return {
        rich_text: content ? [{ text: { content } }] : [],
      };
    }
    case 'number':
      return { number: value === null || value === undefined || value === '' ? null : Number(value) };
    case 'checkbox':
      return { checkbox: Boolean(value) };
    case 'url':
      return { url: value ? String(value) : null };
    case 'email':
      return { email: value ? String(value) : null };
    case 'phone_number':
      return { phone_number: value ? String(value) : null };
    case 'select':
      return { select: value ? { name: String(value) } : null };
    case 'multi_select': {
      const values = Array.isArray(value)
        ? value
        : value
          ? String(value).split(',').map((item) => item.trim()).filter(Boolean)
          : [];
      return { multi_select: values.map((name) => ({ name })) };
    }
    case 'date':
      return { date: value ? { start: new Date(value).toISOString() } : null };
    default:
      throw new Error(`Unsupported Notion property type: ${type}`);
  }
}

export function buildMappedProperties(row, config) {
  const properties = {};
  const valuesForHash = {};

  for (const [propertyName, definition] of Object.entries(config.fieldMap)) {
    if (!definition?.source || !definition?.type) {
      throw new Error(`Notion field map for ${propertyName} must contain source and type.`);
    }

    const value = getNestedValue(row, definition.source);
    properties[propertyName] = buildNotionPropertyValue(definition.type, value, config.titleFallback);
    valuesForHash[propertyName] = value;
  }

  const sourceId = toRichTextString(getNestedValue(row, config.sourceIdField));
  if (!sourceId) {
    throw new Error(`Supabase row is missing source identifier field: ${config.sourceIdField}`);
  }

  const syncHash = sha256Hex(stableStringify({ sourceId, valuesForHash }));

  properties[config.sourceIdProperty] = buildNotionPropertyValue('rich_text', sourceId, config.titleFallback);
  properties[config.syncHashProperty] = buildNotionPropertyValue('rich_text', syncHash, config.titleFallback);

  return { properties, sourceId, syncHash };
}

function propertyPlainText(property) {
  if (!property || typeof property !== 'object') {
    return '';
  }

  if (property.type === 'title') {
    return property.title.map((item) => item.plain_text).join('');
  }

  if (property.type === 'rich_text') {
    return property.rich_text.map((item) => item.plain_text).join('');
  }

  if (property.type === 'number') {
    return property.number === null ? '' : String(property.number);
  }

  if (property.type === 'checkbox') {
    return String(property.checkbox);
  }

  if (property.type === 'url') {
    return property.url ?? '';
  }

  if (property.type === 'date') {
    return property.date?.start ?? '';
  }

  if (property.type === 'select') {
    return property.select?.name ?? '';
  }

  return '';
}

export async function fetchNotionIndex(config, logger) {
  const pagesBySourceId = new Map();
  let cursor;

  do {
    const payload = cursor ? { start_cursor: cursor } : {};
    const response = await requestJson(`https://api.notion.com/v1/databases/${config.databaseId}/query`, {
      method: 'POST',
      headers: buildHeaders(config.token),
      body: JSON.stringify(payload),
    });

    for (const page of response.results ?? []) {
      const sourceId = propertyPlainText(page.properties?.[config.sourceIdProperty]);
      if (!sourceId) {
        continue;
      }

      pagesBySourceId.set(sourceId, {
        id: page.id,
        syncHash: propertyPlainText(page.properties?.[config.syncHashProperty]),
      });
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  logger.info('Fetched existing Notion pages', { count: pagesBySourceId.size });
  return pagesBySourceId;
}

export async function createNotionPage(config, properties) {
  return requestJson('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: buildHeaders(config.token),
    body: JSON.stringify({
      parent: { database_id: config.databaseId },
      properties,
    }),
  });
}

export async function updateNotionPage(config, pageId, properties) {
  return requestJson(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: buildHeaders(config.token),
    body: JSON.stringify({ properties }),
  });
}
