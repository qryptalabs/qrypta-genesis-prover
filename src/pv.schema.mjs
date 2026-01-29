import { AbiCoder } from "ethers";

export const PV_ABI_TYPES = [
  "address",
  "address",
  "uint256",
  "uint256",
  "uint256",
  "address",
  "uint256",
  "bytes32"
];

export function encodePublicValues(fields) {
  const coder = AbiCoder.defaultAbiCoder();
  return coder.encode(PV_ABI_TYPES, fields);
}
