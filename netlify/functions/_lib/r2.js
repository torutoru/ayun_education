const { GetObjectCommand, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { Hash } = require('@smithy/hash-node');
const { HttpRequest } = require('@smithy/protocol-http');
const { SignatureV4 } = require('@smithy/signature-v4');

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || '3d-image';

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not configured.');
  }

  return {
    bucket,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey
  };
}

function getR2Client() {
  const config = getR2Config();

  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
}

async function putObjectBuffer(key, buffer, options = {}) {
  const config = getR2Config();
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: options.contentType || 'application/octet-stream',
      CacheControl: options.cacheControl || undefined
    })
  );

  return {
    bucket: config.bucket,
    key
  };
}

async function getObjectBuffer(key) {
  const config = getR2Config();
  const client = getR2Client();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key
    })
  );

  const bytes = await response.Body.transformToByteArray();

  return {
    buffer: Buffer.from(bytes),
    contentType: response.ContentType || 'application/octet-stream',
    cacheControl: response.CacheControl || '',
    etag: response.ETag || ''
  };
}

function encodeObjectKey(key) {
  return String(key || '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildSignedUrlFromRequest(request) {
  const queryEntries = [];
  const query = request.query || {};

  Object.keys(query).forEach((key) => {
    const rawValue = query[key];
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    values.forEach((value) => {
      if (value == null) {
        return;
      }

      queryEntries.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    });
  });

  const queryString = queryEntries.length ? `?${queryEntries.join('&')}` : '';
  return `${request.protocol}//${request.hostname}${request.path}${queryString}`;
}

async function getObjectPresignedUrl(key, expiresInSeconds = 900) {
  const config = getR2Config();
  const signer = new SignatureV4({
    service: 's3',
    region: 'auto',
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    },
    sha256: Hash.bind(null, 'sha256')
  });

  const endpointHost = new URL(config.endpoint).host;
  const request = new HttpRequest({
    protocol: 'https:',
    method: 'GET',
    hostname: `${config.bucket}.${endpointHost}`,
    path: `/${encodeObjectKey(key)}`
  });

  const signedRequest = await signer.presign(request, {
    expiresIn: expiresInSeconds
  });

  return buildSignedUrlFromRequest(signedRequest);
}

module.exports = {
  getR2Config,
  getR2Client,
  putObjectBuffer,
  getObjectBuffer,
  getObjectPresignedUrl
};
