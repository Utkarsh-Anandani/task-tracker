'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { LogIn, Mail, Lock, CheckCircle2 } from 'lucide-react';

import { toast } from 'sonner';

import {
  setTokens,
  AuthTokens,
} from '@/lib/auth-client';


// Types
interface LoginRequest {
  email: string;
  password: string;
}

interface ApiError {
  message: string;
}


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState<string>('');

  const [password, setPassword] =
    useState<string>('');

  const [error, setError] =
    useState<string>('');

  const [loading, setLoading] =
    useState<boolean>(false);


  // Validation
  const validateInput =
    (): string | null => {
      if (!email.trim())
        return 'Email is required';

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email))
        return 'Invalid email';

      if (!password)
        return 'Password is required';

      if (password.length < 6)
        return 'Password must be at least 6 characters';

      return null;
    };


  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    setError('');

    const validationError =
      validateInput();

    if (validationError) {
      setError(validationError);

      toast.error(validationError);

      return;
    }

    setLoading(true);

    try {
      const payload: LoginRequest = {
        email:
          email.trim().toLowerCase(),
        password,
      };

      const res = await fetch(
        '/api/v1/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify(payload),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        const err =
          data as ApiError;

        throw new Error(
          err.message ||
            'Login failed'
        );
      }

      const tokens =
        data as AuthTokens;

      // Store tokens securely
      setTokens(tokens);

      toast.success(
        'Login successful'
      );

      // Redirect
      router.push('/tasks');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong';

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />

      <div className="w-full max-w-md relative">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h1>

            <p className="text-slate-300">
              Sign in to continue to Task Tracker
            </p>
          </div>


          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {error && (
              <Alert className="bg-red-500/10 border-red-500/50 text-red-200">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}


            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/50"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/50"
              />
            </div>


            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4 mr-2" />

              {loading
                ? 'Signing in...'
                : 'Sign In'}
            </Button>

          </form>


          <div className="mt-6 text-center">
            <p className="text-slate-300">
              Don't have an account?{' '}

              <Link
                href="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign up
              </Link>

            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
