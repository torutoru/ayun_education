const { GetObjectCommand, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

function loadLocalEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, 'utf8');

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1);

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

function getR2Config() {
  loadLocalEnvFile();

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

module.exports = {
  getR2Config,
  getR2Client,
  putObjectBuffer,
  getObjectBuffer
};
