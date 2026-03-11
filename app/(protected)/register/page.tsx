"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Types
type Gender = "BRIDE" | "GROOM";

interface FormData {
  // Personal
  fullName: string;
  gender: Gender | "";
  dateOfBirth: string;
  height: string;
  // Professional
  education: string;
  profession: string;
  salary: string;
  // Community
  location: string;
  community: string;
  subCaste: string;
  hasHoroscope: boolean | null;
  // Contact
  parentContact: string;
  // Photos
  profilePhoto: string;
  additionalPhotos: string[];
}

const initialFormData: FormData = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  height: "",
  education: "",
  profession: "",
  salary: "",
  location: "",
  community: "",
  subCaste: "",
  hasHoroscope: null,
  parentContact: "",
  profilePhoto: "",
  additionalPhotos: [],
};

const heightOptions = [
  "4'6\"",
  "4'7\"",
  "4'8\"",
  "4'9\"",
  "4'10\"",
  "4'11\"",
  "5'0\"",
  "5'1\"",
  "5'2\"",
  "5'3\"",
  "5'4\"",
  "5'5\"",
  "5'6\"",
  "5'7\"",
  "5'8\"",
  "5'9\"",
  "5'10\"",
  "5'11\"",
  "6'0\"",
  "6'1\"",
  "6'2\"",
  "6'3\"",
  "6'4\"",
  "6'5\"",
  "6'6\"",
];

const educationOptions = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Professional Degree (MD, JD, etc.)",
  "Other",
];

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 4;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  // Calculate age from DOB
  const calculateAge = useCallback((dob: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }, []);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | null | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }) as FormData);
    setError("");
  };

  const handlePhotoUpload = async (file: File, isProfile: boolean) => {
    setUploadingPhoto(true);
    setError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      if (isProfile) {
        setFormData((prev) => ({ ...prev, profilePhoto: data.url }));
      } else {
        setFormData((prev) => ({
          ...prev,
          additionalPhotos: [...prev.additionalPhotos, data.url].slice(0, 3),
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removeAdditionalPhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalPhotos: prev.additionalPhotos.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) return "Please enter your full name";
        if (!formData.gender) return "Please select your gender";
        if (!formData.dateOfBirth) return "Please enter your date of birth";
        const age = calculateAge(formData.dateOfBirth);
        if (age && age < 18) return "You must be at least 18 years old";
        if (!formData.height) return "Please select your height";
        return null;
      case 2:
        if (!formData.education) return "Please select your education";
        if (!formData.profession.trim()) return "Please enter your profession";
        return null;
      case 3:
        if (!formData.location.trim()) return "Please enter your location";
        if (!formData.community.trim())
          return "Please enter your community/caste";
        if (formData.hasHoroscope === null)
          return "Please select if you have a horoscope";
        if (!formData.parentContact.trim())
          return "Please enter parent contact number";
        return null;
      case 4:
        if (!formData.profilePhoto) return "Please upload a profile photo";
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      router.push("/payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
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

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
              step <= currentStep
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--primary)] transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-[var(--muted-foreground)]">
        <span>Personal</span>
        <span>Professional</span>
        <span>Community</span>
        <span>Photos</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="heading-secondary text-xl text-[var(--primary)] mb-4">
        Personal Information
      </h2>

      <div>
        <label className="block text-sm font-medium mb-2">Full Name *</label>
        <input
          type="text"
          className="input"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => handleInputChange("fullName", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">I am a *</label>
        <div className="grid grid-cols-2 gap-3">
          {(["BRIDE", "GROOM"] as const).map((gender) => (
            <button
              key={gender}
              type="button"
              className={`p-4 rounded-xl border-2 transition-all ${
                formData.gender === gender
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
              }`}
              onClick={() => handleInputChange("gender", gender)}
            >
              <div className="text-2xl mb-1">
                {gender === "BRIDE" ? "👰" : "🤵"}
              </div>
              <div className="font-medium">
                {gender === "BRIDE" ? "Bride" : "Groom"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Date of Birth *
        </label>
        <input
          type="date"
          className="input"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
          max={
            new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              .toISOString()
              .split("T")[0]
          }
        />
        {formData.dateOfBirth && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Age: {calculateAge(formData.dateOfBirth)} years
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Height *</label>
        <select
          className="input"
          value={formData.height}
          onChange={(e) => handleInputChange("height", e.target.value)}
        >
          <option value="">Select height</option>
          {heightOptions.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="heading-secondary text-xl text-[var(--primary)] mb-4">
        Professional Information
      </h2>

      <div>
        <label className="block text-sm font-medium mb-2">Education *</label>
        <select
          className="input"
          value={formData.education}
          onChange={(e) => handleInputChange("education", e.target.value)}
        >
          <option value="">Select education</option>
          {educationOptions.map((edu) => (
            <option key={edu} value={edu}>
              {edu}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Profession *</label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Software Engineer, Doctor, Business"
          value={formData.profession}
          onChange={(e) => handleInputChange("profession", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Annual Salary{" "}
          <span className="text-[var(--muted-foreground)]">(Optional)</span>
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., 10-15 LPA"
          value={formData.salary}
          onChange={(e) => handleInputChange("salary", e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="heading-secondary text-xl text-[var(--primary)] mb-4">
        Community & Contact
      </h2>

      <div>
        <label className="block text-sm font-medium mb-2">Location *</label>
        <input
          type="text"
          className="input"
          placeholder="City, State"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Community / Caste *
        </label>
        <input
          type="text"
          className="input"
          placeholder="Enter your community"
          value={formData.community}
          onChange={(e) => handleInputChange("community", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Sub-caste{" "}
          <span className="text-[var(--muted-foreground)]">(Optional)</span>
        </label>
        <input
          type="text"
          className="input"
          placeholder="Enter sub-caste if applicable"
          value={formData.subCaste}
          onChange={(e) => handleInputChange("subCaste", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Do you have a horoscope? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              className={`p-3 rounded-xl border-2 transition-all ${
                formData.hasHoroscope === value
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
              }`}
              onClick={() => handleInputChange("hasHoroscope", value)}
            >
              <div className="font-medium">{value ? "Yes" : "No"}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Parent Contact Number *
        </label>
        <input
          type="tel"
          className="input"
          placeholder="+91 00000 00000"
          value={formData.parentContact}
          onChange={(e) => handleInputChange("parentContact", e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="heading-secondary text-xl text-[var(--primary)] mb-4">
        Profile Photos
      </h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          Profile Photo *
        </label>
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          This will be your main profile picture
        </p>

        {formData.profilePhoto ? (
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={formData.profilePhoto}
              alt="Profile"
              fill
              className="object-cover rounded-xl"
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--error)] text-white rounded-full flex items-center justify-center"
              onClick={() => handleInputChange("profilePhoto", "")}
            >
              ×
            </button>
          </div>
        ) : (
          <label className="block w-32 h-32 mx-auto border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--primary)] transition-colors">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file, true);
              }}
              disabled={uploadingPhoto}
            />
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--muted-foreground)]">
              {uploadingPhoto ? (
                <span className="spinner" />
              ) : (
                <>
                  <svg
                    className="w-8 h-8 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-xs">Upload</span>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Additional Photos{" "}
          <span className="text-[var(--muted-foreground)]">(Up to 3)</span>
        </label>
        <p className="text-sm text-[var(--muted-foreground)] mb-3">
          Add more photos to make your profile stand out
        </p>

        <div className="grid grid-cols-3 gap-3">
          {formData.additionalPhotos.map((photo, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={photo}
                alt={`Additional ${index + 1}`}
                fill
                className="object-cover rounded-xl"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--error)] text-white rounded-full flex items-center justify-center"
                onClick={() => removeAdditionalPhoto(index)}
              >
                ×
              </button>
            </div>
          ))}

          {formData.additionalPhotos.length < 3 && (
            <label className="aspect-square border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:border-[var(--primary)] transition-colors">
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file, false);
                }}
                disabled={uploadingPhoto}
              />
              <div className="w-full h-full flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                {uploadingPhoto ? (
                  <span className="spinner" />
                ) : (
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={
            currentStep > 1 ? handleBack : () => router.push("/dashboard")
          }
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
      <main className="px-6 py-4 max-w-md mx-auto">
        <h1 className="heading-primary text-2xl text-[var(--primary)] mb-2">
          Complete Your Profile
        </h1>
        <p className="subtitle mb-6">
          Step {currentStep} of {totalSteps}
        </p>

        {renderProgressBar()}

        <div className="card">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {error && (
            <p className="text-[var(--error)] text-sm mt-4 flex items-center gap-2">
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

          <div className="mt-6">
            {currentStep < totalSteps ? (
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={handleNext}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner" />
                ) : (
                  "Submit & Proceed to Payment"
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
