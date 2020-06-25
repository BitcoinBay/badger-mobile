import {
  GET_ARTIFACT_START,
  GET_ARTIFACT_SUCCESS,
  GET_ARTIFACT_FAIL,
  CLEAR_ARTIFACTS
} from "./constants";

import { Artifact } from "../../utils/cashscript-utils";

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

const addArtifact = (state: State, payload: Artifact) => {
  const artifact = payload;

  const P2SHAddr = Object.keys(artifact.networks.mainnet);
  const addr = P2SHAddr[0];

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

const clearArtifacts = (state: State) => {
  return initialState;
};

const artifacts = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case GET_ARTIFACT_START:
      return state;
    case GET_ARTIFACT_SUCCESS:
      return addArtifact(state, action.payload);
    case GET_ARTIFACT_FAIL:
      return state;
    case CLEAR_ARTIFACTS:
      return clearArtifacts(state);
    default:
      return state;
  }
};

export default artifacts;
