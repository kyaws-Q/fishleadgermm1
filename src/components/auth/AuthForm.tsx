import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "forgot-password";

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup, forgotPassword, isLoading } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "forgot-password") {
        if (!email) {
          toast.error("Please enter your email address");
          return;
        }
        await forgotPassword?.(email);
        // Don't navigate away, let the user see the success message
        return;
      }

      if (!email || !password) {
        toast.error("Please enter both email and password");
        return;
      }

      if (mode === "signup" && !name) {
        toast.error("Please enter your name");
        return;
      }

      if (mode === "login") {
        await login?.(email, password);
        navigate("/dashboard");
      } else if (mode === "signup") {
        await signup?.(email, password, name);
        toast.success("Account created! Please log in.");
        setMode("login");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Error messages are handled in the context provider
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={mode === "signup"}
            className="border-ocean-200 focus:border-primary"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-ocean-200 focus:border-primary"
        />
      </div>

      {mode !== "forgot-password" && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={mode !== "forgot-password"}
            className="border-ocean-200 focus:border-primary"
          />
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading 
          ? "Processing..." 
          : mode === "login" 
            ? "Sign In" 
            : mode === "signup" 
              ? "Create Account" 
              : "Reset Password"}
      </Button>

      <div className="text-center text-sm space-y-2">
        {mode === "login" && (
          <>
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setName("");
                }}
                className="text-primary hover:underline focus:outline-none"
              >
                Sign up
              </button>
            </p>
            <p>
              <button
                type="button"
                onClick={() => setMode("forgot-password")}
                className="text-primary hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </p>
          </>
        )}

        {mode === "signup" && (
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-primary hover:underline focus:outline-none"
            >
              Sign in
            </button>
          </p>
        )}

        {mode === "forgot-password" && (
          <p>
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-primary hover:underline focus:outline-none"
            >
              Back to login
            </button>
          </p>
        )}
      </div>
    </form>
  );
}