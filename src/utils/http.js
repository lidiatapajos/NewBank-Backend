function badRequest(res, message) {
  return res.status(400).json({
    error: "bad_request",
    message,
  });
}

function notFound(res, message) {
  return res.status(404).json({
    error: "not_found",
    message,
  });
}

function conflict(res, message) {
  return res.status(409).json({
    error: "conflict",
    message,
  });
}

function unauthorized(res, message) {
  return res.status(401).json({
    error: "unauthorized",
    message,
  });
}

function tooManyRequests(res, message) {
  return res.status(429).json({
    error: "too_many_requests",
    message,
  });
}

module.exports = {
  badRequest,
  notFound,
  conflict,
  unauthorized,
  tooManyRequests,
};
