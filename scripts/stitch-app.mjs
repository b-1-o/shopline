import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const p1 = readFileSync(join(root, "src/AppFull.part1.txt"), "utf8");
const p2 = readFileSync(join(root, "src/AppFull.part2.txt"), "utf8");
writeFileSync(join(root, "src/AppFull.tsx"), p1 + p2);
console.log("stitched AppFull.tsx", p1.length + p2.length, "bytes");
