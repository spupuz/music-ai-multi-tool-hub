import React from 'react';
import Button from '@/components/common/Button';

interface ToolErrorBoundaryProps {
  children: React.ReactNode;
}

interface ToolErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ToolErrorBoundary extends React.Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  state: ToolErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ToolErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Tool failed to load:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full text-center py-16 px-4 animate-fadeIn">
          <h2 className="text-xl font-black uppercase tracking-tight text-red-500 mb-3">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            This tool failed to load. Try again, or reload the app if the problem persists.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={this.handleRetry} variant="primary" size="md">
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="md"
            >
              Reload App
            </Button>
          </div>
          {this.state.errorMessage && (
            <p className="mt-6 text-[10px] text-gray-500 dark:text-gray-500 break-all max-w-lg mx-auto">
              {this.state.errorMessage}
            </p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ToolErrorBoundary;
