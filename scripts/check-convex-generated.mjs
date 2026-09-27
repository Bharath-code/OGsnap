#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const generatedFiles = [
  join(root, "convex", "_generated", "api.d.ts"),
  join(root, "convex", "_generated", "server.d.ts"),
  join(root, "convex", "_generated", "dataModel.d.ts"),
];

const marker = "Temporary scaffold stubs";
const failed = [];

for (const file of generatedFiles) {
  if (!existsSync(file) || readFileSync(file, "utf8").includes(marker)) {
    failed.push(file);
  }
}

if (failed.length > 0) {
  console.error("Convex generated files are still scaffold stubs:");
  for (const file of failed) {
    console.error(`- ${file}`);
  }
  console.error("Run `pnpm convex:codegen` with CONVEX_DEPLOYMENT configured before release.");
  process.exit(1);
}

console.log("Convex generated files are real codegen outputs.");
