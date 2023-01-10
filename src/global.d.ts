// **Why `global.d.ts` instead of `compilerOptions.types` inside `jsconfig.json` or `tsconfig.json`?**
// Setting `compilerOptions.types` shuts out all other types not explicitly listed in the configuration. Using triple-slash references keeps the default TypeScript setting of accepting type information from the entire workspace, while also adding `svelte` and `vite/client` type information.
/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="vitest/importMeta" />

// https://github.com/sveltejs/language-tools/blob/84c7463def79e88550aa12074830ed7d7945e1ee/docs/preprocessors/typescript.md#im-using-an-attributeevent-on-a-dom-element-and-it-throws-a-type-error
declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    "on:intersect"?: (event: CustomEvent<HTMLElement>) => any
  }
}
