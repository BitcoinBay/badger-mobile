import { SLP } from "./slp-sdk-utils";
import { Contract, Instance, Sig } from "cashscript";
import P2pkhArtifact from "./P2PKH.json";
import SlpGenesisArtifact from "./SLPGenesis.json";
import SlpMintArtifact from "./SLPMint.json";
import SlpSendArtifact from "./SLPSend.json";
import Bip38Artifact from "./Bip38.json";

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

const compileContract = (type: string) => {
  let artifactSource;

  switch (type) {
    case "P2PKH":
      artifactSource = P2pkhArtifact.source;
      break;
    case "SLPGenesis":
      artifactSource = SlpGenesisArtifact.source;
      break;
    case "SLPMint":
      artifactSource = SlpMintArtifact.source;
      break;
    case "SLPSend":
      artifactSource = SlpSendArtifact.source;
      break;
    case "Bip38Wallet":
      artifactSource = Bip38Artifact.source;
      break;
    default:
      break;
  }

  if (!artifactSource) return null;

  const contract: Contract = Contract.compile(artifactSource, "mainnet");
  return contract
}

const deriveP2SH = (type: string, params: any) => {
  let artifactSource;

  switch (type) {
    case "P2PKH":
      artifactSource = P2pkhArtifact.source;
      break;
    case "SLPGenesis":
      artifactSource = SlpGenesisArtifact.source;
      break;
    case "SLPMint":
      artifactSource = SlpMintArtifact.source;
      break;
    case "SLPSend":
      artifactSource = SlpSendArtifact.source;
      break;
    case "Bip38":
      artifactSource = Bip38Artifact.source;
      break;
    default:
      break;
  }

  if (!artifactSource) return null;

  const contract: Contract = Contract.compile(artifactSource, "mainnet");

  const instance: Instance = contract.new(...params);
  const artifact = contract.artifact;

  return artifact;
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
  compileContract,
  deriveP2SH,
  callContract,
  getContractBalance
};
