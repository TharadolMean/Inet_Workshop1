// รูปแบบ response เดียวกันทุก endpoint: { status, message, data }
const send = (res, status, message, data = null) =>
  res.status(status).json({ status, message, data });

module.exports = {
  ok: (res, data, message = 'success') => send(res, 200, message, data),
  created: (res, data, message = 'created') => send(res, 201, message, data),
  badRequest: (res, message = 'bad request', data = null) => send(res, 400, message, data),
  unauthorized: (res, message = 'unauthorized') => send(res, 401, message, null),
  forbidden: (res, message = 'forbidden') => send(res, 403, message, null),
  serverError: (res, message = 'internal server error') => send(res, 500, message, null),
};
