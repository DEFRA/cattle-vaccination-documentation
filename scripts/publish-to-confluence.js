#!/usr/bin/env node

/**
 * Sync architecture documentation markdown to Confluence via mark (Docker).
 *
 * Mounts the repository root at /workspace so paths under technology/,
 * delivery-passport/, etc. resolve inside the container.
 *
 * Design notes:
 * - We walk the tree with fs.readdir (no shell-out to `find`) so this script
 *   works the same on macOS, Linux, and Windows.
 * - Docker is invoked with execFileSync(argv[]) rather than by assembling a
 *   shell command string, so repository paths containing spaces don't break
 *   the `-v host:container` mount.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync, statSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Project root (parent of scripts/). */
const REPO_ROOT = path.resolve(__dirname, '..');

/**
 * Markdown trees scanned by default (each must be a direct child of REPO_ROOT if present).
 *
 * Trees in OPTIONAL_ROOTS are excluded by default and only included when their opt-in
 * flag is passed. This protects pages that teams may already curate in Confluence outside
 * of this repository from being overwritten by an unintended bulk publish.
 */
const DEFAULT_ROOTS = ['technology'];
const OPTIONAL_ROOTS = {
  '--include-delivery-passport': 'delivery-passport',
  '--include-service-homepage': 'service-homepage',
  '--include-product-outcomes': 'product-outcomes',
  '--include-users': 'users',
  '--include-service-design': 'service-design'
};
const KNOWN_FLAGS = new Set(Object.keys(OPTIONAL_ROOTS));

/** Directory names to ignore when walking documentation trees. */
const SKIP_DIRS = new Set(['templates', 'node_modules', '.git', 'output', 'images', 'dist']);

const CONFIG = {
  confluenceConfig: path.resolve(process.env.HOME || '', '.config/mark.toml'),
  markImage: 'kovetskiy/mark:v16.3.0',
  markFlags: [
    '--changes-only', 'true',
    '--strip-linebreaks', 'true',
    '--edit-lock', 'true',
    '--drop-h1', 'false',
    '--title-from-h1', 'true',
    '--minor-edit',
    '--mermaid-scale', '2',
  ],
};

function hasSpaceMetadata(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const firstLine = content.split('\n')[0].trim();
    return /^<!--\s*Space:\s*.+?\s*-->$/.test(firstLine);
  } catch {
    return false;
  }
}

function* walkMarkdown(dirAbs) {
  let entries;
  try {
    entries = readdirSync(dirAbs, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const entryAbs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkMarkdown(entryAbs);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      yield entryAbs;
    }
  }
}

function findMarkdownFiles(roots) {
  const collected = [];
  for (const root of roots) {
    const rootAbs = path.join(REPO_ROOT, root);
    if (!existsSync(rootAbs)) continue;
    for (const absFile of walkMarkdown(rootAbs)) {
      collected.push(path.relative(REPO_ROOT, absFile));
    }
  }

  const unique = [...new Set(collected)].sort();
  const filtered = unique.filter((relFile) => {
    const filename = path.basename(relFile);
    if (filename === 'README.md') {
      return hasSpaceMetadata(path.join(REPO_ROOT, relFile));
    }
    return true;
  });

  // service-homepage/README.md must be published before any child sections so
  // that mark finds it in the right place (under hub_parent_page) rather than
  // auto-creating it as an orphan when a child section references it as parent.
  const homepageFile = 'service-homepage/README.md';
  const homepageIndex = filtered.indexOf(homepageFile);
  if (homepageIndex > 0) {
    filtered.splice(homepageIndex, 1);
    filtered.unshift(homepageFile);
  }
  return filtered;
}

function buildDockerArgs(relativeFilePath) {
  return [
    'run', '--rm', '-i',
    '-v', `${path.dirname(CONFIG.confluenceConfig)}:/root/.config`,
    '-v', `${REPO_ROOT}:/workspace`,
    '-w', '/workspace',
    CONFIG.markImage,
    'mark',
    ...CONFIG.markFlags,
    '-f', relativeFilePath,
  ];
}

function getMarkdownTitle(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const h1Match = content.match(/^#\s+(.+?)\s*$/m);
    return h1Match ? h1Match[1].trim() : null;
  } catch {
    return null;
  }
}

function buildTitleIndex(relativeFiles) {
  const index = new Map();
  for (const relativeFilePath of relativeFiles) {
    const absoluteFilePath = path.join(REPO_ROOT, relativeFilePath);
    const title = getMarkdownTitle(absoluteFilePath);
    if (title) index.set(path.normalize(absoluteFilePath), title);
  }
  return index;
}

function rewriteRelativeMarkdownLinks(content, sourceAbsolutePath, titleIndex) {
  const markdownLink = /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g;
  return content.replace(markdownLink, (fullMatch, linkText, rawTarget) => {
    const trimmedTarget = rawTarget.trim();
    const unwrappedTarget =
      trimmedTarget.startsWith('<') && trimmedTarget.endsWith('>')
        ? trimmedTarget.slice(1, -1).trim()
        : trimmedTarget;

    if (
      unwrappedTarget.startsWith('ac:') ||
      unwrappedTarget.startsWith('#') ||
      /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(unwrappedTarget)
    ) {
      return fullMatch;
    }

    const [targetPath, targetAnchor = ''] = unwrappedTarget.split('#');
    if (!targetPath.toLowerCase().endsWith('.md')) return fullMatch;

    const resolvedTargetPath = path.normalize(path.resolve(path.dirname(sourceAbsolutePath), targetPath));
    const targetTitle = titleIndex.get(resolvedTargetPath);
    if (!targetTitle) return fullMatch;

    const anchorSuffix = targetAnchor ? `#${targetAnchor}` : '';
    return `[${linkText}](<ac:${targetTitle}${anchorSuffix}>)`;
  });
}

function createTemporaryPublishFile(relativeFilePath, titleIndex) {
  const sourceAbsolutePath = path.join(REPO_ROOT, relativeFilePath);
  const sourceContent = readFileSync(sourceAbsolutePath, 'utf8');
  const rewrittenContent = rewriteRelativeMarkdownLinks(sourceContent, sourceAbsolutePath, titleIndex);

  if (rewrittenContent === sourceContent) {
    return {
      publishRelativePath: relativeFilePath,
      cleanup: () => {},
    };
  }

  const tempDirectory = mkdtempSync(path.join(REPO_ROOT, '.confluence-publish-'));
  const tempFilePath = path.join(tempDirectory, path.basename(relativeFilePath));
  writeFileSync(tempFilePath, rewrittenContent, 'utf8');

  return {
    publishRelativePath: path.relative(REPO_ROOT, tempFilePath),
    cleanup: () => rmSync(tempDirectory, { recursive: true, force: true }),
  };
}

function syncFile(relativeFilePath, titleIndex) {
  console.log(`Syncing ${relativeFilePath}...`);
  const { publishRelativePath, cleanup } = createTemporaryPublishFile(relativeFilePath, titleIndex);
  try {
    execFileSync('docker', buildDockerArgs(publishRelativePath), { stdio: 'inherit' });
    console.log(`OK ${relativeFilePath}\n`);
    return true;
  } catch (error) {
    console.error(`FAILED ${relativeFilePath}: ${error.message}`);
    return false;
  } finally {
    cleanup();
  }
}

function resolveSingleFileArg(arg) {
  const candidateAbs = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
  if (!existsSync(candidateAbs) || !statSync(candidateAbs).isFile()) {
    throw new Error(`File not found: ${arg}`);
  }
  const relative = path.relative(REPO_ROOT, candidateAbs);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`File is outside the repository root: ${arg}`);
  }
  return relative;
}

function parseArgs(argv) {
  const flags = new Set();
  const positionals = [];
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      if (!KNOWN_FLAGS.has(arg)) {
        throw new Error(`Unknown flag: ${arg}`);
      }
      flags.add(arg);
    } else {
      positionals.push(arg);
    }
  }
  const roots = [...DEFAULT_ROOTS];
  for (const flag of flags) {
    const optionalRoot = OPTIONAL_ROOTS[flag];
    if (optionalRoot && !roots.includes(optionalRoot)) {
      roots.push(optionalRoot);
    }
  }
  return { roots, targetFileArg: positionals[0] };
}

function main() {
  console.log('Syncing architecture documentation to Confluence...\n');

  const { roots, targetFileArg } = parseArgs(process.argv.slice(2));
  let files;

  if (targetFileArg) {
    files = [resolveSingleFileArg(targetFileArg)];
    console.log(`Targeting single file: ${files[0]}\n`);
  } else {
    console.log(`Scanning roots: ${roots.join(', ')}`);
    files = findMarkdownFiles(roots);
    console.log(`Found ${files.length} files\n`);
  }

  if (files.length === 0) {
    console.log('No markdown files found to sync.');
    return;
  }

  // Build the title index from the same scope being published so that intra-tree
  // links rewrite to Confluence page titles, while links into excluded trees fall
  // back to raw markdown (those pages may be hand-curated with different titles).
  const titleIndex = buildTitleIndex(findMarkdownFiles(roots));

  let successCount = 0;
  let failureCount = 0;
  for (const file of files) {
    if (syncFile(file, titleIndex)) successCount += 1;
    else failureCount += 1;
  }

  console.log('Sync complete.');
  console.log(`  Succeeded: ${successCount}`);
  if (failureCount > 0) {
    console.log(`  Failed:    ${failureCount}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, findMarkdownFiles, syncFile, REPO_ROOT, DEFAULT_ROOTS, OPTIONAL_ROOTS };
