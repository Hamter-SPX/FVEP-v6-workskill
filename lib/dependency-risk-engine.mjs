import { finalizeAudit, makeFinding, percentage } from './audit-utils.mjs';

function dependencyEntries(manifest = {}) {
  const groups = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
  return groups.flatMap((group) => Object.entries(manifest[group] ?? {}).map(([name, version]) => ({ group, name, version: String(version) })));
}

function isUnpinned(version) {
  return /^(?:\^|~|>|<|\*|latest|next|x\b)|\s\|\||\s-\s/i.test(version) || /[x*]/i.test(version);
}
function isRemote(version) { return /^(?:git\+|git:|github:|https?:|ssh:)/i.test(version); }

export function auditDependencyManifest(input = {}, policy = {}) {
  const manifest = input?.manifest ?? {};
  const findings = [];
  const dependencies = dependencyEntries(manifest);
  const requireVerifiedLockfile = policy.requireVerifiedLockfile !== false;
  let checks = 2 + dependencies.length;
  let passed = 0;

  if (input?.lockfilePresent === true) {
    passed += 1;
    if (input.lockfileVerified === true) passed += 1;
    else if (input.lockfileVerified === false) {
      findings.push(makeFinding('dependency-lockfile-unverified', 'blocker', 'The detected lockfile does not match the declared dependency manifest.', {
        detail: Array.isArray(input.lockfileIssues) ? input.lockfileIssues : [],
        remediation: 'Regenerate the lockfile from the reviewed manifest, inspect the resulting diff, and verify it in CI.'
      }));
    } else {
      findings.push(makeFinding('dependency-lockfile-verification-missing', requireVerifiedLockfile ? 'high' : 'medium', 'A lockfile exists, but its consistency with the dependency manifest was not verified.', {
        detail: input.lockfileKind ?? null,
        remediation: 'Use a supported deterministic lockfile or provide an independent lockfile-consistency check.'
      }));
    }
  } else {
    findings.push(makeFinding('dependency-lockfile-missing', 'blocker', 'No lockfile evidence was supplied.', { remediation: 'Commit and verify the package-manager lockfile in CI.' }));
  }

  for (const dependency of dependencies) {
    if (isRemote(dependency.version)) findings.push(makeFinding('dependency-remote-source', 'blocker', `Dependency ${dependency.name} uses a remote source instead of an immutable registry version.`, { path: `${dependency.group}.${dependency.name}` }));
    else if (isUnpinned(dependency.version)) findings.push(makeFinding('dependency-version-unpinned', 'high', `Dependency ${dependency.name} is not pinned to an exact version.`, { path: `${dependency.group}.${dependency.name}`, detail: dependency.version }));
    else passed += 1;
  }

  for (const name of ['preinstall', 'install', 'postinstall']) {
    if (manifest?.scripts?.[name]) findings.push(makeFinding('dependency-lifecycle-script', policy.allowLifecycleScripts ? 'medium' : 'high', `Package lifecycle script ${name} executes during installation.`, { path: `scripts.${name}` }));
  }
  if (manifest?.scripts?.prepare && !manifest.private) findings.push(makeFinding('dependency-publish-prepare-script', 'medium', 'Public package prepare script expands supply-chain execution surface.', { path: 'scripts.prepare' }));

  const confidence = percentage(passed, checks);
  const report = finalizeAudit(findings, { evidenceCount: dependencies.length + 2, evidenceConfidence: confidence });
  return {
    ...report,
    dependencyCount: dependencies.length,
    lockfile: {
      present: input?.lockfilePresent === true,
      verified: input?.lockfileVerified === true,
      kind: input?.lockfileKind ?? null,
      path: input?.lockfilePath ?? null,
      issues: Array.isArray(input?.lockfileIssues) ? input.lockfileIssues : []
    },
    coverage: { requiredChecks: checks, satisfiedChecks: passed, confidence }
  };
}
