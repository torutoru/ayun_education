const DB_NAME = 'ayun-art-studio';
const DB_VERSION = 1;
const JOB_STORE = 'jobs';
const BLOB_STORE = 'blobs';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error || new Error('IndexedDB를 열지 못했어요.'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(JOB_STORE)) {
        database.createObjectStore(JOB_STORE, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(BLOB_STORE)) {
        database.createObjectStore(BLOB_STORE, { keyPath: 'key' });
      }
    };
  });
}

async function withStore(storeName, mode, callback) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    let result;

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed.'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted.'));

    result = callback(store);
  });
}

export function createBlobKey(prefix, id) {
  return `${prefix}-${id}`;
}

export async function saveJob(job) {
  await withStore(JOB_STORE, 'readwrite', (store) => {
    store.put(job);
  });

  return job;
}

export function listJobs() {
  return withStore(JOB_STORE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

export function getJob(id) {
  return withStore(JOB_STORE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function saveBlob(key, blob) {
  await withStore(BLOB_STORE, 'readwrite', (store) => {
    store.put({ key, blob });
  });
}

export function getBlob(key) {
  return withStore(BLOB_STORE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject(request.error);
    });
  });
}
