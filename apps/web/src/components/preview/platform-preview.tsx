import { BlankCard } from "./og-card";

export const PLATFORMS = ["X", "LinkedIn", "Slack", "iMessage"] as const;
export type Platform = (typeof PLATFORMS)[number];

interface PlatformPreviewProps {
  platform: Platform;
  image?: string;
  domain: string;
  title?: string;
  siteName?: string;
  description?: string;
}

function Picture({ image, domain, className = "" }: { image?: string; domain: string; className?: string }) {
  return image ? (
    <img src={image} alt={`Link preview image for ${domain}`} className={`aspect-[1.91/1] w-full object-cover ${className}`} />
  ) : (
    <div className={`overflow-hidden ${className}`}>
      <BlankCard />
    </div>
  );
}

// Generic renditions of how each app shows a shared link; deliberately not pixel copies of their UI.
export function PlatformPreview({ platform, image, domain, title = domain, siteName = domain, description }: PlatformPreviewProps) {
  if (platform === "X") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <Picture image={image} domain={domain} />
        <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{domain}</span>
      </div>
    );
  }
  if (platform === "LinkedIn") {
    return (
      <div className="overflow-hidden rounded-lg border border-border">
        <Picture image={image} domain={domain} />
        <div className="space-y-1 bg-background p-3">
          <p className="line-clamp-2 text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{domain}</p>
        </div>
      </div>
    );
  }
  if (platform === "Slack") {
    return (
      <div className="space-y-1 border-l-4 border-fog-deep pl-3">
        <p className="text-sm font-bold">{siteName}</p>
        <p className="text-sm font-semibold underline decoration-fog-deep underline-offset-2">{title}</p>
        {description ? <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p> : null}
        <Picture image={image} domain={domain} className="mt-2 max-w-[360px] rounded-md" />
      </div>
    );
  }
  return (
    <div className="ml-auto w-[85%] overflow-hidden rounded-[18px] rounded-br-md bg-background">
      <Picture image={image} domain={domain} />
      <div className="grid gap-0.5 px-3.5 pb-3 pt-2.5">
        <b className="line-clamp-1 text-sm font-semibold">{title}</b>
        <span className="font-mono text-xs text-muted-foreground">{domain}</span>
      </div>
    </div>
  );
}
