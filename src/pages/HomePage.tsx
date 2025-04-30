
import { useApp } from "@/contexts/AppContext";
import { Navigate } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/card";
import { AuthForm } from "@/components/AuthForm";
import { Fish } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useApp();
  
  // If already logged in, redirect to dashboard
  if (user && !isLoading) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen fishledger-gradient-bg flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-full text-primary-foreground">
            <Fish className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold mt-4">FishLedger</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your fish purchases with ease
          </p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <h2 className="text-2xl font-semibold">
              {isLoading ? "Loading..." : "Welcome back"}
            </h2>
          </CardHeader>
          <AuthForm />
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
