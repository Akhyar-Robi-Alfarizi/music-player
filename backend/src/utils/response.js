function ok(res, data = {}, message = null) {
  const payload = { ...data };
  if (message) payload.message = message;
  return res.status(200).json(payload);
}

function created(res, data = {}, message = null) {
  const payload = { ...data };
  if (message) payload.message = message;
  return res.status(201).json(payload);
}

function fail(res, statusCode, message, detail = undefined) {
  const payload = { message };
  if (detail !== undefined && detail !== null) {
    payload.detail = detail;
  }
  return res.status(statusCode).json(payload);
}

module.exports = {
  ok,
  created,
  fail,
};
