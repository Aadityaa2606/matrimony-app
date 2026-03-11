"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="spinner w-8 h-8 border-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-center">
        <Image src="/logo.svg" alt="Logo" width={48} height={48} />
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="card w-full animate-fade-in text-center">
          {/* Success Animation */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-[var(--success)]/20 rounded-full animate-pulse-ring" />
            <div className="absolute inset-2 bg-[var(--success)]/30 rounded-full" />
            <div className="absolute inset-4 bg-[var(--success)] rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="heading-primary text-2xl text-[var(--primary)] mb-2">
            Payment Successful!
          </h1>

          <div className="elegant-divider my-4" />

          <h2 className="heading-secondary text-xl text-[var(--foreground)] mb-2">
            Profile Under Review
          </h2>
          <p className="subtitle mb-6">
            Our team is reviewing your profile. You&apos;ll be notified once
            it&apos;s approved.
          </p>

          {/* Status Card */}
          <div className="bg-[var(--muted)] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-3 h-3 bg-[var(--accent)] rounded-full animate-pulse" />
              <span className="font-medium text-[var(--foreground)]">
                Review in Progress
              </span>
            </div>
            <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Estimated time: 24-48 hours</span>
              </div>
              <div className="flex items-center gap-2">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span>We&apos;ll notify you via SMS & app</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="text-left mb-6">
            <h3 className="font-medium text-[var(--foreground)] mb-3">
              What happens next?
            </h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 font-medium">
                  1
                </span>
                <span className="text-[var(--muted-foreground)]">
                  Our team verifies your profile details
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 font-medium">
                  2
                </span>
                <span className="text-[var(--muted-foreground)]">
                  Your profile becomes visible to other members
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 font-medium">
                  3
                </span>
                <span className="text-[var(--muted-foreground)]">
                  Start connecting with matches!
                </span>
              </li>
            </ol>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/welcome" })}
            className="btn btn-outline w-full"
          >
            Sign Out
          </button>
        </div>

        <p className="text-xs text-[var(--muted-foreground)] mt-6 text-center">
          Questions? Contact us at support@matrimony.com
        </p>
      </main>
    </div>
  );
}
