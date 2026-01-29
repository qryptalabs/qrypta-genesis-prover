import fs from "node:fs";
import path from "node:path";
import { isAddress, parseUnits, keccak256, toUtf8Bytes } from "ethers";
import { stableStringify } from "../src/stableStringify.mjs";
import { encodePublicValues } from "../src/pv.schema.mjs";

function arg(name, def = null) {
  const ix = process.argv.indexOf(`--${name}`);
  if (ix === -1) return def;
  return process.argv[ix + 1] ?? def;
}

const chain = arg("chain");
if (!chain || !["bnb", "eth"].includes(chain)) {
  console.error("Uso: node scripts/gen_inputs.mjs --chain bnb|eth ...");
  process.exit(1);
}
const chainId = chain === "bnb" ? 56 : 1;

const outDir = path.resolve(arg("out", "./out"));
fs.mkdirSync(outDir, { recursive: true });

const token = arg("token");
const sender = arg("sender");
const recipient = arg("recipient");
const amountHuman = arg("amount", "1");
const decimals = Number(arg("decimals", "18"));
const memo = arg("memo", "PQC TRANSFER");
const nonceStr = arg("nonce", "0");
const deadlineSeconds = Number(arg("deadlineSeconds", "31536000")); // 1 año

if (!token || !isAddress(token)) throw new Error("token inválido");
if (!sender || !isAddress(sender)) throw new Error("sender inválido");
if (!recipient || !isAddress(recipient)) throw new Error("recipient inválido");

const amountWei = parseUnits(amountHuman, decimals);
const now = Math.floor(Date.now() / 1000);
const deadline = now + deadlineSeconds;
const nonce = BigInt(nonceStr);

const isoReferenceObj = {
  version: 1,
  project: "QRYPTA",
  chain,
  chainId,
  token,
  sender,
  recipient,
  amount: amountHuman,
  amountWei: amountWei.toString(),
  decimals,
  nonce: nonce.toString(),
  deadline,
  memo,
  createdAt: new Date().toISOString()
};

const stable = stableStringify(isoReferenceObj);
const isoRefHash = keccak256(toUtf8Bytes(stable));

const publicValuesHex = encodePublicValues([
  sender,
  recipient,
  amountWei,
  nonce,
  BigInt(chainId),
  token,
  BigInt(deadline),
  isoRefHash
]);

fs.writeFileSync(
  path.join(outDir, "isoReference.json"),
  JSON.stringify({ ...isoReferenceObj, isoRefHash, stableJson: stable }, null, 2)
);

fs.writeFileSync(path.join(outDir, `publicValues_${chain}.hex`), publicValuesHex.trim() + "\n");

console.log(JSON.stringify({ ok: true, outDir, chain, isoRefHash, publicValuesHex }));
