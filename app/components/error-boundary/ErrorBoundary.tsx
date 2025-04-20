'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error } = this.state;

    if (hasError) {
      return (
        <main className="min-h-[calc(100vh-180px)] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-semibold mb-2">Something went wrong.</h2>
          <p className="mb-4 text-sm">
            {error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.resetErrorBoundary}
            className="px-4 py-2 bg-cta-primary text-white rounded hover:bg-cta-hover"
          >
            Try Again
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
