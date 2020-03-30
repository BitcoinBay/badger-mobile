import { SLP } from "./slp-sdk-utils";
import { Contract, Instance, Sig } from "cashscript";
import P2pkhAbi from "./P2PKH.json";


const deriveP2SH = (addr: string) => {
  const pkh = new Buffer.from(SLP.Address.cashToHash160(addr), "hex");

  const P2PKH: Contract = Contract.compile(P2pkhAbi.source, "mainnet");
  const instance: Instance = P2PKH.new(pkh);
  const artifact = P2PKH.artifact;

  return { artifact };
};

const callContract = async (
  artifactId: string,
  artifact,
  fnName: string,
  params: Array<any>,
  sendAmount: number
) => {
  const contract: Contract = Contract.import(artifact, "mainnet");
  const instance: Instance = contract.deployed(artifactId);

  const fn = instance.functions[fnName];
  const tx = await fn(...params).send(instance.address, sendAmount);
  console.log(tx);
};

const getContractBalance = async (artifactId: string, artifact) => {
  const contract: Contract = Contract.import(artifact, "mainnet");
  const instance: Instance = contract.deployed(artifactId);

  return await instance.getBalance();
};

export { deriveP2SH, callContract, getContractBalance };
