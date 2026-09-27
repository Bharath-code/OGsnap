import type { CSSProperties } from "react";
import type { DemoBrand } from "./brands";

export function OgCard({ brand }: { brand: DemoBrand }) {
  return (
    <div
      className="og-card"
      style={{ "--og-bg": brand.bg, "--og-fg": brand.fg } as CSSProperties}
      role="img"
      aria-label={`Link preview for ${brand.domain}: ${brand.title}`}
    >
      <div className="absolute -right-[8cqi] -top-[10cqi] aspect-square w-[46cqi] rounded-full" style={{ background: brand.accent }} />
      <div className="absolute right-[14cqi] top-[26cqi] aspect-square w-[18cqi] rounded-full border-[1.4cqi] border-current opacity-25" />
      <div className="absolute inset-0 flex flex-col p-[7cqi] pb-[6cqi]">
        <div className="flex items-center gap-[2.4cqi] text-[3.6cqi] font-semibold leading-none opacity-90">
          <span
            className="grid aspect-square w-[7cqi] place-items-center rounded-[2cqi] font-display text-[4.4cqi] font-black"
            style={{ background: brand.accent, color: brand.bg }}
          >
            {brand.name[0]}
          </span>
          {brand.domain}
        </div>
        <p className="og-card-title mt-auto">{brand.title}</p>
        <p className="mt-[3cqi] font-mono text-[3cqi] leading-none opacity-70">{brand.domain}</p>
      </div>
    </div>
  );
}

export function BlankCard({ label = "No og:image" }: { label?: string }) {
  return <div className="og-card-blank">{label}</div>;
}
