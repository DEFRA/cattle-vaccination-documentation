#!/usr/bin/env node
/**
 * Build the LikeC4 static site for the structure-view workspace into
 * astro/public/likec4 so Astro serves it as a sub-app at <site>/likec4/.
 *
 * The --base flag must match Astro's deployed base path so LikeC4's internal
 * asset URLs resolve correctly. We mirror the logic from astro.config.mjs:
 * PAGES_SITE_URL hosts at root, otherwise BASE_PATH (or the local default).
 */
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const astroDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(astroDir, "..");

const rawBase = process.env.PAGES_SITE_URL
  ? "/"
  : process.env.BASE_PATH || "/cattle-vaccination-docs/";
const astroBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
const likec4Base = `${astroBase}likec4/`;

const workspace = path.join(
  repoRoot,
  "technology",
  "current-state-views",
  "structure-view",
);
const output = path.join(astroDir, "public", "likec4");

rmSync(output, { recursive: true, force: true });

const result = spawnSync(
  "npx",
  [
    "likec4",
    "build",
    workspace,
    "--base",
    likec4Base,
    "--output",
    output,
    "--title",
    "Cattle Vaccination — Architecture",
    // Use hash routing so deep links work without an SPA fallback on the
    // host (Astro/GitHub Pages serves static files only).
    "--use-hash-history",
  ],
  // Run from astroDir so `npx` resolves likec4 from astro/node_modules
  // (the only location where the cookiecutter-generated project installs it).
  // The workspace path is absolute, so cwd doesn't affect resolution there.
  { stdio: "inherit", cwd: astroDir },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
