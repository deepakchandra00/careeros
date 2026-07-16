"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Rocket, Mail, Lock, User, Loader2, ArrowRight, Sparkles, ShieldCheck, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

export function AuthGate() {
  const [mode, setMode] = React.useState<Mode>("signup");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState<"google" | "creds" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("creds");
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        throw new Error(
          mode === "signup"
            ? "Account created but auto-login failed. Please log in."
            : "Invalid email or password."
        );
      }
      // Reload to pick up the session
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
      setLoading(null);
    }
  };

  const handleGoogle = () => {
    setLoading("google");
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left: branding */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-emerald-600 to-emerald-500 p-8 text-primary-foreground lg:p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="animate-blob absolute -right-10 -top-10 size-72 rounded-full bg-white/30 blur-3xl" />
          <div className="animate-blob absolute -bottom-20 left-1/3 size-80 rounded-full bg-emerald-200/30 blur-3xl [animation-delay:3s]" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-xl bg-white/15 backdrop-blur">
              <Rocket className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">CareerOS</p>
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
                AI Career Platform
              </p>
            </div>
          </div>
        </div>
        <div className="relative space-y-6">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            The Operating System for Your Career
          </h1>
          <p className="max-w-md text-primary-foreground/80">
            Build resumes, ace interviews, track applications, and grow your
            career — all powered by AI.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-4" /> 13 AI modules
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> ATS-optimized
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="size-4" /> Job tracking
            </span>
          </div>
        </div>
        <div className="relative text-xs text-primary-foreground/50">
          Trusted by 12,000+ professionals worldwide
        </div>
      </div>

      {/* Right: auth form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Start your career journey today — free."
                : "Sign in to continue to your dashboard."}
            </p>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogle}
            disabled={loading !== null}
          >
            {loading === "google" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Email/password */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Full name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Deepak Sharma"
                    className="h-10 pl-9"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-10 pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 pl-9"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full gap-1.5" disabled={loading !== null}>
              {loading === "creds" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {mode === "signup" ? "Create account" : "Sign in"}
              {loading === null && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to CareerOS?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
