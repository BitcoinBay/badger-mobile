import { SLP } from "./slp-sdk-utils";
import { Contract, Instance, Sig } from "cashscript";
import { BITBOX } from "bitbox-sdk";
import path from "path";

const deriveP2SH = (addr: string) => {
  const pkh = new Buffer.from(SLP.Address.cashToHash160(addr), "hex");

  const P2PKH: Contract = Contract.compile(
    path.join(__dirname, "P2PKH.cash"),
    "mainnet"
  );
  const instance: Instance = P2PKH.new(pkh);
  const artifact = P2PKH.artifact;

  return { artifact };
};

export { deriveP2SH };
