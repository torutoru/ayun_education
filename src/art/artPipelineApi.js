async function request(path, options = {}) {
  const response = await fetch(path, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || '요청에 실패했어요.');
  }

  return payload;
}

async function requestBlob(path, options = {}) {
  const response = await fetch(path, options);

  if (!response.ok) {
    let message = '파일 요청에 실패했어요.';

    try {
      const payload = await response.json();
      message = payload?.error || message;
    } catch (error) {
      // Keep fallback message.
    }

    throw new Error(message);
  }

  return response.blob();
}

export function createImage3d(imageDataUrl) {
  return request('/.netlify/functions/create-image3d', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageDataUrl })
  });
}

export function preprocessArtImage(imageDataUrl) {
  return request('/.netlify/functions/generate-preprocessed-art', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageDataUrl })
  });
}

export function getImage3d(taskId) {
  return request(`/.netlify/functions/get-image3d?taskId=${encodeURIComponent(taskId)}`);
}

export function createRigging(inputTaskId) {
  return request('/.netlify/functions/create-rigging', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputTaskId })
  });
}

export function getRigging(taskId) {
  return request(`/.netlify/functions/get-rigging?taskId=${encodeURIComponent(taskId)}`);
}

export function createRemesh(inputTaskId) {
  return request('/.netlify/functions/create-remesh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputTaskId })
  });
}

export function getRemesh(taskId) {
  return request(`/.netlify/functions/get-remesh?taskId=${encodeURIComponent(taskId)}`);
}

export function createAnimation(rigTaskId, actionId) {
  return request('/.netlify/functions/create-animation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rigTaskId, actionId })
  });
}

export function getAnimation(taskId) {
  return request(`/.netlify/functions/get-animation?taskId=${encodeURIComponent(taskId)}`);
}

export function downloadGlb(sourceUrl) {
  return requestBlob('/.netlify/functions/download-glb', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sourceUrl })
  });
}

export function storeArtJob(payload) {
  return request('/.netlify/functions/store-art-job', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function listStoredArtJobs() {
  return request('/.netlify/functions/list-art-jobs');
}

export function downloadStoredGlb(jobId) {
  return request(`/.netlify/functions/download-stored-glb?jobId=${encodeURIComponent(jobId)}`);
}

export function getStoredImageUrl(jobId, version) {
  const suffix = version ? `&v=${encodeURIComponent(version)}` : '';
  return `/.netlify/functions/download-stored-image?jobId=${encodeURIComponent(jobId)}${suffix}`;
}
