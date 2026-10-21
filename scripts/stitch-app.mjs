import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const parts = [0, 1, 2, 3].map((i) =>
  readFileSync(join(root, `src/restored-p${i}.txt`), "utf8")
);
const out = parts.join("");
writeFileSync(join(root, "src/AppFull.tsx"), out);
console.log("stitched AppFull.tsx", out.length, "bytes");
