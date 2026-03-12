"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface FavoriteProfile {
  id: string;
  userId: string;
  fullName: string;
  displayName: string;
  age: number;
  gender: string;
  height: string;
  location: string;
  profession: string;
  education: string;
  community: string;
  profilePhoto: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (data.profiles) {
        setFavorites(data.profiles);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent, profileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoveLoading(profileId);

    try {
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      setFavorites((prev) => prev.filter((p) => p.id !== profileId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemoveLoading(null);
    }
  };

  if (status === "loading" || loading) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-serif font-semibold">My Favorites</h1>
          <p className="text-white/80 text-sm mt-1">
            Profiles you&apos;ve shown interest in
          </p>
        </div>
      </header>

      {/* Favorites List */}
      <main className="p-4 pt-10 max-w-2xl mx-auto -mt-4">
        {favorites.length === 0 ? (
          <div className="card text-center py-12 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-(--primary)/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
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
            </div>
            <h3 className="heading-secondary text-lg text-foreground mb-2">
              No Favorites Yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start exploring profiles and like the ones you&apos;re interested
              in!
            </p>
            <Link href="/home" className="btn btn-primary">
              Browse Profiles
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {favorites.length} favorite{favorites.length !== 1 ? "s" : ""}
              </span>
            </div>

            {favorites.map((profile, index) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.id}`}
                className="block"
              >
                <div
                  className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Profile Photo with gradient overlay */}
                  <div className="relative aspect-4/5">
                    <Image
                      src={profile.profilePhoto}
                      alt={profile.fullName}
                      fill
                      className="object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Liked badge */}
                    <div className="absolute top-4 right-4 bg-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-white">
                        Liked
                      </span>
                    </div>

                    {/* Profile Info - Overlaid on photo */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <h3 className="font-serif font-bold text-2xl mb-1 drop-shadow-lg">
                        {profile.fullName}
                      </h3>
                      <p className="text-white/90 text-sm mb-3">
                        {profile.age} years • {profile.height} •{" "}
                        {profile.community}
                      </p>

                      {/* Info chips */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {profile.location.split(",")[0]}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          {profile.profession}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 14l9-5-9-5-9 5 9 5z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                            />
                          </svg>
                          {profile.education.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white p-4 flex gap-3">
                    <button
                      onClick={(e) => handleRemove(e, profile.id)}
                      disabled={removeLoading === profile.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 border-border text-muted-foreground hover:border-error hover:text-error hover:bg-(--error)/5 transition-all font-medium"
                    >
                      {removeLoading === profile.id ? (
                        <span className="spinner w-5 h-5" />
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span>Remove</span>
                        </>
                      )}
                    </button>
                    <Link
                      href={`/profile/${profile.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-linear-to-r from-primary to-primary-light text-white hover:shadow-lg hover:shadow-(--primary)/30 transition-all font-medium"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>View Profile</span>
                    </Link>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
