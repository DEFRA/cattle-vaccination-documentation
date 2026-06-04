#!/usr/bin/env node
/**
 * Replaces inline ```mermaid code blocks in Markdown with PNG images.
 * Renders each Mermaid block using mermaid-cli (mmdc) and replaces with ![](path).
 * Used so Marp PDF export shows diagrams instead of raw Mermaid syntax.
 *
 * Image sizing: Marpit only accepts CSS lengths with units (e.g. height:450px).
 * Using "height:450" without "px" is invalid and Marp falls back to default
 * sizing, which often stretches diagrams in PDF output.
 *
 * Usage: node scripts/process-mermaid-in-markdown.js <input.md> [output.md]
 * If output.md is omitted, writes to a temp file and returns its path (for piping to Marp).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const MERMAID_BLOCK_REGEX = /```mermaid\n([\s\S]*?)```/g;

function processMarkdown(inputPath, outputPath = null) {
  const content = readFileSync(inputPath, 'utf-8');
  const inputDir = dirname(inputPath);
  const outputDir = join(inputDir, 'output');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  let blockIndex = 0;
  const processed = content.replace(MERMAID_BLOCK_REGEX, (match, mermaidCode) => {
    blockIndex++;
    const baseName = `mermaid-diagram-${blockIndex}`;
    const mmdPath = join(tmpdir(), `${baseName}.mmd`);
    const pngPath = join(outputDir, `${baseName}.png`);
    const relativePngPath = `./output/${baseName}.png`;

    writeFileSync(mmdPath, mermaidCode.trim(), 'utf-8');

    try {
      // Viewport is initial page size; PNG is clipped to SVG bounds (correct aspect ratio).
      execFileSync(
        NPX,
        ['mmdc', '-i', mmdPath, '-o', pngPath, '-w', '1600', '-H', '1200', '-s', '2'],
        { stdio: 'pipe' },
      );
    } catch (err) {
      console.error(`Failed to render Mermaid block ${blockIndex}:`, err.message);
      return match; // Keep original on failure
    }

    // Marpit requires units: height:450px (not height:450). Remaining alt text optional.
    return `![height:450px Mermaid diagram](${relativePngPath})`;
  });

  const outPath = outputPath ?? join(tmpdir(), `marp-processed-${Date.now()}.md`);
  writeFileSync(outPath, processed, 'utf-8');
  return outPath;
}

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath) {
  console.error('Usage: node process-mermaid-in-markdown.js <input.md> [output.md]');
  process.exit(1);
}

const result = processMarkdown(inputPath, outputPath);
if (!outputPath) {
  console.log(result);
}
