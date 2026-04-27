const { badRequest, json, methodNotAllowed, ok } = require('./_lib/response');
const { getFirestore } = require('./_lib/firebaseAdmin');
const { getObjectPresignedUrl } = require('./_lib/r2');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET']);
  }

  try {
    const jobId = String(event.queryStringParameters?.jobId || '').trim();

    if (!jobId) {
      return badRequest('jobId is required.');
    }

    const snapshot = await getFirestore().collection('artJobs').doc(jobId).get();

    if (!snapshot.exists) {
      return json(404, {
        error: 'Stored art job not found.'
      });
    }

    const document = snapshot.data() || {};

    if (!document.glbObjectKey) {
      return json(404, {
        error: 'Stored GLB file not found.'
      });
    }

    const url = await getObjectPresignedUrl(document.glbObjectKey);

    return ok({
      url,
      fileName: document.glbFileName || 'stored-art.glb',
      contentType: document.glbContentType || 'model/gltf-binary'
    });
  } catch (error) {
    return json(500, {
      error: error.message || 'Failed to download stored GLB.'
    });
  }
};
