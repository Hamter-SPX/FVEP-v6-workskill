#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fail, parseCli, printHelp } from '../lib/cli.mjs';
import { buildReleaseArtifact } from '../lib/release-package-engine.mjs';

const HELP = `Usage: node scripts/build-release.mjs [options]

Builds a deterministic, path-safe release directory and ZIP archive.

Options:
  --source <directory>       Source skill directory (default: .)
  --output <directory>       Staged release directory (default: ../fullstack-vision-engineering-pro-v5)
  --archive <file.zip>       ZIP output (default: ../fullstack-vision-engineering-pro-v5.0.0.zip)
  --prefix <directory-name>  Single ZIP root prefix (default: fullstack-vision-engineering-pro-v5)
  --timestamp <ISO-8601>     Deterministic archive timestamp (default: 2026-07-27T00:00:00.000Z)
  --sha-file <path>          SHA-256 sidecar (default: <archive>.sha256)`;

try {
  const args = parseCli({
    source: { type: 'string', default: '.' },
    output: { type: 'string' },
    archive: { type: 'string' },
    prefix: { type: 'string', default: 'fullstack-vision-engineering-pro-v5' },
    timestamp: { type: 'string', default: '2026-07-27T00:00:00.000Z' },
    'sha-file': { type: 'string' }
  });
  if (args.help) printHelp(HELP);
  else {
    const sourceRoot = path.resolve(args.source);
    const packageJson = JSON.parse(await fs.readFile(path.join(sourceRoot, 'package.json'), 'utf8'));
    const parent = path.dirname(sourceRoot);
    const outputDirectory = path.resolve(args.output ?? path.join(parent, 'fullstack-vision-engineering-pro-v5'));
    const archivePath = path.resolve(args.archive ?? path.join(parent, 'fullstack-vision-engineering-pro-v5.0.0.zip'));
    const result = await buildReleaseArtifact({
      sourceRoot,
      outputDirectory,
      archivePath,
      rootPrefix: args.prefix,
      timestamp: args.timestamp,
      name: packageJson.name,
      version: packageJson.version
    });
    const shaFile = path.resolve(args['sha-file'] ?? `${archivePath}.sha256`);
    await fs.writeFile(shaFile, `${result.archiveSha256}  ${path.basename(archivePath)}\n`, 'utf8');
    process.stdout.write(`${JSON.stringify({ ...result, shaFile }, null, 2)}\n`);
  }
} catch (error) { fail(error); }
