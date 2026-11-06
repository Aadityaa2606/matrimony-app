import { Brand } from "@/components/Brand";
import { BandEdge, Gopuram, Jasmine, Lamp, Mandala, TempleSkyline, Toran } from "@/components/Ornaments";
import { LangToggle } from "@/components/LangToggle";

// Signed-out / onboarding frame: gold-bordered card, maroon band with toran and curved gold rim,
// content, then a temple skyline. `hero` adds the lamp, tower, jasmine and a large brand.
export function OutsideScreen({ children, hero = false }: { children: React.ReactNode; hero?: boolean }) {
  return (
    <div className="frame-page min-h-dvh p-2 sm:px-4 sm:py-8">
      <div className="frame mx-auto flex min-h-[calc(100dvh-1rem)] max-w-md flex-col overflow-hidden rounded-[30px] sm:min-h-[calc(100dvh-4rem)]">
        <header className="relative">
          <div className={`band relative overflow-hidden shadow-none ${hero ? "pb-6" : "pb-3"}`}>
            <Toran className="absolute inset-x-0 top-0 h-9" />
            <Mandala className={`absolute left-1/2 -translate-x-1/2 opacity-30 ${hero ? "top-6 size-72" : "-top-10 size-48"}`} />
            <div className="absolute right-3 top-10 z-10">
              <LangToggle onDark />
            </div>
            <div className={`relative ${hero ? "pb-28 pt-16" : "pt-12"}`}>
              <Brand size={hero ? "lg" : "sm"} />
            </div>
            {hero && (
              <>
                <Lamp className="absolute bottom-0 left-5 h-40 w-16" />
                <Gopuram className="absolute bottom-0 right-3 h-36 w-20" fill="#d9b45f" opacity={0.9} />
                <Jasmine className="absolute bottom-0 left-1/2 h-10 w-24 -translate-x-1/2" />
              </>
            )}
          </div>
          <BandEdge className="-mt-px" />
        </header>
        <div className="relative flex flex-1 flex-col px-6 pb-2 pt-4">{children}</div>
        <TempleSkyline className="h-24" />
      </div>
    </div>
  );
}
