const isDev = () => process.env.NODE_ENV === 'development';

/**
 * Send a JSON error response without leaking internal details in production.
 * The full error is always logged server-side; the client only receives a
 * generic public message, plus message/name/stack when NODE_ENV=development.
 *
 * @param {import('express').Response} res
 * @param {number} status - HTTP status code
 * @param {Error|string} error - the underlying error (logged)
 * @param {string} publicMessage - safe message for the client
 */
function sendError(res, status, error, publicMessage) {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${status}] ${publicMessage}:`, err);

  if (res.headersSent) return;

  const body = {
    success: false,
    error: publicMessage,
  };
  if (isDev()) {
    body.message = err.message;
    body.name = err.name;
    body.stack = err.stack;
  }
  res.status(status).json(body);
}

module.exports = { sendError };
