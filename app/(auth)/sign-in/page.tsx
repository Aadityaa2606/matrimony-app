"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const created = searchParams.get("created");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, "");

    if (cleaned && !cleaned.startsWith("+")) {
      if (cleaned.startsWith("91") && cleaned.length > 2) {
        return "+" + cleaned;
      }
      return "+91" + cleaned;
    }

    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted.length <= 13) {
      setPhoneNumber(formatted);
    }
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneNumber.length !== 13) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("member", {
        phone: phoneNumber,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid phone number or password");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link
          href="/welcome"
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
        >
          <svg
            className="w-5 h-5 text-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <Image src="/logo.svg" alt="Logo" width={40} height={40} />
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8">
        <div className="animate-fade-in max-w-md mx-auto">
          <h1 className="heading-primary text-3xl text-primary mb-2">
            Welcome Back
          </h1>
          <p className="subtitle mb-8">Sign in to continue your journey</p>

          {verified && (
            <div className="bg-(--success)/10 text-success p-4 rounded-xl mb-6 border border-(--success)/20">
              ✓ Phone verified! Please sign in with your password.
            </div>
          )}

          {created && (
            <div className="bg-(--success)/10 text-success p-4 rounded-xl mb-6 border border-(--success)/20">
              ✓ Account created! Please sign in.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-foreground">
                Phone Number
              </label>
              <input
                type="tel"
                className="input"
                placeholder="+91 00000 00000"
                value={phoneNumber}
                onChange={handlePhoneChange}
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-error text-sm mb-4 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full mb-4"
              disabled={loading || phoneNumber.length !== 13 || !password}
            >
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>

          </form>

        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <span className="spinner w-8 h-8 border-primary" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
