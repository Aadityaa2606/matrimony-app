"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type UserStatus =
  | "PENDING_PROFILE"
  | "PENDING_PAYMENT"
  | "PENDING_REVIEW"
  | "ACTIVE";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    if (status === "authenticated") {
      // Fetch user status
      fetch("/api/user/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            setUserStatus(data.status);
            // Redirect based on status
            switch (data.status) {
              case "PENDING_PROFILE":
                router.push("/register");
                break;
              case "PENDING_PAYMENT":
                router.push("/payment");
                break;
              case "PENDING_REVIEW":
                router.push("/review");
                break;
              case "ACTIVE":
                setLoading(false);
                break;
            }
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <span className="spinner w-8 h-8 border-[var(--primary)]" />
      </div>
    );
  }

  if (!session || userStatus !== "ACTIVE") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <p className="text-white/80 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-serif font-semibold">
              {session.user?.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="opacity-80"
            />
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 max-w-2xl mx-auto">
        <div className="card animate-fade-in">
          <h2 className="heading-secondary text-xl text-[var(--primary)] mb-4">
            Your Profile
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[var(--primary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Phone</p>
                <p className="font-medium">
                  {(session.user as any)?.phone || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[var(--muted)] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[var(--success)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Status</p>
                <p className="font-medium text-[var(--success)]">Active</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/welcome" })}
            className="btn btn-outline w-full mt-6"
          >
            Sign Out
          </button>
        </div>

        <div className="mt-6 text-center text-[var(--muted-foreground)] text-sm">
          <p>🎉 You're all set!</p>
          <p className="mt-1">Your profile is verified and ready.</p>
        </div>
      </main>
    </div>
  );
}
