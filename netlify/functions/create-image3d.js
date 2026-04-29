const { parseJsonBody } = require('./_lib/http');
const { ok, badRequest, json, methodNotAllowed, logFunctionError } = require('./_lib/response');
const { createImageTo3DTask } = require('./_lib/meshy');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  try {
    const body = await parseJsonBody(event);

    if (!body.imageDataUrl) {
      return badRequest('imageDataUrl is required.');
    }

    const result = await createImageTo3DTask({
      imageDataUrl: body.imageDataUrl
    });

    return ok({
      taskId: result.result
    });
  } catch (error) {
    logFunctionError('create-image3d', error);

    return json(error.status || 500, {
      error: error.message
    });
  }
};
