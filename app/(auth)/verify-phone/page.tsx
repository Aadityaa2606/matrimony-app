"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Step = "phone" | "otp";

function VerifyPhoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // "reset" for password reset flow

  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except the leading +
    const cleaned = value.replace(/[^\d+]/g, "");

    // If starts with digits (no +91), add it
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

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 13) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // For dev mode, show OTP in console
      if (data.devOtp) {
        console.log("📱 Dev OTP:", data.devOtp);
      }

      setStep("otp");
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus last filled input
    const lastIndex = Math.min(pasted.length - 1, 5);
    otpRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      // Store verification token for next step
      sessionStorage.setItem("verificationToken", data.verificationToken);
      sessionStorage.setItem("phoneNumber", phoneNumber);

      if (mode === "reset") {
        // Password reset flow
        router.push("/reset-password?step=new");
      } else if (data.userExists) {
        // User exists, go to sign in
        router.push("/sign-in?verified=true");
      } else {
        // New user, go to set password
        router.push("/set-password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link
          href={step === "otp" ? "#" : "/welcome"}
          onClick={(e) => {
            if (step === "otp") {
              e.preventDefault();
              setStep("phone");
              setOtp(["", "", "", "", "", ""]);
              setError("");
            }
          }}
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
          {step === "phone" ? (
            <>
              <h1 className="heading-primary text-3xl text-primary mb-2">
                {mode === "reset" ? "Reset Password" : "Enter Your Phone"}
              </h1>
              <p className="subtitle mb-8">
                {mode === "reset"
                  ? "We'll send an OTP to verify it's you"
                  : "We'll send you a one-time password to verify"}
              </p>

              <div className="mb-6">
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
                className="btn btn-primary w-full"
                onClick={handleSendOtp}
                disabled={loading || phoneNumber.length !== 13}
              >
                {loading ? <span className="spinner" /> : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <h1 className="heading-primary text-3xl text-primary mb-2">
                Verify OTP
              </h1>
              <p className="subtitle mb-8">
                Enter the 6-digit code sent to
                <br />
                <span className="text-foreground font-medium">
                  {phoneNumber}
                </span>
              </p>

              {/* OTP Inputs */}
              <div
                className="flex justify-center gap-2 mb-6"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="text-error text-sm text-center mb-4 flex items-center justify-center gap-2">
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
                className="btn btn-primary w-full mb-4"
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
              >
                {loading ? <span className="spinner" /> : "Verify"}
              </button>

              <button
                className="w-full text-center text-muted-foreground disabled:opacity-50 hover:text-foreground transition-colors"
                onClick={handleResendOtp}
                disabled={countdown > 0}
              >
                {countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  <span className="text-primary">Resend OTP</span>
                )}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <span className="spinner w-8 h-8 border-primary" />
        </div>
      }
    >
      <VerifyPhoneContent />
    </Suspense>
  );
}
