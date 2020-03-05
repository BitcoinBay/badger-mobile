import {
  GET_ARTIFACT_START,
  GET_ARTIFACT_SUCCESS,
  GET_ARTIFACT_FAIL
} from "./constants";

export interface AbiInput {
  name: string; // Input name
  type: string; // Input type (see language documentation)
}

export interface AbiFunction {
  name: string; // Function name
  covenant: boolean; // Does this function use covenant variables
  inputs: AbiInput[]; // Function inputs / parameters
}

export interface Artifact {
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

type Action = {
  type: string;
  payload: any;
};

export type State = {
  byId: {
    [contractId: string]: Artifact;
  };
  allIds: string[];
  activeId?: string | null;
};

export const initialState: State = {
  byId: {},
  allIds: [],
  activeId: null
};

const addArtifact = (
  state: State,
  payload: {
    address: String;
    artifact: Artifact;
  }
) => {
  const { artifact } = payload;

  const P2SHAddr = Object.keys(artifact.networks.mainnet);
  const addr = P2SHAddr[0];
  console.log("artifacts/reducer address:", addr);
  console.log("artifacts/reducer artifact:", artifact);

  const existingAcounts = state.allIds;

  if (existingAcounts.includes(addr)) {
    return {
      ...state,
      byId: {
        ...state.byId,
        [addr]: artifact
      }
    };
  }

  return {
    ...state,
    byId: {
      ...state.byId,
      [addr]: artifact
    },
    allIds: [...state.allIds, addr],
    activeId: addr
  };
};

const artifacts = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case GET_ARTIFACT_START:
      return state;
    case GET_ARTIFACT_SUCCESS:
      return addArtifact(state, action.payload);
    case GET_ARTIFACT_FAIL:
      return state;
    default:
      return state;
  }
};

export default artifacts;
