"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { OutsideScreen } from "@/components/OutsideScreen";
import { useT } from "@/components/LanguageProvider";

const SLIDES = [
  { icon: "✓", title: "feat.1.title", body: "feat.1.body" },
  { icon: "🔒", title: "feat.2.title", body: "feat.2.body" },
  { icon: "❀", title: "feat.3.title", body: "feat.3.body" },
  { icon: "₹", title: "feat.4.title", body: "feat.4.body" },
] as const;

export function FeaturesCarousel({ amount }: { amount: number }) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;

  const go = (n: number) => ref.current?.scrollTo({ left: n * ref.current.clientWidth, behavior: "smooth" });

  return (
    <OutsideScreen>
      <div
        ref={ref}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="mt-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((s) => (
          <section key={s.title} className="flex w-full shrink-0 snap-center flex-col items-center gap-4 px-2 py-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent bg-white text-4xl text-primary">
              {s.icon}
            </div>
            <h1 className="font-serif text-2xl font-bold text-primary">{t(s.title, { amount })}</h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{t(s.body)}</p>
          </section>
        ))}
      </div>
      <div className="my-4 flex justify-center">
        {SLIDES.map((s, n) => (
          <button
            key={s.title}
            type="button"
            aria-label={t("feat.dot", { n: n + 1 })}
            onClick={() => go(n)}
            className="flex h-12 w-8 items-center justify-center"
          >
            <span className={`h-2.5 rounded-full ${n === i ? "w-6 bg-primary" : "w-2.5 bg-accent/50"}`} />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {last ? (
          <Link href="/sign-up" className="btn btn-primary btn-pill w-full">
            {t("feat.start")}
          </Link>
        ) : (
          <button type="button" onClick={() => go(i + 1)} className="btn btn-primary btn-pill w-full">
            {t("common.next")}
          </button>
        )}
        {!last && (
          <Link href="/sign-up" className="btn w-full text-primary">
            {t("common.skip")}
          </Link>
        )}
      </div>
    </OutsideScreen>
  );
}
