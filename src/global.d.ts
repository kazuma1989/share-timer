// **Why `global.d.ts` instead of `compilerOptions.types` inside `jsconfig.json` or `tsconfig.json`?**
// Setting `compilerOptions.types` shuts out all other types not explicitly listed in the configuration. Using triple-slash references keeps the default TypeScript setting of accepting type information from the entire workspace, while also adding `svelte` and `vite/client` type information.
/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="vitest/importMeta" />

declare module "https://*"
