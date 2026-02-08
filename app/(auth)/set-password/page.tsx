"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function SetPasswordPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [verificationToken, setVerificationToken] = useState<string | null>(
    null,
  );
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("verificationToken");
    const phone = sessionStorage.getItem("phoneNumber");

    if (!token || !phone) {
      router.push("/verify-phone");
      return;
    }

    setVerificationToken(token);
    setPhoneNumber(phone);
  }, [router]);

  const validatePassword = () => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      setError("Please enter your name");
      return;
    }

    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create account
      const res = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationToken,
          password,
          displayName: displayName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Clear session storage
      sessionStorage.removeItem("verificationToken");
      sessionStorage.removeItem("phoneNumber");

      // Auto sign in
      const signInResult = await signIn("credentials", {
        phoneNumber,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account created but sign in failed - redirect to sign in
        router.push("/sign-in?created=true");
      } else {
        // Success - go to registration to complete profile
        router.push("/register");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (!verificationToken) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link
          href="/verify-phone"
          className="w-10 h-10 rounded-full bg-[var(--muted)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
        >
          <svg
            className="w-5 h-5 text-[var(--foreground)]"
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
          <h1 className="heading-primary text-3xl text-[var(--primary)] mb-2">
            Create Account
          </h1>
          <p className="subtitle mb-8">Set up your profile and password</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                Full Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter your full name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setError("");
                }}
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-12"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
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

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
              />
            </div>

            {error && (
              <p className="text-[var(--error)] text-sm mb-4 flex items-center gap-2">
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
              className="btn btn-primary w-full"
              disabled={
                loading || !displayName || !password || !confirmPassword
              }
            >
              {loading ? <span className="spinner" /> : "Create Account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
