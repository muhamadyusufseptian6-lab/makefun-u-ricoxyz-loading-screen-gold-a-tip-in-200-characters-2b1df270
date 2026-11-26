// TDD-lite checks for the Loading Screen Gold entry (run BEFORE writing main.ts:
// it must fail, then turn green once main.ts exists).
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const mainTs = join(dir, "main.ts");
let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
};

// 1. entrypoint exists
check("main.ts exists", existsSync(mainTs));

// 2. stdlib-only: no imports outside node:*
if (existsSync(mainTs)) {
  const src = readFileSync(mainTs, "utf8");
  const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
  const bad = imports.filter((i) => !i.startsWith("node:"));
  check("stdlib-only imports", bad.length === 0, bad.join(", "));
}

// 3. runs and writes a valid entry.txt (1-200 chars, UTF-8, not only whitespace, one line)
if (existsSync(mainTs)) {
  const outA = mkdtempSync(join(tmpdir(), "loading-gold-a-"));
  const outB = mkdtempSync(join(tmpdir(), "loading-gold-b-"));
  try {
    execFileSync("node", [mainTs], {
      env: { ...process.env, MAKEFUN_OUTPUT_DIR: outA },
      stdio: "pipe",
    });
    execFileSync("node", [mainTs], {
      env: { ...process.env, MAKEFUN_OUTPUT_DIR: outB },
      stdio: "pipe",
    });
    const a = readFileSync(join(outA, "entry.txt"), "utf8");
    const b = readFileSync(join(outB, "entry.txt"), "utf8");
    const chars = [...a].length;
    check("entry.txt is 1-200 chars", chars >= 1 && chars <= 200, `${chars} chars`);
    check("entry.txt is not only whitespace", a.trim().length > 0);
    check("entry.txt is a single line", !a.trim().includes("\n"));
    check("deterministic (same output twice)", a === b);
    console.log(`ENTRY: ${JSON.stringify(a)}`);
  } catch (e) {
    check("main.ts runs cleanly", false, String(e.message).slice(0, 200));
  } finally {
    rmSync(outA, { recursive: true, force: true });
    rmSync(outB, { recursive: true, force: true });
  }
}

if (failures > 0) {
  console.log(`${failures} check(s) failed`);
  process.exit(1);
}
console.log("All checks green.");
