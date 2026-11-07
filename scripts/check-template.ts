// Run: node --no-warnings scripts/check-template.ts
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildOgHtml } from "../convex/render/template.ts";

const require = createRequire(resolve("apps/web/package.json"));
const { html } = await import(pathToFileURL(require.resolve("satori-html")).href);

const texts = (node: unknown): string[] => {
  if (typeof node === "string") return [node];
  if (Array.isArray(node)) return node.flatMap(texts);
  const children = (node as { props?: { children?: unknown } })?.props?.children;
  return children === undefined ? [] : texts(children);
};
const tags = (node: unknown): string[] => {
  if (Array.isArray(node)) return node.flatMap(tags);
  if (!node || typeof node !== "object") return [];
  const { type, props } = node as { type?: string; props?: { children?: unknown } };
  return [type ?? "", ...tags(props?.children)];
};

const parsed = html(
  buildOgHtml({
    title: `Tom's "A & B" guide`,
    description: `<img src="http://169.254.169.254/x"/> & more`,
    primaryColor: "#123456",
    backgroundColor: "#000000",
    logoUrl: "https://example.com/logo.png?a=1&b=2",
  }).replace(/>\s+</g, "><"),
);

const output = texts(parsed).join(" ");
assert.ok(output.includes(`Tom's "A & B" guide`), `title printed wrong: ${output}`);
assert.ok(!/&(amp|lt|gt|quot|#039);/.test(output), `entity printed literally: ${output}`);
assert.equal(tags(parsed).filter((tag) => tag === "img").length, 1, "a page title injected an <img>");
console.log("template checks pass");
