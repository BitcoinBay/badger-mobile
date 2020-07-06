import {
  GET_NODEINFO_START,
  GET_NODEINFO_SUCCESS,
  GET_NODEINFO_FAIL
} from "./constants";

import { Nodeinfo } from "./reducer";

const getNodeinfoStart = () => ({
  type: GET_NODEINFO_START,
  payload: null
});

const getNodeinfoFail = () => ({
  type: GET_NODEINFO_FAIL,
  payload: null
});

const getNodeinfoSuccess = (restNodeInfo: Nodeinfo) => ({
  type: GET_NODEINFO_SUCCESS,
  payload: {
    restNodeInfo
  }
});

const getNodeinfo = (restURL: string, apiToken?: string) => {
  return async (dispatch: Function, getState: Function) => {
    //    dispatch(getNodeinfoStart());
    let node = {
      restURL: restURL,
      apiToken: apiToken
    } as Nodeinfo;
    dispatch(getNodeinfoSuccess(node));
  };
};

export { getNodeinfoStart, getNodeinfoFail, getNodeinfoSuccess };
