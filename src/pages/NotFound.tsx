
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen fishledger-gradient-bg flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full text-primary mb-6">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9.9 17.15 2.5-1.5c1-.6 1.9-1.1 2.7-1.5A12 12 0 0 0 19.2 8.9C19.8 5.3 18 5 18 5c-1 0-5.7 1-5.7 1s-4.5 2-7.6 7.5c-3.1 5.5 0 7.7 0 7.7s1 1.8 4.1 1.8c3.1 0 6-2 8.6-5"></path>
            <path d="M18 5a5 5 0 0 1 5 5"></path>
            <path d="m7.5 12.2-4.7 2.8"></path>
            <path d="m7 16 .4-9 2.6 6"></path>
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
