import { requestJson } from './http.js';

function buildHeaders(serviceRoleKey, schema) {
  return {
    apikey: serviceRoleKey,
    Authorization: 'Bearer ' + serviceRoleKey,
    Accept: 'application/json',
    'Accept-Profile': schema,
    'Content-Profile': schema,
  };
}

function applyFilters(searchParams, filters) {
  for (const filter of filters) {
    if (!filter || typeof filter !== 'object') {
      continue;
    }

    const { column, operator, value } = filter;
    if (!column || !operator) {
      continue;
    }

    searchParams.append(column, `${operator}.${value}`);
  }
}

export async function fetchSupabaseRows(config, logger) {
  const rows = [];
  let offset = 0;

  while (true) {
    const url = new URL(`${config.url}/rest/v1/${config.table}`);
    url.searchParams.set('select', config.select);
    url.searchParams.set('limit', String(config.pageSize));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('order', `${config.orderField}.asc`);
    applyFilters(url.searchParams, config.filters);

    logger.info('Fetching Supabase rows', {
      table: config.table,
      offset,
      pageSize: config.pageSize,
    });

    const page = await requestJson(url.toString(), {
      headers: buildHeaders(config.serviceRoleKey, config.schema),
    });

    if (!Array.isArray(page)) {
      throw new Error('Supabase response must be an array of rows.');
    }

    rows.push(...page);

    if (page.length < config.pageSize) {
      break;
    }

    offset += config.pageSize;
  }

  return rows;
}
