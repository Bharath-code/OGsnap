"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAction } from "convex/react";
import type { FunctionReference } from "convex/server";
import { 
  Sparkles, 
  Layers, 
  Image as ImageIcon, 
  Copy, 
  Check, 
  Loader2, 
  Twitter, 
  Linkedin, 
  FileText,
  AlertTriangle,
  Info
} from "lucide-react";
import { useRendersDashboardData } from "@/lib/dashboard-live";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";

const generateImageAction = "render/actions:generateImage" as unknown as FunctionReference<"action">;

interface RenderMetadata {
  altText: string;
  twitterCopy: string;
  linkedinCopy: string;
}

interface RenderSingleResult {
  imageUrl: string;
  metadata?: RenderMetadata;
  renderTimeMs: number;
}

interface RenderMultiResult {
  images: Record<string, string>;
  metadata?: RenderMetadata;
  renderTimeMs: number;
}

type SizeKey = "og" | "twitter" | "linkedin" | "slack" | "discord" | "square" | "story";

const SIZE_LABELS: Record<SizeKey, { label: string; dimensions: string }> = {
  og: { label: "Open Graph", dimensions: "1200 x 630" },
  twitter: { label: "Twitter Post", dimensions: "1200 x 675" },
  linkedin: { label: "LinkedIn Card", dimensions: "1200 x 627" },
  slack: { label: "Slack Preview", dimensions: "1200 x 630" },
  discord: { label: "Discord Card", dimensions: "1200 x 630" },
  square: { label: "Square Asset", dimensions: "1080 x 1080" },
  story: { label: "Story / Vertical", dimensions: "1080 x 1920" },
};

export default function PlaygroundPage() {
  const { userId: clerkId } = useAuth();
  const payload = useRendersDashboardData(clerkId);
  const generateImage = useAction(generateImageAction);

  // Form states
  const [url, setUrl] = useState("https://example.com/blog/getting-started");
  const [title, setTitle] = useState("Scale Your Visual Asset Delivery with OGSnap");
  const [description, setDescription] = useState("A brand-aware rendering pipeline built for modern frontend engineering teams.");
  const [multi, setMulti] = useState(true);
  const [polish, setPolish] = useState(true);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<RenderSingleResult | null>(null);
  const [multiResult, setMultiResult] = useState<RenderMultiResult | null>(null);

  // UI States
  const [selectedSize, setSelectedSize] = useState<SizeKey>("og");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isFreePlan = payload?.usage?.plan === "free";

  const triggerCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  async function handleGenerate() {
    if (!payload?.user?.id) {
      setError("User profile not loaded yet. Please wait.");
      return;
    }

    setLoading(true);
    setError(null);
    setSingleResult(null);
    setMultiResult(null);

    try {
      const response = await generateImage({
        userId: payload.user.id as any,
        plan: payload.usage.plan,
        url,
        title: title || undefined,
        description: description || undefined,
        multi,
        polish,
      });

      if (multi) {
        setMultiResult(response as RenderMultiResult);
        setSelectedSize("og");
      } else {
        setSingleResult(response as RenderSingleResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate assets");
    } finally {
      setLoading(false);
    }
  }

  const activeImageUrl = multi
    ? multiResult?.images[selectedSize]
    : singleResult?.imageUrl;

  const activeMetadata = multi ? multiResult?.metadata : singleResult?.metadata;
  const renderTimeMs = multi ? multiResult?.renderTimeMs : singleResult?.renderTimeMs;

  return (
    <div className="space-y-6">
      <Reveal>
        <Card className="overflow-hidden border-border/70 bg-card/75">
          <CardHeader className="relative pb-6">
            <div className="pointer-events-none absolute right-4 top-4 h-16 w-16 rounded-full bg-primary/10 blur-xl" />
            <Badge className="w-fit mb-1.5 bg-primary/15 text-primary hover:bg-primary/20 border-none">
              Dev Sandbox
            </Badge>
            <CardTitle className="flex items-center gap-2 text-2xl font-display">
              <Sparkles className="h-5 w-5 text-primary" />
              API Playground
            </CardTitle>
            <CardDescription>
              Interactively test the rendering engine. See how multi-platform compositions and AI copywriting polish work in one API request.
            </CardDescription>
          </CardHeader>
        </Card>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Left Column: Form Controls */}
        <Reveal delay={80}>
          <Card className="h-fit border-border/70 bg-card/75">
            <CardHeader>
              <CardTitle className="text-lg">Parameters</CardTitle>
              <CardDescription>Configure the request payload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Page URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourdomain.com/path"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title (Optional)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Main header text"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Subtext explanation"
                  disabled={loading}
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/40 hover:bg-background/60 transition">
                  <label htmlFor="multi-size-checkbox" className="space-y-0.5 pr-2 cursor-pointer flex-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      Multi-Platform Sizes
                    </span>
                    <span className="text-xs text-muted-foreground block leading-tight">
                      Render 7 social crop dimensions in parallel
                    </span>
                  </label>
                  <input
                    id="multi-size-checkbox"
                    type="checkbox"
                    checked={multi}
                    onChange={(e) => setMulti(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/40 hover:bg-background/60 transition">
                  <label htmlFor="ai-copy-checkbox" className="space-y-0.5 pr-2 cursor-pointer flex-1">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      AI Copy Polish
                    </span>
                    <span className="text-xs text-muted-foreground block leading-tight">
                      Generate optimized Alt text, tweets, and posts
                    </span>
                  </label>
                  <input
                    id="ai-copy-checkbox"
                    type="checkbox"
                    checked={polish}
                    onChange={(e) => setPolish(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  />
                </div>
              </div>

              {isFreePlan && (
                <div role="alert" className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs">
                  <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong>Free Tier Notice:</strong> Renders are processed using the low-latency <strong>Satori Engine</strong> and will include an OGSnap watermark. Upgrade to remove.
                  </div>
                </div>
              )}

              {error && (
                <div role="alert" className="flex gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" aria-hidden="true" />
                  <div className="break-all">{error}</div>
                </div>
              )}

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !url}
                className="w-full h-11 text-base flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Assets...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Assets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        {/* Right Column: Previews and Copied Metadata */}
        <Reveal delay={160}>
          <div className="space-y-6">
            {/* Main Preview Card */}
            <Card className="border-border/70 bg-card/75 overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Visual Output Previews
                  </CardTitle>
                  <CardDescription>
                    {renderTimeMs ? `Generated in ${renderTimeMs}ms` : "Generate an asset to view outputs"}
                  </CardDescription>
                </div>
                {activeImageUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 shrink-0 border-border/80 bg-background/50 hover:bg-background"
                    onClick={() => triggerCopy(activeImageUrl, "main-url")}
                  >
                    {copiedKey === "main-url" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        Copied URL!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Image URL
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-10 w-10 animate-ping rounded-full bg-primary/20" />
                      <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                      Running parallel renders and copywriting engines...
                    </p>
                  </div>
                ) : activeImageUrl ? (
                  <div className="p-4 bg-muted/30">
                    <div className="flex flex-col gap-4">
                      {/* Image Viewer Container */}
                      <div
                        id="image-preview-panel"
                        role="tabpanel"
                        aria-label="Social Image Preview"
                        className="relative overflow-hidden rounded-lg border border-border/80 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,8px_0] bg-white flex items-center justify-center p-4"
                      >
                        <img
                          src={activeImageUrl}
                          alt={`Rendered preview of size ${SIZE_LABELS[selectedSize]?.label || selectedSize}`}
                          className="max-h-[380px] w-auto max-w-full rounded-md shadow-lg object-contain transition-all duration-300"
                        />
                      </div>

                      {/* Selector Tabs for Sizes */}
                      {multi && multiResult && (
                        <div className="space-y-2.5">
                          <span id="size-selector-label" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                            Target Social Sizes ({Object.keys(multiResult.images).length})
                          </span>
                          <div className="flex flex-wrap gap-2" role="tablist" aria-labelledby="size-selector-label">
                            {(Object.keys(multiResult.images) as SizeKey[]).map((key) => {
                              const active = selectedSize === key;
                              return (
                                <button
                                  key={key}
                                  role="tab"
                                  aria-selected={active}
                                  aria-controls="image-preview-panel"
                                  onClick={() => setSelectedSize(key)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
                                    active
                                      ? "bg-primary border-primary text-white shadow-md"
                                      : "bg-background border-border/60 hover:border-border text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <span>{SIZE_LABELS[key]?.label || key}</span>
                                  <span className={`opacity-80 text-[10px] px-1 rounded ${active ? "bg-white/25 text-white" : "bg-muted/80"}`}>
                                    {SIZE_LABELS[key]?.dimensions}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium">Ready to render.</p>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1">
                      Configure your post parameters on the left and click "Generate Assets" to fetch live image and copy results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Copywriting Output Card */}
            {polish && (activeMetadata || loading) && (
              <Card className="border-border/70 bg-card/75 overflow-hidden">
                <CardHeader className="border-b border-border/60 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Social Copywriter
                  </CardTitle>
                  <CardDescription>
                    Automatically generated copy matched to your visual assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {loading ? (
                    <div className="space-y-3 animate-pulse py-4">
                      <div className="h-3 w-1/4 rounded bg-muted" />
                      <div className="h-16 rounded bg-muted" />
                      <div className="h-3 w-1/3 rounded bg-muted" />
                      <div className="h-20 rounded bg-muted" />
                    </div>
                  ) : activeMetadata ? (
                    <div className="space-y-4">
                      {/* Alt Text */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            Accessibility Alt Text
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => triggerCopy(activeMetadata.altText, "alt")}
                          >
                            {copiedKey === "alt" ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <div className="p-3 rounded-lg border border-border/50 bg-background/50 text-sm italic text-foreground/90">
                          "{activeMetadata.altText}"
                        </div>
                      </div>

                      {/* Twitter / X copy */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Twitter className="h-3.5 w-3.5 text-primary" />
                            Suggested Tweet
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => triggerCopy(activeMetadata.twitterCopy, "twitter")}
                          >
                            {copiedKey === "twitter" ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <div className="p-3 rounded-lg border border-border/50 bg-background/50 text-sm text-foreground/90 whitespace-pre-wrap">
                          {activeMetadata.twitterCopy}
                        </div>
                      </div>

                      {/* LinkedIn copy */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Linkedin className="h-3.5 w-3.5 text-primary" />
                            Suggested LinkedIn Post
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => triggerCopy(activeMetadata.linkedinCopy, "linkedin")}
                          >
                            {copiedKey === "linkedin" ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Copy
                          </Button>
                        </div>
                        <div className="p-3 rounded-lg border border-border/50 bg-background/50 text-sm text-foreground/90 whitespace-pre-wrap">
                          {activeMetadata.linkedinCopy}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
