// @ts-expect-error
import { Component, ErrorInfo, ReactNode } from "react"
import { createContext } from "./createContext"

export const [ErrorProvider, useError] = createContext<unknown>("ErrorProvider")

interface ResetError {
  (): void
}

export const [ResetErrorProvider, useResetError] =
  createContext<ResetError>("ResetErrorProvider")

interface Props {
  fallback?: ReactNode
  children?: ReactNode
}

interface State {
  error: unknown | null
}

/**
 * https://reactjs.org/docs/error-boundaries.html
 */
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: unknown): State {
    return {
      error,
    }
  }

  constructor(props: Props) {
    super(props)

    // @ts-expect-error
    this.state = {
      error: null,
    }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.warn(error, errorInfo)
  }

  private resetError: ResetError = () => {
    // @ts-expect-error
    this.setState({
      error: null,
    })
  }

  render() {
    // @ts-expect-error
    const { fallback, children } = this.props
    // @ts-expect-error
    const { error } = this.state
    const { resetError } = this

    if (error) {
      return (
        <ResetErrorProvider value={resetError}>
          <ErrorProvider value={error}>{fallback}</ErrorProvider>
        </ResetErrorProvider>
      )
    }

    return children ?? null
  }
}
