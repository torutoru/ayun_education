const { parseJsonBody } = require('./_lib/http');
const { ok, badRequest, json, methodNotAllowed, logFunctionError } = require('./_lib/response');
const { createRemeshTask } = require('./_lib/meshy');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return methodNotAllowed(['POST']);
  }

  try {
    const body = await parseJsonBody(event);

    if (!body.inputTaskId) {
      return badRequest('inputTaskId is required.');
    }

    const result = await createRemeshTask({
      inputTaskId: body.inputTaskId
    });

    return ok({
      taskId: result.result
    });
  } catch (error) {
    logFunctionError('create-remesh', error);

    return json(error.status || 500, {
      error: error.message
    });
  }
};
