import { SLP } from "./slp-sdk-utils";
import { Contract, Instance, Sig } from "cashscript";
import { BITBOX } from "bitbox-sdk";

const deriveP2SH = (address: string) => {
  const pkh = SLP.Address.cashToHash160(address);
  const P2PKH: Contract = Contract.compile(
    `
    pragma cashscript ^0.3.3;

    contract P2PKH(bytes20 pkh) {
        // Require pk to match stored pkh and signature to match
        function spend(pubkey pk, sig s) {
            require(hash160(pk) == pkh);
            require(checkSig(s, pk));
        }
    }
  `,
    "mainnet"
  );
  const instance: Instance = P2PKH.new(pkh);
  const P2SHaddress = instance.address;
  const artifact = P2PKH.artifact;

  return { P2SHaddress, artifact };
};

export { deriveP2SH };
