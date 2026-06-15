export interface ExtractedBrand {
  logoUrl?: string;
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  accentColor?: string;
}

export async function extractBrandFromScreenshot(
  screenshotUrl: string
): Promise<ExtractedBrand | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!openAiKey && !anthropicKey) {
    console.warn("Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY is configured.");
    return null;
  }

  const systemPrompt = `Analyze this website screenshot and extract the brand guidelines/visual identity:
1. logoUrl (string or null): If you see a clear logo image, extract its URL if visible on the page source, or return null.
2. primaryColor (hex string, e.g., "#3B82F6"): The dominant brand color used for primary elements/buttons.
3. backgroundColor (hex string, e.g., "#0F172A"): The main background color of the body or hero section.
4. fontFamily (string, e.g., "Inter"): The primary font family style visible.
5. accentColor (hex string or null): The accent/highlight color.

Return ONLY a JSON object matching this schema:
{
  "logoUrl": string | null,
  "primaryColor": string,
  "backgroundColor": string,
  "fontFamily": string,
  "accentColor": string | null
}`;

  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: systemPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: screenshotUrl,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`OpenAI Vision API error: ${response.status} - ${errText}`);
        return null;
      }

      const data = (await response.json()) as {
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      };

      const content = data.choices[0]?.message?.content;
      if (!content) return null;

      const result = JSON.parse(content) as Record<string, unknown>;
      return {
        logoUrl: typeof result.logoUrl === "string" ? result.logoUrl : undefined,
        primaryColor: typeof result.primaryColor === "string" ? result.primaryColor : "#3B82F6",
        backgroundColor: typeof result.backgroundColor === "string" ? result.backgroundColor : "#0F172A",
        fontFamily: typeof result.fontFamily === "string" ? result.fontFamily : "Inter",
        accentColor: typeof result.accentColor === "string" ? result.accentColor : undefined,
      };
    } catch (error) {
      console.error("Failed to call OpenAI Vision API:", error);
      return null;
    }
  }

  if (anthropicKey) {
    try {
      // Anthropic requires image source as base64
      const imgRes = await fetch(screenshotUrl);
      if (!imgRes.ok) {
        console.error(`Failed to download screenshot for Anthropic: ${imgRes.status}`);
        return null;
      }
      const buffer = await imgRes.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      const contentType = imgRes.headers.get("content-type") ?? "image/png";

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: contentType.includes("jpeg") ? "image/jpeg" : "image/png",
                    data: base64Image,
                  },
                },
                {
                  type: "text",
                  text: systemPrompt + "\nOutput raw JSON only. Do not wrap in markdown block.",
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Anthropic Vision API error: ${response.status} - ${errText}`);
        return null;
      }

      const data = (await response.json()) as {
        content: Array<{
          type: "text";
          text: string;
        }>;
      };

      const content = data.content[0]?.text;
      if (!content) return null;

      const result = JSON.parse(content.trim()) as Record<string, unknown>;
      return {
        logoUrl: typeof result.logoUrl === "string" ? result.logoUrl : undefined,
        primaryColor: typeof result.primaryColor === "string" ? result.primaryColor : "#3B82F6",
        backgroundColor: typeof result.backgroundColor === "string" ? result.backgroundColor : "#0F172A",
        fontFamily: typeof result.fontFamily === "string" ? result.fontFamily : "Inter",
        accentColor: typeof result.accentColor === "string" ? result.accentColor : undefined,
      };
    } catch (error) {
      console.error("Failed to call Anthropic Vision API:", error);
      return null;
    }
  }

  return null;
}

export async function generateSocialMetadata(
  title: string,
  description: string
): Promise<{ altText: string; twitterCopy: string; linkedinCopy: string } | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!openAiKey && !anthropicKey) return null;

  const prompt = `Given this title and description for a web page:
Title: "${title}"
Description: "${description}"

Generate:
1. "altText": A concise, descriptive image alt text for screen readers describing this Open Graph visual asset.
2. "twitterCopy": A suggested tweet (max 240 chars) including 2-3 relevant hashtags.
3. "linkedinCopy": A suggested professional LinkedIn post including 2-3 relevant hashtags.

Return ONLY a JSON object:
{
  "altText": string,
  "twitterCopy": string,
  "linkedinCopy": string
}`;

  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 300,
        }),
      });

      if (!response.ok) return null;
      const data = (await response.json()) as {
        choices: Array<{
          message: {
            content: string;
          };
        }>;
      };
      const content = data.choices[0]?.message?.content;
      if (!content) return null;
      return JSON.parse(content);
    } catch (err) {
      console.error("Failed to generate social metadata via OpenAI:", err);
      return null;
    }
  }

  if (anthropicKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: prompt + "\nOutput raw JSON only. Do not wrap in markdown block.",
            },
          ],
        }),
      });

      if (!response.ok) return null;
      const data = (await response.json()) as {
        content: Array<{
          type: "text";
          text: string;
        }>;
      };
      const content = data.content[0]?.text;
      if (!content) return null;
      return JSON.parse(content.trim());
    } catch (err) {
      console.error("Failed to generate social metadata via Anthropic:", err);
      return null;
    }
  }

  return null;
}
