// Process `items` through a pool of async `workers` (promises resolving to
// worker instances) in order-preserving batches of `workers.length`. Each
// batch runs concurrently; batches run sequentially. `fn` receives the item,
// the resolved worker, and the item index, and its return values are
// collected into the result array in the same order as the input.
export async function runBatched(items, workers, fn) {
  const results = new Array(items.length);
  const batch = [];
  for (let i = 0; i < workers.length; i++) {
    batch.push((async () => {
      const worker = await workers[i];
      const size = Math.ceil(items.length / workers.length);
      for (let j = 0; j < size; j ++) {
        const index = i * size + j;
        if (index >= items.length) break;
        results[index] = await fn(items[index], worker, index);
      }
    })());
  }
  await Promise.all(batch);
  return results;
}
