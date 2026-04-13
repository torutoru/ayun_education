const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function readJsonFromPath(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

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

function buildCredentialObject() {
  loadLocalEnvFile();

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }

  const fileCredential =
    readJsonFromPath(process.env.FIREBASE_SERVICE_ACCOUNT_PATH) ||
    readJsonFromPath(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  if (fileCredential) {
    return fileCredential;
  }

  throw new Error('Firebase Admin credentials are not configured.');
}

function getFirebaseApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const credentialObject = buildCredentialObject();

  return admin.initializeApp({
    credential: admin.credential.cert(credentialObject)
  });
}

function getFirestore() {
  return getFirebaseApp().firestore();
}

module.exports = {
  getFirebaseApp,
  getFirestore
};
