async function request(path, options = {}) {
  const response = await fetch(path, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || '요청에 실패했어요.');
  }

  return payload;
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
