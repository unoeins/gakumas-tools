// Render appends to a client-sent X-Forwarded-For, so its first entry is spoofable.
export function clientIp(headers) {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",").at(-1).trim() ||
    "unknown"
  );
}
