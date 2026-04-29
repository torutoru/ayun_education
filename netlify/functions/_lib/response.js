function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function ok(body) {
  return json(200, body);
}

function badRequest(message, extra = {}) {
  return json(400, {
    error: message,
    ...extra
  });
}

function methodNotAllowed(methods = ['POST']) {
  return {
    statusCode: 405,
    headers: {
      Allow: methods.join(', ')
    },
    body: JSON.stringify({
      error: 'Method not allowed.'
    })
  };
}

function binary(statusCode, bodyBuffer, contentType = 'application/octet-stream', extraHeaders = {}) {
  return {
    statusCode,
    isBase64Encoded: true,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      ...extraHeaders
    },
    body: bodyBuffer.toString('base64')
  };
}

function isLocalDev() {
  return process.env.NETLIFY_DEV === 'true'
    || process.env.CONTEXT === 'dev'
    || process.env.NODE_ENV === 'development';
}

function logFunctionError(functionName, error) {
  if (!isLocalDev()) {
    return;
  }

  console.log(`[${functionName}] failed`, {
    status: error?.status || 500,
    name: error?.name || 'Error',
    message: error?.message || String(error),
    cause: error?.cause
      ? {
          name: error.cause.name || 'Error',
          message: error.cause.message || String(error.cause),
          code: error.cause.code || null
        }
      : null,
    stack: error?.stack || null,
    payload: error?.payload || null
  });
}

module.exports = {
  ok,
  json,
  badRequest,
  methodNotAllowed,
  binary,
  logFunctionError
};
