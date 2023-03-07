/**
 * https://github.com/ai/nanoid/blob/4.0.0/non-secure/index.js
 */
export function nanoid(size = 21): string {
  let id = ""

  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += ALPHABET[(Math.random() * ALPHABET.length) | 0]
  }

  return id
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz"
