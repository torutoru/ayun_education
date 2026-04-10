const API_BASE = 'https://api.meshy.ai/openapi/v1';

function getMeshyApiKey() {
  const apiKey = process.env.MESHY_API_KEY;

  if (!apiKey) {
    throw new Error('Missing MESHY_API_KEY environment variable.');
  }

  return apiKey;
}

async function requestMeshy(path, options = {}) {
  const mergedHeaders = {
    Authorization: `Bearer ${getMeshyApiKey()}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  Object.keys(mergedHeaders).forEach((key) => {
    if (mergedHeaders[key] == null) {
      delete mergedHeaders[key];
    }
  });

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: mergedHeaders
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'string'
        ? payload
        : payload?.message || payload?.error || payload?.detail || `Meshy request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function createImageTo3DTask({ imageDataUrl }) {
  return requestMeshy('/image-to-3d', {
    method: 'POST',
    body: JSON.stringify({
      image_url: imageDataUrl,
      should_texture: true,
      image_enhancement: true,
      moderation: false,
      pose_mode: 't-pose',
      ai_model: process.env.MESHY_IMAGE_MODEL || 'latest',
      target_formats: ['glb']
    })
  });
}

function getImageTo3DTask(taskId) {
  return requestMeshy(`/image-to-3d/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': undefined
    }
  });
}

function createRiggingTask({ inputTaskId }) {
  return requestMeshy('/rigging', {
    method: 'POST',
    body: JSON.stringify({
      input_task_id: inputTaskId,
      height_meters: 1.1
    })
  });
}

function getRiggingTask(taskId) {
  return requestMeshy(`/rigging/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': undefined
    }
  });
}

function createAnimationTask({ rigTaskId, actionId }) {
  return requestMeshy('/animations', {
    method: 'POST',
    body: JSON.stringify({
      rig_task_id: rigTaskId,
      action_id: actionId,
      post_process: {
        operation_type: 'change_fps',
        fps: 30
      }
    })
  });
}

function getAnimationTask(taskId) {
  return requestMeshy(`/animations/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': undefined
    }
  });
}

module.exports = {
  createImageTo3DTask,
  getImageTo3DTask,
  createRiggingTask,
  getRiggingTask,
  createAnimationTask,
  getAnimationTask
};
