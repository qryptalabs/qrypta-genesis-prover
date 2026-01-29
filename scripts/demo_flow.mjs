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
  console.error("Uso: node scripts/demo_flow.mjs --chain bnb|eth --out ./out ...");
  process.exit(1);
}

const out = arg("out", "./out");
const fake = flag("fake");

const token = arg("token");
const sender = arg("sender");
const recipient = arg("recipient");
const amount = arg("amount", "1");
const decimals = arg("decimals", "18");
const deadlineSeconds = arg("deadlineSeconds", "31536000");
const memo = arg("memo", "PQC TRANSFER");

execSync(
  `node scripts/gen_inputs.mjs --chain ${chain} --out "${out}" --token ${token} --sender ${sender} --recipient ${recipient} --amount "${amount}" --decimals ${decimals} --deadlineSeconds ${deadlineSeconds} --memo "${memo}"`,
  { stdio: "inherit" }
);

execSync(`node scripts/prove.mjs --chain ${chain} --out "${out}" ${fake ? "--fake" : ""}`, {
  stdio: "inherit"
});
