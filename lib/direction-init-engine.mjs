import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDir, fileExists, writeJsonAtomic, writeTextAtomic } from './io.mjs';

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readSkillFile(relative) {
  return fs.readFile(path.join(skillRoot, relative), 'utf8');
}

function fillSpecTemplate(template, options = {}) {
  const product = String(options.product ?? 'Product surface');
  const selected = options.selectedOption ? String(options.selectedOption) : '1 | 2 | 3';
  const profilePath = options.profilePath ?? 'design/aesthetic-profile.json';
  const contractPath = options.contractPath ?? 'design/design-contract.json';
  let text = template;
  text = text.replace('- Selected option: 1 | 2 | 3', `- Selected option: ${selected}`);
  text = text.replace('- Selected at (ISO timestamp):', `- Selected at (ISO timestamp): ${options.selectedAt ?? ''}`);
  text = text.replace('- Aesthetic profile path (to write next):', `- Aesthetic profile path (to write next): ${profilePath}`);
  text = text.replace('- Design contract path:', `- Design contract path: ${contractPath}`);
  if (options.product) {
    text = text.replace(
      'Durable record of the user’s chosen look.',
      `Durable record of the user’s chosen look for **${product}**.`
    );
  }
  return text;
}

function scaffoldProfile(options = {}) {
  const axis = (value = null, reason = '') => ({
    value,
    reason: reason || 'Fill from visual-direction-spec.md after the user confirms เริ่มเขียน.',
    consequences: ['Derive from the direction spec keep/change lists']
  });
  return {
    schemaVersion: 1,
    product: String(options.product ?? 'Product surface'),
    audience: String(options.audience ?? ''),
    rationale: String(options.rationale ?? 'Synced from design/visual-direction-spec.md after confirmation.'),
    personality: {
      seriousPlayful: axis(),
      warmClinical: axis(),
      understatedExpressive: axis(),
      denseSpacious: axis(),
      establishedNovel: axis()
    },
    styleDirection: {
      archetype: 'none',
      adopted: [],
      rejected: []
    },
    noveltyBudget: [
      {
        position: 'Fill from direction spec novelty budget',
        decision: 'Fill after เริ่มเขียน',
        reason: 'Copied from visual-direction-spec.md'
      }
    ],
    systems: {
      color: { neutralTemperature: 'cool', accentCount: 1, harmony: 'complementary', themes: ['light'] },
      typography: { scaleRatio: 1.25, roleCount: 5, families: [], maxMeasureCharacters: 72 },
      spacing: { baseUnitPx: 8, scale: [4, 8, 12, 16, 24, 32, 48], density: 'balanced' },
      shape: { radiiPx: [4, 8, 12], elevationLevels: 2 },
      motion: { durationsMs: [120, 200, 320], easings: ['ease-out'], overshoot: 'none', reducedMotionSupported: true }
    },
    voice: {
      person: { value: 3, reason: 'Fill from direction tone' },
      register: { value: 3, reason: 'Fill from direction tone' },
      density: { value: 3, reason: 'Fill from direction density' },
      certainty: { value: 3, reason: 'Fill from product stakes' },
      humour: { value: 1, reason: 'Default restrained until spec says otherwise' }
    },
    nonGoals: [],
    references: ['design/visual-direction-spec.md']
  };
}

function scaffoldContract(options = {}) {
  const product = String(options.product ?? 'Product surface');
  return {
    objective: `Deliver ${product} with the confirmed visual direction.`,
    fidelityMode: options.fidelityMode ?? 'original-direction',
    primaryTask: String(options.primaryTask ?? 'Complete the primary user task on this surface.'),
    audience: String(options.audience ?? ''),
    visualThesis: String(options.visualThesis ?? 'Fill from visual-direction-spec.md Direction Thesis.'),
    aestheticProfile: options.profilePath ?? 'design/aesthetic-profile.json',
    priorityOrder: ['task clarity', 'accessibility', 'responsive composition', 'brand fidelity', 'surface polish'],
    observed: [],
    inferred: [],
    constraints: [],
    composition: { regions: [], density: 'Fill from direction spec' },
    typography: [{ role: 'body', family: '', sizePx: 16, weight: 400, lineHeight: 1.5 }],
    surfaces: { canvas: '', surface: '', radius: '', elevation: '' },
    components: [],
    states: [{ surface: 'primary', default: 'Fill after direction confirm' }],
    responsiveRules: [{ region: 'main', wide: '', compact: '', mobile: '', rationale: '' }],
    motion: {
      durationFamilies: { feedback: 120, transition: 200 },
      easings: { standard: 'ease-out' },
      interruption: 'cancel in-flight on navigation',
      reducedMotion: 'instant equivalent cues'
    },
    emotionalTone: { firstRun: '', empty: '', error: '', success: '' },
    copyVoice: { person: '', register: '', density: '', certainty: '', humour: '' },
    acceptanceCases: [
      {
        key: 'home__desktop__default',
        route: '/',
        viewport: 'desktop',
        state: 'default',
        evidence: ['capture', 'direction-spec']
      }
    ],
    nonGoals: [],
    directionSpec: options.specPath ?? 'design/visual-direction-spec.md'
  };
}

/**
 * Scaffolds durable design-direction artifacts for IDE / CLI / CI use without chat.
 */
export async function initDirectionArtifacts(options = {}) {
  const baseDir = path.resolve(options.baseDir ?? process.cwd());
  const designDir = path.resolve(baseDir, options.designDir ?? 'design');
  const force = options.force === true;
  const paths = {
    designDir,
    specPath: path.join(designDir, 'visual-direction-spec.md'),
    profilePath: path.join(designDir, 'aesthetic-profile.json'),
    contractPath: path.join(designDir, 'design-contract.json'),
    optionsDir: path.join(designDir, 'direction-options')
  };

  await ensureDir(designDir);
  await ensureDir(paths.optionsDir);

  const created = [];
  const skipped = [];

  async function writeUnlessExists(filePath, content, kind) {
    if (await fileExists(filePath) && !force) {
      skipped.push({ path: filePath, kind });
      return false;
    }
    if (typeof content === 'string') await writeTextAtomic(filePath, content.endsWith('\n') ? content : `${content}\n`);
    else await writeJsonAtomic(filePath, content);
    created.push({ path: filePath, kind });
    return true;
  }

  const specTemplate = await readSkillFile('templates/visual-direction-spec.md');
  const relativeProfile = path.relative(baseDir, paths.profilePath).split(path.sep).join('/');
  const relativeContract = path.relative(baseDir, paths.contractPath).split(path.sep).join('/');
  const relativeSpec = path.relative(baseDir, paths.specPath).split(path.sep).join('/');

  await writeUnlessExists(
    paths.specPath,
    fillSpecTemplate(specTemplate, {
      product: options.product,
      selectedOption: options.selectedOption,
      selectedAt: options.selectedAt,
      profilePath: relativeProfile,
      contractPath: relativeContract
    }),
    'visual-direction-spec'
  );

  await writeUnlessExists(
    paths.profilePath,
    scaffoldProfile({
      product: options.product,
      audience: options.audience,
      rationale: options.rationale
    }),
    'aesthetic-profile'
  );

  await writeUnlessExists(
    paths.contractPath,
    scaffoldContract({
      product: options.product,
      audience: options.audience,
      primaryTask: options.primaryTask,
      fidelityMode: options.fidelityMode,
      profilePath: relativeProfile,
      specPath: relativeSpec
    }),
    'design-contract'
  );

  const readmePath = path.join(paths.optionsDir, 'README.md');
  await writeUnlessExists(
    readmePath,
    `# Direction options

Place ImageGen outputs here as \`direction-option-1.png\`, \`direction-option-2.png\`, \`direction-option-3.png\`.

Then open the browser gallery:

\`\`\`bash
npm run direction:gallery -- \\
  --option '1|Thesis one|design/direction-options/direction-option-1.png' \\
  --option '2|Thesis two|design/direction-options/direction-option-2.png' \\
  --option '3|Thesis three|design/direction-options/direction-option-3.png'
\`\`\`
`,
    'options-readme'
  );

  return {
    ok: true,
    baseDir,
    paths: {
      designDir: paths.designDir,
      specPath: paths.specPath,
      profilePath: paths.profilePath,
      contractPath: paths.contractPath,
      optionsDir: paths.optionsDir
    },
    created,
    skipped
  };
}
