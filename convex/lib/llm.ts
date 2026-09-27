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
          model: "claude-opus-5",
          max_tokens: 16000,
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
          type: string;
          text?: string;
        }>;
      };
      const content = data.content.find((b) => b.type === "text")?.text;
      if (!content) return null;
      return JSON.parse(content.trim());
    } catch (err) {
      console.error("Failed to generate social metadata via Anthropic:", err);
      return null;
    }
  }

  return null;
}
