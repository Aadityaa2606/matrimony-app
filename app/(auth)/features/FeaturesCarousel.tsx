"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { OutsideScreen } from "@/components/OutsideScreen";
import { GoldDivider, Medallion } from "@/components/Ornaments";
import { useT } from "@/components/LanguageProvider";

const SLIDES = [
  { d: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4", title: "feat.1.title", body: "feat.1.body" },
  { d: "M7 11V8a5 5 0 0110 0v3M5 11h14v10H5z M12 15v2", title: "feat.2.title", body: "feat.2.body" },
  { d: "M12 20c-4 0-8-3-9-8 4 0 7 2 9 8zm0 0c4 0 8-3 9-8-4 0-7 2-9 8zm0 0c-2.5-3-2.5-10 0-14 2.5 4 2.5 11 0 14z", title: "feat.3.title", body: "feat.3.body" },
  { d: "M7 5h10M7 9h10M8 5c5.5 0 5.5 8 0 8H7l7 7", title: "feat.4.title", body: "feat.4.body" },
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
            <Medallion d={s.d} className="size-28" />
            <h1 className="font-serif text-2xl font-bold text-primary">{t(s.title, { amount })}</h1>
            <GoldDivider />
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
