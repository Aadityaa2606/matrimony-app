import { Brand } from "@/components/Brand";
import { Garland } from "@/components/Garland";
import { LangToggle } from "@/components/LangToggle";

export function OutsideScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <Garland variant="full" />
      <div className="relative mx-auto flex w-full max-w-md flex-col px-6 pb-8 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <Brand size="sm" />
          <LangToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
