import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    // Log the path that wasn't found
    console.log(`Page not found: ${location.pathname}`);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-ocean-400">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-slate-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <Link to="/">
            <Button className="bg-ocean-600 hover:bg-ocean-700">
              Return to Home
            </Button>
          </Link>
          <Button variant="outline" asChild className="ml-2">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
