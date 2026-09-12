// Covers used when an article has no image of its own.
export const COVER_IMAGES = [
  "/images/covers/1.webp",
  "/images/covers/2.jpg",
  "/images/covers/3.jpeg",
  "/images/covers/4.jpg",
];

// Deterministic "random" pick so a given article always gets the same cover
// (avoids hydration mismatches and image flicker between renders).
export function coverFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return COVER_IMAGES[hash % COVER_IMAGES.length]!;
}
