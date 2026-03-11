"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Complete payment (placeholder)
      const res = await fetch("/api/payment/complete", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment failed");
      }

      router.push("/review");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <span className="spinner w-8 h-8 border-[var(--primary)]" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/register")}
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
        </button>
        <Image src="/logo.svg" alt="Logo" width={40} height={40} />
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="card w-full animate-fade-in text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-[var(--accent)]/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[var(--accent)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>

          <h1 className="heading-primary text-2xl text-[var(--primary)] mb-2">
            Complete Your Registration
          </h1>
          <p className="subtitle mb-6">
            Make a one-time payment to activate your profile
          </p>

          {/* Price Card */}
          <div className="bg-[var(--muted)] rounded-xl p-6 mb-6">
            <p className="text-sm text-[var(--muted-foreground)] mb-1">
              Registration Fee
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-serif font-bold text-[var(--primary)]">
                ₹500
              </span>
              <span className="text-[var(--muted-foreground)]">/one-time</span>
            </div>
          </div>

          {/* Features */}
          <div className="text-left space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-[var(--success)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm">
                Verified profile visible to all members
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-[var(--success)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm">
                Send unlimited connection requests
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-[var(--success)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm">Access to premium matches</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-[var(--success)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm">Priority customer support</span>
            </div>
          </div>

          {error && (
            <p className="text-[var(--error)] text-sm mb-4 flex items-center justify-center gap-2">
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
            onClick={handlePayment}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="spinner" />
                Processing...
              </>
            ) : (
              "Pay ₹500 Now"
            )}
          </button>

          <p className="text-xs text-[var(--muted-foreground)] mt-4">
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
      </main>
    </div>
  );
}
