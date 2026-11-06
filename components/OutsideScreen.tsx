import { Brand } from "@/components/Brand";
import { TempleSkyline } from "@/components/Ornaments";
import { LangToggle } from "@/components/LangToggle";

// Signed-out / onboarding frame: maroon brand band, content sheet, temple skyline at the foot.
export function OutsideScreen({ children, hero = false }: { children: React.ReactNode; hero?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className={`band relative rounded-b-[32px] px-6 ${hero ? "pb-14 pt-12" : "pb-8 pt-6"}`}>
        <div className="absolute right-4 top-4">
          <LangToggle onDark />
        </div>
        <div className={hero ? "pt-4" : ""}>
          <Brand size={hero ? "lg" : "sm"} />
        </div>
      </header>
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-4 pt-8">{children}</div>
      <TempleSkyline className="mx-auto h-24 max-w-md" />
    </div>
  );
}
