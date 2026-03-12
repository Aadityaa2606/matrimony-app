"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface ProfileDetail {
  id: string;
  userId: string;
  fullName: string;
  displayName: string;
  age: number;
  gender: string;
  dateOfBirth: string;
  height: string;
  location: string;
  profession: string;
  education: string;
  salary: string | null;
  community: string;
  subCaste: string | null;
  hasHoroscope: boolean;
  parentContact: string;
  profilePhoto: string;
  additionalPhotos: string[];
}

export default function ProfileDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const profileId = params.id as string;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profiles/${profileId}`);
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setIsFavorite(data.isFavorite);
        } else {
          router.push("/home");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/home");
      } finally {
        setLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    if (status === "authenticated" && profileId) {
      loadProfile();
    }
  }, [status, profileId, router]);

  const toggleFavorite = async () => {
    if (!profile) return;
    setActionLoading(true);

    try {
      if (isFavorite) {
        await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profile.id }),
        });
        setIsFavorite(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: profile.id }),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="spinner w-8 h-8 border-primary" />
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  const allPhotos = [profile.profilePhoto, ...profile.additionalPhotos];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="fixed top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
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
        </button>
        <button
          onClick={toggleFavorite}
          disabled={actionLoading}
          className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isFavorite
              ? "bg-primary text-white"
              : "bg-white/90 text-muted-foreground hover:text-primary"
          }`}
        >
          {actionLoading ? (
            <span className="spinner w-4 h-4" />
          ) : (
            <svg
              className="w-5 h-5"
              fill={isFavorite ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
      </header>

      {/* Photo Gallery */}
      <div className="relative h-96 bg-muted">
        <Image
          src={allPhotos[currentPhotoIndex]}
          alt={profile.fullName}
          fill
          className="object-cover"
        />
        {/* Photo Indicators */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {allPhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPhotoIndex
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
        {/* Navigation Arrows */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentPhotoIndex((prev) =>
                  prev === 0 ? allPhotos.length - 1 : prev - 1,
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setCurrentPhotoIndex((prev) =>
                  prev === allPhotos.length - 1 ? 0 : prev + 1,
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
            >
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Profile Info */}
      <main className="p-6 max-w-2xl mx-auto -mt-8 relative">
        <div className="card animate-fade-in">
          {/* Basic Info */}
          <div className="text-center mb-6">
            <h1 className="heading-primary text-2xl text-primary">
              {profile.fullName}
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile.age} yrs • {profile.height} • {profile.gender}
            </p>
          </div>

          <div className="elegant-divider mb-6" />

          {/* Personal Details */}
          <section className="mb-6">
            <h2 className="heading-secondary text-lg text-primary mb-4 flex items-center gap-2">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Personal Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Location" value={profile.location} />
              <InfoItem label="Community" value={profile.community} />
              {profile.subCaste && (
                <InfoItem label="Sub-caste" value={profile.subCaste} />
              )}
              <InfoItem
                label="Horoscope"
                value={profile.hasHoroscope ? "Available" : "Not Available"}
              />
            </div>
          </section>

          {/* Professional Details */}
          <section className="mb-6">
            <h2 className="heading-secondary text-lg text-primary mb-4 flex items-center gap-2">
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
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Professional Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Education" value={profile.education} />
              <InfoItem label="Profession" value={profile.profession} />
              {profile.salary && (
                <InfoItem label="Annual Income" value={profile.salary} />
              )}
            </div>
          </section>

          {/* Contact Details */}
          <section>
            <h2 className="heading-secondary text-lg text-primary mb-4 flex items-center gap-2">
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Contact Information
            </h2>
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">
                Parent Contact
              </p>
              <p className="font-medium text-lg">{profile.parentContact}</p>
            </div>
          </section>

          {/* Message Button */}
          {profile.userId !== session?.user?.id && (
            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={async () => {
                  if (!session?.user?.id || !profile) return;
                  setChatLoading(true);
                  try {
                    const res = await fetch("/api/chat/channel", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ otherUserId: profile.userId }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    router.push(`/chats/${data.channelId}`);
                  } catch (error) {
                    console.error("Error starting chat:", error);
                  } finally {
                    setChatLoading(false);
                  }
                }}
                disabled={chatLoading}
                className="btn btn-primary w-full btn-pill gap-3"
              >
                {chatLoading ? (
                  <span className="spinner w-5 h-5" />
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                )}
                {chatLoading ? "Opening Chat..." : "Message"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-muted rounded-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
