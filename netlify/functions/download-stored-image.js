const { badRequest, binary, json, methodNotAllowed } = require('./_lib/response');
const { getFirestore } = require('./_lib/firebaseAdmin');
const { getObjectBuffer } = require('./_lib/r2');

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

    if (!document.previewImageKey) {
      return json(404, {
        error: 'Stored preview image not found.'
      });
    }

    const object = await getObjectBuffer(document.previewImageKey);

    const headers = {
      'Cache-Control': 'public, max-age=31536000, immutable'
    };

    if (object.etag) {
      headers.ETag = object.etag;
    }

    return binary(200, object.buffer, object.contentType, headers);
  } catch (error) {
    return json(500, {
      error: error.message || 'Failed to download stored image.'
    });
  }
};
