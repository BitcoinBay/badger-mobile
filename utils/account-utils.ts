import { SLP } from "./slp-sdk-utils";
import { bchjs } from "./bch-js-utils";
// import { Contract, Instance, Sig } from "cashscript";
// import { BITBOX } from "bitbox-sdk";

const generateMnemonic = () => {
  const mnemonic = bchjs.Mnemonic.generate(128);
  return mnemonic;
};

const deriveAccount = async (
  mnemonic: string,
  accountIndex: number = 0,
  childIndex: number = 0,
  hdPathString: string
) => {
  if (!mnemonic) {
    throw new Error("Mnemonic required to derive account"); // mnemonic = bchjs.Mnemonic.generate(128);
  }
  //  const bitbox: BITBOX = new BITBOX({ restURL: "https://rest.bitcoin.com/v2" });

  const seed = await bchjs.Mnemonic.toSeed(mnemonic);
  const hdWallet = bchjs.HDNode.fromSeed(seed, "mainnet");

  const rootNode = bchjs.HDNode.derivePath(hdWallet, hdPathString);
  const child = bchjs.HDNode.derivePath(
    rootNode,
    `${accountIndex}'/0/${childIndex}`
  );
  const keypair = bchjs.HDNode.toKeyPair(child);
  const address = bchjs.ECPair.toCashAddress(keypair);
  //  console.log("account utils address", address);

  return {
    mnemonic,
    keypair,
    address,
    accountIndex
  };
};

const addressToSlp = async (address: string) => {
  return await bchjs.SLP.Address.toSLPAddress(address);
};

const addressToCash = async (address: string) => {
  return await bchjs.Address.toCashAddress(address);
};

export { deriveAccount, addressToSlp, addressToCash, generateMnemonic };
