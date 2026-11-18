import { Brand } from "@/components/Brand";
import { BandEdge, Gopuram, Jasmine, Lamp, Mandala, TempleSkyline, Toran } from "@/components/Ornaments";
import { LangToggle } from "@/components/LangToggle";

// Signed-out / onboarding frame: gold-bordered card, maroon band with toran and curved gold rim,
// content, then a temple skyline. `hero` adds the lamp, tower, jasmine and a large brand.
export function OutsideScreen({ children, hero = false }: { children: React.ReactNode; hero?: boolean }) {
  return (
    // 100dvh tracks each browser's visible area (address/tool bars), so the frame always fits the screen.
    // Only the content area scrolls, and only when a form can't fit (long registration, open keyboard).
    <div className="frame-page h-dvh overflow-hidden p-2 sm:px-4 sm:py-8 short:sm:py-3">
      <div className="frame mx-auto flex h-full max-w-md flex-col overflow-hidden rounded-[30px]">
        <header className="relative shrink-0">
          <div className={`band relative overflow-hidden shadow-none ${hero ? "pb-6" : "pb-3"}`}>
            <Toran className="absolute inset-x-0 top-0 h-9 tiny:h-7" />
            <Mandala className={`absolute left-1/2 -translate-x-1/2 opacity-30 ${hero ? "top-6 size-72 short:top-2 short:size-56" : "-top-10 size-48"}`} />
            <div className="absolute right-3 top-10 z-10 short:top-9 tiny:top-7">
              <LangToggle onDark />
            </div>
            <div className={`relative ${hero ? "pb-28 pt-16 short:pb-20 short:pt-11 tiny:pb-14 tiny:pt-10 mini:pb-10 mini:pt-8" : "pt-12 short:pt-10 tiny:pt-8"}`}>
              <Brand size={hero ? "lg" : "sm"} />
            </div>
            {hero && (
              <>
                <Lamp className="absolute bottom-0 left-5 h-40 w-16 short:h-28 short:w-12 tiny:h-20 tiny:w-9 mini:h-14 mini:w-7" />
                <Gopuram className="absolute bottom-0 right-3 h-36 w-20 short:h-24 short:w-14 tiny:h-16 tiny:w-10 mini:h-12 mini:w-8" fill="#d9b45f" opacity={0.9} />
                <Jasmine className="absolute bottom-0 left-1/2 h-10 w-24 -translate-x-1/2 tiny:h-7 tiny:w-16" />
              </>
            )}
          </div>
          <BandEdge className="-mt-px short:h-7" />
        </header>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-6 pb-2 pt-4 short:pt-2">{children}</div>
        <TempleSkyline className="h-24 shrink-0 short:h-14 tiny:hidden" />
      </div>
    </div>
  );
}
