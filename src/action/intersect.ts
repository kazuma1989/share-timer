import type { Action } from "svelte/types/runtime/action"

declare global {
  // https://github.com/sveltejs/language-tools/blob/84c7463def79e88550aa12074830ed7d7945e1ee/docs/preprocessors/typescript.md#im-using-an-attributeevent-on-a-dom-element-and-it-throws-a-type-error
  namespace svelteHTML {
    interface HTMLAttributes {
      "on:intersect"?: (event: CustomEvent<HTMLElement>) => any
    }
  }
}

export const intersect: Action<HTMLElement> = (root) => {
  const observer = new IntersectionObserver(
    (entries) => {
      const [target] = entries
        .filter(
          (
            _
          ): _ is Omit<IntersectionObserverEntry, "target"> & {
            target: HTMLElement
          } => _.isIntersecting && _.target instanceof HTMLElement
        )
        .map((_) => _.target)

      if (target) {
        root.dispatchEvent(
          new CustomEvent(
            "intersect" satisfies EventNameOf<keyof svelteHTML.HTMLAttributes>,
            {
              detail: target,
            }
          )
        )
      }
    },
    {
      root,
      rootMargin: "-32px 0px",
      threshold: 1,
    }
  )

  Array.from(root.children).forEach((child) => {
    observer.observe(child)
  })

  return {
    destroy() {
      observer.disconnect()
    },
  }
}
