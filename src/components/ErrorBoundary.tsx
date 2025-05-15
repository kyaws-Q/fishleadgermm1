import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppError, ErrorType } from '@/types/error';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component to catch and display errors in the component tree
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Convert to AppError if needed
    const appError = 'type' in error
      ? error as AppError
      : {
          ...error,
          type: ErrorType.UNKNOWN,
          timestamp: Date.now(),
          handled: true,
        } as AppError;
    
    // Update state with error details
    this.setState({
      error: appError,
      errorInfo,
    });
    
    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  resetErrorBoundary(): void {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Call onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }
  
  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <Card className="mx-auto max-w-md my-8 border-red-200">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-700">Something went wrong</CardTitle>
            </div>
            <CardDescription className="text-red-600">
              {this.state.error instanceof Error
                ? this.state.error.message
                : 'An unexpected error occurred'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              The application encountered an error. You can try refreshing the page or contact support if the problem persists.
            </p>
            {this.state.error && 'type' in this.state.error && (
              <div className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-32">
                <p>Error Type: {(this.state.error as AppError).type || ErrorType.UNKNOWN}</p>
                <p>Timestamp: {new Date((this.state.error as AppError).timestamp || Date.now()).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 bg-red-50/50">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
            <Button onClick={this.resetErrorBoundary}>
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
