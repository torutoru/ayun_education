const { ok, badRequest, json, methodNotAllowed, logFunctionError } = require('./_lib/response');
const { getImageTo3DTask } = require('./_lib/meshy');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET']);
  }

  try {
    const taskId = event.queryStringParameters?.taskId;

    if (!taskId) {
      return badRequest('taskId is required.');
    }

    const task = await getImageTo3DTask(taskId);

    return ok(task);
  } catch (error) {
    logFunctionError('get-image3d', error);

    return json(error.status || 500, {
      error: error.message
    });
  }
};
