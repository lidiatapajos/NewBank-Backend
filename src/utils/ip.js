function extractIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    const [first] = forwardedFor.split(",");
    return normalizeIp(first);
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return normalizeIp(forwardedFor[0]);
  }

  return normalizeIp(req.ip || req.socket?.remoteAddress || "unknown");
}

function normalizeIp(ip) {
  const value = String(ip || "unknown").trim();

  if (value.startsWith("::ffff:")) {
    return value.slice(7);
  }

  return value;
}

module.exports = {
  extractIp,
  normalizeIp,
};
