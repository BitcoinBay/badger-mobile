import { AnyAction } from "redux";

import {
  GET_NODEINFO_START,
  GET_NODEINFO_SUCCESS,
  GET_NODEINFO_FAIL
} from "./constants";

export interface Nodeinfo {
  restURL: string;
  apiToken?: string;
}

export type State = {
  byNodeId: {
    [nodeId: string]: Nodeinfo;
  };
  allNodeIds: string[];
  activeNodeId?: string | null;
};

export const initialState: State = {
  byNodeId: {},
  allNodeIds: [],
  activeNodeId: null
};

const addNode = (
  state: State,
  payload: {
    restNodeInfo: Nodeinfo;
  }
) => {
  const { restNodeInfo } = payload;
  const { restURL } = restNodeInfo;

  const existingNodes = state.allNodeIds;

  if (existingNodes.includes(restURL)) {
    return {
      ...state,
      byNodeId: {
        ...state.byNodeId,
        [restURL]: restNodeInfo
      }
    };
  }

  return {
    ...state,
    byNodeId: {
      ...state.byNodeId,
      [restURL]: restNodeInfo
    },
    allNodeIds: [...state.allNodeIds, restURL],
    activeNodeId: restURL
  };
};

const nodeInfos = (state: State = initialState, action: AnyAction): State => {
  switch (action.type) {
    case GET_NODEINFO_START:
      return state;

    case GET_NODEINFO_FAIL:
      return state;

    case GET_NODEINFO_SUCCESS:
      return addNode(state, action.payload);

    default:
      return state;
  }
};

export default nodeInfos;
