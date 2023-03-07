// inspired with @sveltejs/kit/node/polyfills
// https://github.com/sveltejs/kit/blob/963e03bfd9ec4faee76403607e036b84bdf88711/packages/kit/src/exports/node/polyfills.js

const window = undefined
class Worker {}

const globals = {
  window,
  Worker,
} satisfies Record<string, unknown>

export function installPolyfills() {
  for (const name in globals) {
    Object.defineProperty(globalThis, name, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: globals[name as keyof typeof globals],
    })
  }
}
