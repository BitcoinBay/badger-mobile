import { SLP } from "./slp-sdk-utils";
import { Contract, Instance, Sig } from "cashscript";
import P2pkhArtifact from "./P2PKH.json";
import SlpGenesisArtifact from "./SLPGenesis.json";
import SlpMintArtifact from "./SLPMint.json";
import SlpSendArtifact from "./SLPSend.json";

interface AbiInput {
  name: string; // Input name
  type: string; // Input type (see language documentation)
}

interface AbiFunction {
  name: string; // Function name
  covenant: boolean; // Does this function use covenant variables
  inputs: AbiInput[]; // Function inputs / parameters
}

interface Artifact {
  contractName: string; // Contract name
  constructorInputs: AbiInput[]; // Arguments required to instantiate a contract
  abi: AbiFunction[]; // functions that can be called
  bytecode: string; // Compiled Script without constructor parameters added (in ASM format)
  source: string; // Source code of the CashScript contract
  networks: {
    // Dictionary per network (testnet / mainnet)
    [network: string]: {
      // Dictionary of contract addresses with the corresponding compiled script (in ASM format)
      [address: string]: string;
    };
  };
  compiler: {
    name: string; // Compiler used to compile this contract
    version: string; // Compiler version used to compile this contract
  };
  updatedAt: string; // Last datetime this artifact was updated (in ISO format)
}

const deriveP2SH = (addr: string) => {
  const pkh = Buffer.from(SLP.Address.cashToHash160(addr), "hex");

  const P2PKH: Contract = Contract.compile(P2pkhArtifact.source, "mainnet");
  const instance: Instance = P2PKH.new(pkh);
  const artifact = P2PKH.artifact;

  return { artifact };
};

const deriveSLPWallet = (addr: string, type: string) => {
  const pkh = Buffer.from(SLP.Address.cashToHash160(addr), "hex");
  let artifactSource;

  switch (type) {
    case "GENISIS":
      artifactSource = SlpGenesisArtifact.source;
      break;
    case "MINT":
      artifactSource = SlpMintArtifact.source;
      break;
    case "SEND":
      artifactSource = SlpSendArtifact.source;
      break;
    default:
      artifactSource = SlpGenesisArtifact.source;
      break;
  }

  const SLPWallet: Contract = Contract.compile(artifactSource, "mainnet");
  const instance: Instance = SLPWallet.new(pkh);
  const artifact = SLPWallet.artifact;

  return { artifact };
};

const callContract = async (
  artifactId: string,
  artifact: Artifact,
  fnName: string,
  params: Array<any>,
  spendAmount: number
) => {
  const contract: Contract = Contract.import(artifact, "mainnet");
  const instance: Instance = contract.deployed(artifactId);

  const fn = instance.functions[fnName];

  const tx = await fn(...params).send(instance.address, spendAmount);

  return tx;
};

const getContractBalance = async (artifactId: string, artifact: Artifact) => {
  const contract: Contract = Contract.import(artifact, "mainnet");
  const instance: Instance = contract.deployed(artifactId);

  return await instance.getBalance();
};

export {
  AbiInput,
  AbiFunction,
  Artifact,
  deriveP2SH,
  deriveSLPWallet,
  callContract,
  getContractBalance
};
