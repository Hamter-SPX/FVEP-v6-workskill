// Run intelligence persistence: SQLite via node:sqlite when the engine provides it,
// append-only JSONL fallback otherwise. Both modes expose the identical interface
// and keep all state under <outputDir>/.fx/intel/.
import fs from 'node:fs/promises';
import { renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { ensureDir, writeTextAtomic } from './io.mjs';

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 100000;

const FINDING_COLUMNS = 'run_id, output_dir, source, rule, severity, case_key, device, detail_json, created_at';

const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000; -- WAL allows a concurrent writer; wait briefly instead of SQLITE_BUSY
CREATE TABLE IF NOT EXISTS runs (
  run_id TEXT PRIMARY KEY,
  output_dir TEXT,
  gate_outcome TEXT,
  score REAL,
  blockers INTEGER,
  cases_count INTEGER,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS run_findings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT,
  output_dir TEXT,
  source TEXT,
  rule TEXT,
  severity TEXT,
  case_key TEXT,
  device TEXT,
  detail_json TEXT,
  created_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_run_findings_rule ON run_findings(output_dir, rule, created_at);
CREATE INDEX IF NOT EXISTS idx_run_findings_case ON run_findings(output_dir, case_key);
`;

// node:sqlite is absent on Node < 22.5 (engines allow >=20) — dynamic import keeps
// those engines working by falling back to the JSONL store instead of crashing.
async function loadDatabaseSync() {
  const mod = await import('node:sqlite').catch(() => null);
  return mod && typeof mod.DatabaseSync === 'function' ? mod.DatabaseSync : null;
}

export async function sqliteAvailable() {
  return (await loadDatabaseSync()) !== null;
}

function nowIso() {
  return new Date().toISOString();
}

function textOrNull(value) {
  return value == null ? null : String(value);
}

function normalizeRun(row) {
  return {
    run_id: String(row.run_id ?? ''),
    output_dir: String(row.output_dir ?? ''),
    gate_outcome: textOrNull(row.gate_outcome),
    score: row.score ?? null,
    blockers: row.blockers ?? null,
    cases_count: row.cases_count ?? null,
    created_at: row.created_at == null ? nowIso() : String(row.created_at),
  };
}

function normalizeFinding(row) {
  return {
    run_id: String(row.run_id ?? ''),
    output_dir: String(row.output_dir ?? ''),
    source: textOrNull(row.source),
    rule: textOrNull(row.rule),
    severity: textOrNull(row.severity),
    case_key: textOrNull(row.case_key),
    device: textOrNull(row.device),
    detail_json: row.detail_json == null
      ? null
      : (typeof row.detail_json === 'string' ? row.detail_json : JSON.stringify(row.detail_json)),
    created_at: row.created_at == null ? nowIso() : String(row.created_at),
  };
}

function clampLimit(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

// In-memory predicate mirroring the SQL WHERE clause, so both modes filter identically.
function matchesFinding(row, query) {
  if (query.outputDir != null && row.output_dir !== query.outputDir) return false;
  if (query.rule != null && row.rule !== query.rule) return false;
  if (query.source != null && row.source !== query.source) return false;
  if (query.caseKey != null && row.case_key !== query.caseKey) return false;
  if (query.device != null && row.device !== query.device) return false;
  if (query.since != null && String(row.created_at ?? '') < query.since) return false; // ISO-8601 lexicographic
  return true;
}

function buildFindingQuery(query) {
  const clauses = [];
  const params = [];
  const filters = [
    ['output_dir = ?', query.outputDir],
    ['rule = ?', query.rule],
    ['source = ?', query.source],
    ['case_key = ?', query.caseKey],
    ['device = ?', query.device],
    ['created_at >= ?', query.since],
  ];
  for (const [clause, value] of filters) {
    if (value != null) {
      clauses.push(clause);
      params.push(value);
    }
  }
  const where = clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';
  params.push(clampLimit(query.limit));
  return { sql: `SELECT ${FINDING_COLUMNS} FROM run_findings${where} ORDER BY id DESC LIMIT ?`, params };
}

// close() must stay harmless when called more than once; expose Symbol.dispose for
// modern `using` ergonomics when the engine supports it.
function exposeDispose(store) {
  if (typeof Symbol.dispose === 'symbol') {
    store[Symbol.dispose] = () => store.close();
  }
  return store;
}

// A corrupt/unreadable sqlite file must not kill intelligence capture: quarantine it
// aside for manual inspection, then fall back to the JSONL store.
function quarantineCorruptDb(dbPath) {
  try {
    renameSync(dbPath, `${dbPath}.corrupt-${Date.now()}`);
  } catch {
    try {
      rmSync(dbPath, { force: true });
    } catch {
      // give up silently — the JSONL fallback does not touch this path
    }
  }
}

function openSqliteStore(db, dbPath) {
  const insertRun = db.prepare(
    'INSERT OR REPLACE INTO runs (run_id, output_dir, gate_outcome, score, blockers, cases_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  const insertFinding = db.prepare(
    `INSERT INTO run_findings (${FINDING_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  let closed = false;
  return exposeDispose({
    mode: 'sqlite',
    path: dbPath,
    async recordRun(row) {
      const run = normalizeRun(row);
      insertRun.run(run.run_id, run.output_dir, run.gate_outcome, run.score, run.blockers, run.cases_count, run.created_at);
      return run;
    },
    async recordFindings(rows) {
      const findings = rows.map(normalizeFinding);
      db.exec('BEGIN'); // one transaction per run batch: all-or-nothing
      try {
        for (const f of findings) {
          insertFinding.run(f.run_id, f.output_dir, f.source, f.rule, f.severity, f.case_key, f.device, f.detail_json, f.created_at);
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return findings;
    },
    async queryFindings(query = {}) {
      const { sql, params } = buildFindingQuery(query);
      // node:sqlite rows have a null prototype — spread into plain objects so
      // results are indistinguishable from the JSONL mode's JSON.parse output.
      return db.prepare(sql).all(...params).map((row) => ({ ...row }));
    },
    async listRuns({ outputDir, limit } = {}) {
      const params = [];
      let sql = 'SELECT run_id, output_dir, gate_outcome, score, blockers, cases_count, created_at FROM runs';
      if (outputDir != null) {
        sql += ' WHERE output_dir = ?';
        params.push(outputDir);
      }
      sql += ' ORDER BY rowid DESC LIMIT ?';
      params.push(clampLimit(limit));
      return db.prepare(sql).all(...params).map((row) => ({ ...row }));
    },
    close() {
      if (closed) return;
      closed = true;
      db.close();
    },
  });
}

async function readJsonlRows(filePath) {
  let text;
  try {
    text = await fs.readFile(filePath, 'utf8');
  } catch {
    return [];
  }
  const rows = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    try {
      rows.push(JSON.parse(trimmed));
    } catch {
      // tolerate a partially written/corrupt line rather than failing the scan
    }
  }
  return rows;
}

// Batch atomicity on JSONL: rewrite existing content + new batch via tmp-file rename,
// so a batch is either fully visible or not at all (never interleaved half-lines).
async function appendJsonlBatch(filePath, rows) {
  if (rows.length === 0) return;
  let existing = '';
  try {
    existing = await fs.readFile(filePath, 'utf8');
  } catch {
    // first batch for this file
  }
  const batch = `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;
  const content = existing === '' ? batch : `${existing.endsWith('\n') ? existing : `${existing}\n`}${batch}`;
  await writeTextAtomic(filePath, content);
}

function openJsonlStore(intelDir) {
  const runsPath = path.join(intelDir, 'runs.jsonl');
  const findingsPath = path.join(intelDir, 'findings.jsonl');
  // same contract as sqlite mode (DatabaseSync throws ERR_INVALID_STATE once closed):
  // a closed store must not silently keep serving reads/writes
  let closed = false;
  const assertOpen = () => {
    if (closed) throw new Error('run-intel-store: store is closed');
  };
  return exposeDispose({
    mode: 'jsonl',
    path: findingsPath,
    async recordRun(row) {
      assertOpen();
      const run = normalizeRun(row);
      await appendJsonlBatch(runsPath, [run]);
      return run;
    },
    async recordFindings(rows) {
      assertOpen();
      const findings = rows.map(normalizeFinding);
      await appendJsonlBatch(findingsPath, findings);
      return findings;
    },
    async queryFindings(query = {}) {
      assertOpen();
      const limit = clampLimit(query.limit);
      const rows = await readJsonlRows(findingsPath);
      const matched = rows.filter((row) => matchesFinding(row, query));
      return matched.slice(-limit).reverse(); // newest first, same as sqlite ORDER BY id DESC
    },
    async listRuns({ outputDir, limit } = {}) {
      assertOpen();
      const rows = await readJsonlRows(runsPath);
      const byRunId = new Map();
      for (const row of rows) {
        if (outputDir != null && row.output_dir !== outputDir) continue;
        // delete-then-set moves a re-recorded run to the end: last write wins and it
        // becomes the newest entry, matching sqlite INSERT OR REPLACE + rowid DESC.
        if (byRunId.has(row.run_id)) byRunId.delete(row.run_id);
        byRunId.set(row.run_id, row);
      }
      return [...byRunId.values()].slice(-clampLimit(limit)).reverse();
    },
    close() {
      // no open handles — reads/writes open and close per operation; still idempotent
      closed = true;
    },
  });
}

export async function openIntelStore(outputDir, options = {}) {
  if (outputDir == null || outputDir === '') {
    throw new Error('openIntelStore: outputDir is required');
  }
  const intelDir = path.join(path.resolve(outputDir), '.fx', 'intel');
  await ensureDir(intelDir);
  if (options.forceJsonl !== true) {
    const DatabaseSync = await loadDatabaseSync();
    if (DatabaseSync !== null) {
      const dbPath = path.join(intelDir, 'intel.sqlite');
      let db = null;
      try {
        db = new DatabaseSync(dbPath);
        db.exec(SCHEMA_SQL); // first real I/O — a corrupt file throws here
        return openSqliteStore(db, dbPath);
      } catch {
        try { db?.close(); } catch { /* handle already unusable */ }
        quarantineCorruptDb(dbPath);
        // fall through to the JSONL store below
      }
    }
  }
  return openJsonlStore(intelDir);
}
