const PALETTE = ["cyan", "green", "orange", "gold", "red"];

function hashString(value) {
  let hash = 0;
  const text = String(value || "");
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getPaletteColor(seed) {
  return PALETTE[hashString(seed) % PALETTE.length];
}
