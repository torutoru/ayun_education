const { parseJsonBody } = require('./_lib/http');
const { badRequest, json, methodNotAllowed, ok, logFunctionError } = require('./_lib/response');
const { getFirestore } = require('./_lib/firebaseAdmin');
const { putObjectBuffer } = require('./_lib/r2');

function parseDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || '');

  if (!match) {
    throw new Error('Invalid data URL.');
  }

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], 'base64')
  };
}

function sanitizeJobId(jobId) {
  return String(jobId || '').replace(/[^a-zA-Z0-9-_]/g, '');
}

async function fetchMeshyGlbBuffer(sourceUrl) {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to download Meshy GLB: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  try {
    const body = await parseJsonBody(event);
    const jobId = sanitizeJobId(body.jobId);

    if (!jobId) {
      return badRequest('jobId is required.');
    }

    if (!body.finalGlbUrl) {
      return badRequest('finalGlbUrl is required.');
    }

    if (!body.sourcePreviewDataUrl) {
      return badRequest('sourcePreviewDataUrl is required.');
    }

    const firestore = getFirestore();
    const timestamp = Date.now();
    const imageData = parseDataUrl(body.sourcePreviewDataUrl);
    const glbBuffer = await fetchMeshyGlbBuffer(body.finalGlbUrl);
    const previewImageKey = `art-preview/${jobId}.jpg`;
    const glbObjectKey = `art-glb/${jobId}.glb`;

    await putObjectBuffer(previewImageKey, imageData.buffer, {
      contentType: imageData.contentType,
      cacheControl: 'public, max-age=31536000, immutable'
    });

    await putObjectBuffer(glbObjectKey, glbBuffer, {
      contentType: 'model/gltf-binary',
      cacheControl: 'public, max-age=31536000, immutable'
    });

    const document = {
      jobId,
      actionId: body.actionId || null,
      actionLabel: body.actionLabel || '3D 캐릭터',
      previewImageKey,
      previewImageFileName: `${jobId}.jpg`,
      previewImageContentType: imageData.contentType,
      glbObjectKey,
      glbFileName: `${jobId}.glb`,
      glbContentType: 'model/gltf-binary',
      glbBytes: glbBuffer.length,
      createdAt: body.createdAt || timestamp,
      updatedAt: timestamp,
      status: 'ready'
    };

    await firestore.collection('artJobs').doc(jobId).set(document, { merge: true });

    return ok({
      jobId,
      previewImageKey,
      glbObjectKey,
      glbBytes: glbBuffer.length
    });
  } catch (error) {
    logFunctionError('store-art-job', error);

    return json(500, {
      error: error.message || 'Failed to store art job.'
    });
  }
};
