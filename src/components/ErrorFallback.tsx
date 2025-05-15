import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // Log the error to the console for debugging
  // In a production app, you might send this to an error tracking service
  console.error("ErrorBoundary caught an error:", error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-red-200">
        <CardHeader className="bg-red-50 text-red-900 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Something went wrong
          </CardTitle>
          <CardDescription className="text-red-700">
            An error occurred in the application
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-red-50/50 p-4 rounded-md border border-red-100 mb-4 overflow-auto max-h-[200px]">
            <p className="font-mono text-sm text-red-800 whitespace-pre-wrap">{error.message}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Try refreshing the page or clicking the button below to reset the application.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 bg-muted/10">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
          <Button
            onClick={resetErrorBoundary}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
