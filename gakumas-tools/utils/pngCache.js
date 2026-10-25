import sharp from "sharp";

export function createPngCache(limit) {
  const cache = new Map();
  return async function get(key, load) {
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    }
    const value = await load();
    if (value) {
      cache.set(key, value);
      if (cache.size > limit) cache.delete(cache.keys().next().value);
    }
    return value;
  };
}

export async function fetchAsPng(url, size) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`png: ${url} responded ${res.status}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const png = await sharp(buf)
      .resize(size, size, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (err) {
    console.warn(`png: failed to fetch/convert ${url}:`, err?.message || err);
    return null;
  }
}
