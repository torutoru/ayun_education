const { ok, badRequest, json, methodNotAllowed } = require('./_lib/response');
const { getAnimationTask } = require('./_lib/meshy');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return methodNotAllowed(['GET']);
  }

  try {
    const taskId = event.queryStringParameters?.taskId;

    if (!taskId) {
      return badRequest('taskId is required.');
    }

    const task = await getAnimationTask(taskId);

    return ok(task);
  } catch (error) {
    return json(error.status || 500, {
      error: error.message
    });
  }
};
