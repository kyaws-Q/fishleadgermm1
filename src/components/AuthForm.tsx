
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AuthForm() {
  const { login, signup, isLoading } = useApp();
  const [isLoginForm, setIsLoginForm] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLoginForm) {
        // Use the login function from context instead of direct Supabase call
        await login(formData.email, formData.password);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        // Use the signup function from context
        await signup(formData.email, formData.password);
        toast.success("Account created successfully! Please check your email to verify your account.");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  return (
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLoginForm && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required={!isLoginForm}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : isLoginForm ? "Sign In" : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        {isLoginForm ? "Don't have an account?" : "Already have an account?"}
        <button
          onClick={() => setIsLoginForm(!isLoginForm)}
          className="ml-1 text-primary font-medium hover:underline"
          type="button"
        >
          {isLoginForm ? "Sign up" : "Sign in"}
        </button>
      </div>
    </CardContent>
  );
}
