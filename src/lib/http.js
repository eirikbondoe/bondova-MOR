export class HttpError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'HttpError';
    this.details = details;
  }
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const responseText = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') && responseText
    ? JSON.parse(responseText)
    : responseText;

  if (!response.ok) {
    throw new HttpError(`Request failed with status ${response.status}`, {
      url,
      status: response.status,
      body,
    });
  }

  return body;
}

export async function requestText(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.text();

  if (!response.ok) {
    throw new HttpError(`Request failed with status ${response.status}`, {
      url,
      status: response.status,
      body,
    });
  }

  return body;
}
