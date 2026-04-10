const { parseJsonBody } = require('./_lib/http');
const { ok, badRequest, json, methodNotAllowed } = require('./_lib/response');
const { createRiggingTask } = require('./_lib/meshy');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  try {
    const body = await parseJsonBody(event);

    if (!body.inputTaskId) {
      return badRequest('inputTaskId is required.');
    }

    const result = await createRiggingTask({
      inputTaskId: body.inputTaskId
    });

    return ok({
      taskId: result.result
    });
  } catch (error) {
    return json(error.status || 500, {
      error: error.message
    });
  }
};
