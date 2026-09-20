import { createSign } from 'node:crypto';

import { requestJson } from './http.js';

function base64UrlEncode(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function signJwt(unsignedToken, privateKey) {
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(privateKey);
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(config) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimSet = base64UrlEncode(JSON.stringify({
    iss: config.serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: issuedAt + 3600,
    iat: issuedAt,
  }));
  const assertion = signJwt(`${header}.${claimSet}`, config.privateKey);

  const tokenResponse = await requestJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });

  return tokenResponse.access_token;
}

export async function uploadFileToDrive(config, { fileName, contentType, content }) {
  const accessToken = await getAccessToken(config);
  const boundary = `bondova-${Date.now()}`;
  const metadata = {
    name: fileName,
    parents: [config.folderId],
  };

  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`),
    Buffer.isBuffer(content) ? content : Buffer.from(content),
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  return requestJson('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink,createdTime', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
}
