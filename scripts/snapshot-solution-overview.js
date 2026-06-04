#!/usr/bin/env node
/**
 * Refresh the assurance solution-overview workspace from the canonical
 * software-architecture structure-view workspace.
 *
 * Rules (matches the previous bash-extglob implementation):
 *   - In the target directory, preserve: `solution-overview.md`, `likec4.config.json`, `assets/`.
 *     Everything else is removed before copying.
 *   - From the source directory, copy everything except `likec4.config.json`, `README.md`, `assets/`.
 *
 * This is a Node implementation (replacing `bash -O extglob -lc ...`) so it
 * runs the same on macOS (bash 3.2), Linux, and Windows without relying on
 * `shopt`, `extglob`, or `rsync`.
 */

import { readdir, rm, cp, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SOURCE_DIR = resolve('technology/current-state-views/structure-view');
const TARGET_DIR = resolve('technology/quality-assurance-view/solution-overview');

/** Entries in the target that must survive a snapshot refresh. */
const TARGET_KEEP = new Set(['solution-overview.md', 'likec4.config.json', 'assets']);

/** Entries in the source that must not be copied across. */
const SOURCE_SKIP = new Set(['likec4.config.json', 'README.md', 'assets']);

async function ensureDirectory(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} does not exist: ${path}`);
  }
  const info = await stat(path);
  if (!info.isDirectory()) {
    throw new Error(`${label} is not a directory: ${path}`);
  }
}

async function pruneTarget() {
  const entries = await readdir(TARGET_DIR);
  await Promise.all(
    entries
      .filter((name) => !TARGET_KEEP.has(name))
      .map((name) => rm(join(TARGET_DIR, name), { recursive: true, force: true })),
  );
}

async function copyFromSource() {
  const entries = await readdir(SOURCE_DIR);
  await Promise.all(
    entries
      .filter((name) => !SOURCE_SKIP.has(name))
      .map((name) =>
        cp(join(SOURCE_DIR, name), join(TARGET_DIR, name), {
          recursive: true,
          force: true,
        }),
      ),
  );
}

async function main() {
  await ensureDirectory(SOURCE_DIR, 'source structure-view');
  await ensureDirectory(TARGET_DIR, 'target solution-overview');
  await pruneTarget();
  await copyFromSource();
  console.log(`Snapshot refreshed: ${TARGET_DIR}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`snapshot-solution-overview failed: ${error.message}`);
    process.exit(1);
  });
}

export { main, SOURCE_DIR, TARGET_DIR, TARGET_KEEP, SOURCE_SKIP };
