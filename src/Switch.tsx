import { ReactNode } from "react"
import { Observable } from "rxjs"
import { createContext } from "./createContext"
import { PageType } from "./mapToPageType"
import { useObservable } from "./useObservable"

export function Switch({
  pageType$,
  children,
}: {
  pageType$: Observable<PageType>
  children?: ReactNode
}) {
  const pageType = useObservable(pageType$)

  return <PageTypeProvider value={pageType}>{children}</PageTypeProvider>
}

export function Route({
  path,
  children,
}: {
  path: string
  children?: ReactNode
}) {
  const [type] = usePageType()

  return type === path ? <>{children}</> : null
}

const [PageTypeProvider, usePageType] =
  createContext<PageType>("PageTypeProvider")
