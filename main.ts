// Loading Screen Gold: A Tip in 200 Characters
// Node 22, stdlib-only, deterministic.
// Writes one loading-screen tip to $MAKEFUN_OUTPUT_DIR/entry.txt.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The tip: a loading-screen line for a stressed developer and the AI
// coding agent sitting next to them (in the same editor, at 3 a.m.).
// The agent has rewritten the same function 7 times — not stuck, just
// stalling — and the only honest advice left is to type 'stop' and let
// it pretend that was the plan all along.
const ENTRY =
  "Tip: if your agent has rewritten the same function 7 times, it isn't stuck \u2014 it's stalling. Type 'stop' and let it pretend that was the plan all along.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const inputDir = process.env.MAKEFUN_INPUT_DIR ?? "/input";

// Resolve paths from this script's own location, never from the cwd.
const repoDir = dirname(fileURLToPath(import.meta.url));
void repoDir;
void inputDir;

mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, "entry.txt"), ENTRY, "utf8");
