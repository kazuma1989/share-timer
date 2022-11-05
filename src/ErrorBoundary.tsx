import { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  fallback: ReactNode
  children?: ReactNode
}

interface State {
  error: unknown
}

/**
 * https://reactjs.org/docs/error-boundaries.html
 */
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: unknown): State {
    return { error }
  }

  constructor(props: Props) {
    super(props)

    this.state = { error: null }
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.warn(error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return this.props.fallback || null
    }

    return this.props.children ?? null
  }
}
