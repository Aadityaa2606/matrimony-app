"use client";

import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-between px-6 py-12">
        {/* Top Section - Logo */}
        <div
          className="flex flex-col items-center animate-fade-in"
          style={{ animationDelay: "0s" }}
        >
          <Image
            src="/logo.svg"
            alt="Matrimony Logo"
            width={80}
            height={80}
            className="mb-2"
          />
        </div>

        {/* Middle Section - Title and Illustration */}
        <div className="flex flex-col items-center text-center flex-1 justify-center">
          {/* Title */}
          <h1
            className="heading-primary text-4xl md:text-5xl text-[var(--primary)] mb-4 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Find Your
            <br />
            Perfect Match
          </h1>

          {/* Subtitle */}
          <p
            className="subtitle text-lg mb-10 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Where Tradition Meets Elegance
          </p>

          {/* Wedding Rings Illustration */}
          <div
            className="w-48 h-40 md:w-64 md:h-52 animate-fade-in-up animate-float"
            style={{ animationDelay: "0.3s" }}
          >
            <Image
              src="/wedding-rings.svg"
              alt="Wedding Rings"
              width={256}
              height={208}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Bottom Section - Get Started Button */}
        <div
          className="w-full max-w-sm animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            href="/verify-phone"
            className="btn btn-primary btn-pill w-full group"
          >
            <span>Get Started</span>
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>

          <Link
            href="/sign-in"
            className="block text-center text-[var(--muted-foreground)] mt-4 hover:text-[var(--primary)] transition-colors"
          >
            Already have an account?{" "}
            <span className="text-[var(--primary)] font-medium">Sign In</span>
          </Link>

          <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-[var(--primary)] hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-[var(--primary)] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
