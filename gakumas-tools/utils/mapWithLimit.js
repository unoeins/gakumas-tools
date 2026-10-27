// Map an async iterable through `fn`, pulling the next item while earlier
// calls are still running but never letting more than `limit` run at once.
// Results keep the input order.
export async function mapWithLimit(iterable, limit, fn) {
  const results = [];
  const inFlight = new Set();
  for await (const item of iterable) {
    const call = fn(item);
    results.push(call);
    inFlight.add(call);
    const settle = () => inFlight.delete(call);
    call.then(settle, settle);
    if (inFlight.size >= limit) await Promise.race(inFlight);
  }
  return Promise.all(results);
}
