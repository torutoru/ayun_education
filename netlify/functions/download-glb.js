const { parseJsonBody } = require('./_lib/http');
const { badRequest, json, methodNotAllowed, binary } = require('./_lib/response');

function isAllowedMeshyAssetUrl(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);
    return parsed.protocol === 'https:' && parsed.hostname === 'assets.meshy.ai';
  } catch (error) {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  try {
    const body = await parseJsonBody(event);
    const sourceUrl = body.sourceUrl;

    if (!sourceUrl) {
      return badRequest('sourceUrl is required.');
    }

    if (!isAllowedMeshyAssetUrl(sourceUrl)) {
      return badRequest('Only Meshy asset URLs are allowed.');
    }

    const response = await fetch(sourceUrl);

    if (!response.ok) {
      return json(response.status, {
        error: `Failed to download GLB asset: ${response.status}`
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'model/gltf-binary';

    return binary(200, buffer, contentType, {
      'Content-Disposition': 'inline; filename="animated.glb"'
    });
  } catch (error) {
    return json(500, {
      error: error.message || 'Failed to proxy GLB download.'
    });
  }
};
