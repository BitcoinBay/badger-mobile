import { SLP } from "./slp-sdk-utils";
import { Contract, Instance, Sig } from "cashscript";
import P2pkhArtifact from "./P2PKH.json";
import SlpWalletArtifact from "./SLPWallet.json";

const deriveP2SH = (addr: string) => {
  const pkh = new Buffer.from(SLP.Address.cashToHash160(addr), "hex");

  const P2PKH: Contract = Contract.compile(P2pkhArtifact.source, "mainnet");
  const instance: Instance = P2PKH.new(pkh);
  const artifact = P2PKH.artifact;

  return { artifact };
};

const deriveSLPWallet = (addr: string) => {
  const pkh = new Buffer.from(SLP.Address.cashToHash160(addr), "hex");

  const SLPWallet: Contract = Contract.compile(
    SlpWalletArtifact.source,
    "mainnet"
  );
  const instance: Instance = SLPWallet.new(pkh);
  const artifact = SLPWallet.artifact;

  return { artifact };
};

const callContract = async (
  artifactId: string,
  artifact,
  fnName: string,
  params: Array<any>,
  spendAmount: number | null
) => {
  const contract: Contract = Contract.import(artifact, "mainnet");
  const instance: Instance = contract.deployed(artifactId);

  const fn = instance.functions[fnName];
  const tx = await fn(...params).meep(instance.address, spendAmount);
  console.log(tx);
};

const getContractBalance = async (artifactId: string, artifact) => {
  const contract: Contract = Contract.import(artifact, "mainnet");
  const instance: Instance = contract.deployed(artifactId);

  return await instance.getBalance();
};

export { deriveP2SH, deriveSLPWallet, callContract, getContractBalance };
