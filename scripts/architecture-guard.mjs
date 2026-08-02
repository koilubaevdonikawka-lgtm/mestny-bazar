#!/usr/bin/env node
// Architecture Guard — mechanically-checkable subset of docs/architecture/ARCHITECTURE_GUARD.md.
// Pure Node (no dependencies), read-only, exits non-zero on any FAIL.
// This script enforces what is grep-checkable; everything requiring semantic
// judgment (ADR necessity, Rule Engine correctness, event ownership, domain
// boundary *meaning*) is a manual-review checklist in the governing document,
// not something this script claims to verify.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const failures = [];
const warnings = [];

function walk(dir, exts = [".ts", ".tsx"]) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".output" || entry.name === ".wrangler")
      continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function rel(p) {
  return relative(ROOT, p).split(sep).join("/");
}

function read(p) {
  return readFileSync(p, "utf8");
}

// --- Check 1: Dependency Rule (PL-03) — server/domain must never import server/adapters. ---
// Closes the known, previously undetected gap (ARCHITECTURE_PRINCIPLES.md §1 PL-06 "Known gap",
// ADR_INDEX.md candidate row "Усиление ESLint-границ зависимостей внутри server/**").
{
  const domainFiles = walk(join(ROOT, "server", "domain")).filter((f) => !f.endsWith(".test.ts"));
  for (const file of domainFiles) {
    const content = read(file);
    const importLines = content.match(/^import .*from ["'][^"']+["'];?$/gm) ?? [];
    for (const line of importLines) {
      if (/@server\/adapters\//.test(line) || /from ["']\.\.\/adapters\//.test(line)) {
        failures.push({
          check: "Dependency Rule (PL-03)",
          file: rel(file),
          detail: `imports an adapter directly: ${line.trim()}`,
        });
      }
    }
  }
}

// --- Check 2: Composition Root (PL-05) — adapters/rule-engine instances are only
// constructed in server/di/container.ts, never inside server/domain. ---
{
  const domainFiles = walk(join(ROOT, "server", "domain")).filter((f) => !f.endsWith(".test.ts"));
  const ctorPattern =
    /new\s+(Supabase\w+|FinikPaymentAdapter|Stub\w+Adapter|Stub\w+Notifier)\s*\(/g;
  for (const file of domainFiles) {
    const content = read(file);
    const matches = [...content.matchAll(ctorPattern)];
    for (const match of matches) {
      failures.push({
        check: "Composition Root (PL-05)",
        file: rel(file),
        detail: `constructs an adapter outside the container: ${match[1]}`,
      });
    }
  }
}

// --- Check 3: Platform Layer (PL-01) — src/** (excluding src/api/**, src/integrations/**)
// must not import @supabase/supabase-js or server/** directly. ---
{
  const srcFiles = walk(join(ROOT, "src")).filter((f) => {
    const r = rel(f);
    return !r.startsWith("src/api/") && !r.startsWith("src/integrations/");
  });
  for (const file of srcFiles) {
    const content = read(file);
    const importLines = content.match(/^import .*from ["'][^"']+["'];?$/gm) ?? [];
    for (const line of importLines) {
      if (/@supabase\/supabase-js/.test(line)) {
        failures.push({
          check: "Platform Layer (PL-01)",
          file: rel(file),
          detail: `imports the Supabase SDK directly: ${line.trim()}`,
        });
      }
      if (/@server\//.test(line) || /from ["']\.\.\/\.\.\/server\//.test(line)) {
        failures.push({
          check: "Platform Layer (PL-01)",
          file: rel(file),
          detail: `imports server/** directly: ${line.trim()}`,
        });
      }
    }
  }
}

// --- Check 4: Server-Only Secrets (PL-07) — a server-only env var name must
// never appear in genuinely client-reachable src/** code. One documented,
// pre-existing exception is excluded, not silently — named in
// ARCHITECTURE_PRINCIPLES.md itself:
//   - *.server.ts files (CD-08: the sanctioned "never bundled" marker,
//     confirmed by ARCHITECTURE_PRINCIPLES.md §CD-08) — client.server.ts
//     legitimately reads SUPABASE_SERVICE_ROLE_KEY.
// (src/lib/shopify.ts's SHOPIFY_STOREFRONT_TOKEN exception was removed by
// ADR-002 — that file, and the Shopify catalog it hardcoded a token for, no
// longer exist.)
{
  const SERVER_ONLY_NAMES = ["SUPABASE_SERVICE_ROLE_KEY", "FINIK_API_KEY", "TELEGRAM_BOT_TOKEN"];
  const srcFiles = walk(join(ROOT, "src")).filter((f) => !f.endsWith(".server.ts"));
  for (const file of srcFiles) {
    const content = read(file);
    for (const name of SERVER_ONLY_NAMES) {
      if (content.includes(name)) {
        failures.push({
          check: "Server-Only Secrets (PL-07)",
          file: rel(file),
          detail: `references server-only variable name "${name}" in client-reachable code`,
        });
      }
    }
  }
}

// --- Check 5: Rule Engine Standard (PL-12) — every *.rule.ts under server/domain
// must declare both applies() and evaluate(), and an order property. ---
{
  const ruleFiles = walk(join(ROOT, "server", "domain")).filter((f) => f.endsWith(".rule.ts"));
  for (const file of ruleFiles) {
    const content = read(file);
    const hasApplies = /applies\s*\(/.test(content);
    const hasEvaluate = /evaluate\s*\(/.test(content);
    const hasOrder = /readonly\s+order\s*[:=]/.test(content);
    if (!hasApplies || !hasEvaluate || !hasOrder) {
      failures.push({
        check: "Rule Engine Standard (PL-12)",
        file: rel(file),
        detail: `missing required shape (order=${hasOrder}, applies=${hasApplies}, evaluate=${hasEvaluate})`,
      });
    }
  }
}

// --- Check 6: DTO Contracts (PL-04) — shared/contracts/** must not import
// from server/** or src/integrations/supabase/** (frontend/DB leakage into contracts). ---
{
  const contractFiles = walk(join(ROOT, "shared", "contracts"));
  for (const file of contractFiles) {
    const content = read(file);
    if (/@server\//.test(content) || /integrations\/supabase/.test(content)) {
      failures.push({
        check: "DTO Contracts (PL-04)",
        file: rel(file),
        detail: "imports server/ or Supabase-generated types into a shared contract",
      });
    }
  }
}

// --- Check 7: Composition Root singularity (PL-05) — only container.ts may
// construct a *PolicyService/*Service rule-engine with a hardcoded rule array
// literal containing more than one `new *Rule()` — a second file doing this
// would be a parallel, undocumented composition root. ---
{
  const diDir = join(ROOT, "server", "di");
  const nonContainerFiles = walk(ROOT, [".ts"]).filter((f) => {
    const r = rel(f);
    return (
      r.startsWith("server/") &&
      !r.startsWith("server/di/") &&
      !r.endsWith(".test.ts") &&
      !r.includes("/rules/")
    );
  });
  for (const file of nonContainerFiles) {
    const content = read(file);
    const ruleCtorCount = (content.match(/new\s+\w+Rule\s*\(/g) ?? []).length;
    if (ruleCtorCount > 1) {
      failures.push({
        check: "Composition Root singularity (PL-05)",
        file: rel(file),
        detail: `assembles ${ruleCtorCount} rule instances outside server/di/container.ts — a candidate second composition root`,
      });
    }
  }
  void diDir;
}

// --- Warnings (informational, not gating) ---
{
  const finikPath = join(ROOT, "server", "adapters", "payment", "finik.adapter.ts");
  try {
    const content = read(finikPath);
    if (/not implemented/i.test(content)) {
      warnings.push(
        "finik.adapter.ts is still a stub — Finance/Integrations reconciliation stays blocked (expected, documented).",
      );
    }
  } catch {
    // adapter file not found — not this check's concern
  }
}

// --- Report ---
const lines = [];
lines.push("=== Architecture Guard — static checks ===");
lines.push(`Checked at: ${new Date().toISOString()}`);
lines.push("");

if (failures.length === 0) {
  lines.push("PASS — no mechanically-checkable violation found.");
} else {
  lines.push(`FAIL — ${failures.length} violation(s):`);
  for (const f of failures) {
    lines.push(`  [${f.check}] ${f.file}`);
    lines.push(`    ${f.detail}`);
  }
}

if (warnings.length > 0) {
  lines.push("");
  lines.push("Warnings (non-blocking):");
  for (const w of warnings) lines.push(`  - ${w}`);
}

lines.push("");
lines.push("This script covers only the mechanically-checkable subset of");
lines.push("docs/architecture/ARCHITECTURE_GUARD.md. A PASS here is necessary");
lines.push("but not sufficient — the manual-review checklist in that document");
lines.push("(ADR necessity, Rule Engine ordering correctness, event ownership,");
lines.push("Order Lifecycle semantics, documentation currency) must also pass");
lines.push("before a commit is permitted.");

console.log(lines.join("\n"));
process.exit(failures.length === 0 ? 0 : 1);
