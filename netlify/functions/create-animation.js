const { parseJsonBody } = require('./_lib/http');
const { ok, badRequest, json, methodNotAllowed, logFunctionError } = require('./_lib/response');
const { createAnimationTask } = require('./_lib/meshy');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  try {
    const body = await parseJsonBody(event);

    if (!body.rigTaskId) {
      return badRequest('rigTaskId is required.');
    }

    if (typeof body.actionId !== 'number') {
      return badRequest('actionId is required.');
    }

    const result = await createAnimationTask({
      rigTaskId: body.rigTaskId,
      actionId: body.actionId
    });

    return ok({
      taskId: result.result
    });
  } catch (error) {
    logFunctionError('create-animation', error);

    return json(error.status || 500, {
      error: error.message
    });
  }
};
