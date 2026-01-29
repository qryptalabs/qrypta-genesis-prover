export function stableStringify(obj) {
  return JSON.stringify(sortAny(obj));
}
function sortAny(x) {
  if (Array.isArray(x)) return x.map(sortAny);
  if (x && typeof x === "object") {
    const out = {};
    for (const k of Object.keys(x).sort()) out[k] = sortAny(x[k]);
    return out;
  }
  return x;
}
