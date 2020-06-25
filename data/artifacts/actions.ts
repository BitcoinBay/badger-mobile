import {
  GET_ARTIFACT_START,
  GET_ARTIFACT_SUCCESS,
  GET_ARTIFACT_FAIL,
  CLEAR_ARTIFACTS,
  CALL_ARTIFACT_START,
  CALL_ARTIFACT_SUCCESS,
  CALL_ARTIFACT_FAIL
} from "./constants";

import {
  Artifact,
  deriveP2SH,
  callContract
} from "../../utils/cashscript-utils";

import { FullState } from "../store";

const getArtifactStart = () => ({
  type: GET_ARTIFACT_START,
  payload: null
});

const getArtifactSuccess = (artifact: Artifact) => ({
  type: GET_ARTIFACT_SUCCESS,
  payload: artifact
});

const getArtifactFail = () => ({
  type: GET_ARTIFACT_FAIL,
  payload: null
});

const clearArtifacts = () => ({
  type: CLEAR_ARTIFACTS,
  payload: null
});

const callArtifactStart = () => ({
  type: CALL_ARTIFACT_START,
  payload: null
});

const callArtifactSuccess = (artifact: Artifact) => ({
  type: CALL_ARTIFACT_SUCCESS,
  payload: null
});

const callArtifactFail = () => ({
  type: CALL_ARTIFACT_FAIL,
  payload: null
});

const getP2SHAddress = (type: string, params: any) => {
  return async (dispatch: Function, getState: Function) => {
    dispatch(getArtifactStart());
    const artifact = deriveP2SH(type, params);
    if(!artifact) {
      dispatch(getArtifactFail())
    } else {
      dispatch(getArtifactSuccess(artifact));
    }
  };
};

const callArtifact = (
  artifactId: string,
  artifact: Artifact,
  fnName: string,
  params: Array<any>,
  spendAmount: number
) => {
  return async (dispatch: Function, getState: Function) => {
    dispatch(callArtifactStart());
    const tx = callContract(artifactId, artifact, fnName, params, spendAmount);
    dispatch(callArtifactSuccess(artifact));
  };
};

export {
  getArtifactStart,
  getArtifactSuccess,
  getArtifactFail,
  getP2SHAddress,
  clearArtifacts,
  callArtifact
};
