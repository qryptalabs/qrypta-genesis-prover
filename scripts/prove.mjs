import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";

function arg(name, def = null) {
  const ix = process.argv.indexOf(`--${name}`);
  if (ix === -1) return def;
  return process.argv[ix + 1] ?? def;
}
function flag(name) {
  return process.argv.includes(`--${name}`);
}

const chain = arg("chain");
if (!chain || !["bnb", "eth"].includes(chain)) {
  console.error("Uso: node scripts/prove.mjs --chain bnb|eth --out ./out --fake");
  process.exit(1);
}

const outDir = path.resolve(arg("out", "./out"));
const pvPath = path.join(outDir, `publicValues_${chain}.hex`);
const proofPath = path.join(outDir, `proof_${chain}.hex`);

if (!fs.existsSync(pvPath)) {
  console.error(`No existe ${pvPath}. Primero corre gen_inputs.`);
  process.exit(1);
}

if (flag("fake")) {
  const fake = "0x" + randomBytes(256).toString("hex");
  fs.writeFileSync(proofPath, fake + "\n");
  console.log(JSON.stringify({ ok: true, mode: "fake", proofPath, proofHex: fake }));
  process.exit(0);
}

const tmpl = process.env.QRYPTA_PROVER_COMMAND;
if (!tmpl) {
  console.error("Falta QRYPTA_PROVER_COMMAND.");
  process.exit(1);
}

const cmd = tmpl.replaceAll("{chain}", chain).replaceAll("{out}", outDir);
execSync(cmd, { stdio: "inherit", env: process.env, cwd: outDir });

if (!fs.existsSync(proofPath)) {
  console.error(`El prover no generó ${proofPath}.`);
  process.exit(1);
}

const proofHex = fs.readFileSync(proofPath, "utf8").trim();
console.log(JSON.stringify({ ok: true, mode: "real", proofPath, proofHex }));
