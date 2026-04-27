const { parseJsonBody } = require('./_lib/http');
const { ok, badRequest, json, methodNotAllowed } = require('./_lib/response');
const { preprocessArtImage } = require('./_lib/gemini');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  try {
    const body = await parseJsonBody(event);

    if (!body.imageDataUrl) {
      return badRequest('imageDataUrl is required.');
    }

    const result = await preprocessArtImage({
      imageDataUrl: body.imageDataUrl
    });

    return ok({
      imageDataUrl: result.imageDataUrl,
      model: result.model,
      usedGemini: true
    });
  } catch (error) {
    return json(error.status || 500, {
      error: error.message
    });
  }
};
