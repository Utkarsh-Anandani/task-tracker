"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { UserPlus, Mail, Lock, User, CheckCircle2 } from "lucide-react";

import { toast } from "sonner";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface ApiError {
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const validateInput = (): string | null => {
    if (!fullname.trim()) return "Full name is required";

    if (fullname.trim().length < 2)
      return "Full name must be at least 2 characters";

    if (!email.trim()) return "Email is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) return "Invalid email address";

    if (!password) return "Password is required";

    if (password.length < 6) return "Password must be at least 6 characters";

    return null;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    setError("");

    const validationError = validateInput();

    if (validationError) {
      setError(validationError);

      toast.error(validationError);

      return;
    }

    setLoading(true);

    try {
      const payload: RegisterRequest = {
        name: fullname.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      const response = await fetch("/api/v1/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError = data as ApiError;

        throw new Error(apiError.message || "Registration failed");
      }

      // Success toast
      toast.success("Account created successfully");

      // Redirect to login
      router.push("/login");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_30%_70%,rgba(147,51,234,0.1),transparent_50%)]" />

      <div className="w-full max-w-md relative">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>

            <p className="text-slate-300">
              Join Task Tracker to manage your tasks
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/50 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="fullname"
                className="text-slate-200 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Full Name
              </Label>

              <Input
                id="fullname"
                type="text"
                placeholder="John Doe"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-slate-200 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-slate-200 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/50"
              />

              <p className="text-xs text-slate-400">Minimum 6 characters</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 hover:from-blue-700 hover:via-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4 mr-2" />

              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
