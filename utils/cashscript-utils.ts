import { SLP } from "./slp-sdk-utils";
import { Contract, Instance, Sig } from "cashscript";
import path from "path";
import * as p2pkh from "./P2PKH.json";

const deriveP2SH = (addr: string) => {
  const pkh = new Buffer.from(SLP.Address.cashToHash160(addr), "hex");

  const P2PKH: Contract = Contract.compile(p2pkh.source, "mainnet");
  const instance: Instance = P2PKH.new(pkh);
  const artifact = P2PKH.artifact;

  return { artifact };
};

export { deriveP2SH };
