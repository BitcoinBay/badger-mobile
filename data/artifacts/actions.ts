import {
  GET_ARTIFACT_START,
  GET_ARTIFACT_SUCCESS,
  GET_ARTIFACT_FAIL
} from "./constants";

import { Artifact } from "./reducer";

import { deriveP2SH } from "../../utils/cashscript-utils";

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

const getP2SHAddress = (addrString: string) => {
  return async (dispatch: Function, getState: Function) => {
    dispatch(getArtifactStart());
    const { artifact } = deriveP2SH(addrString) as Artifact;
    dispatch(getArtifactSuccess(artifact));
  };
};

export {
  getArtifactStart,
  getArtifactSuccess,
  getArtifactFail,
  getP2SHAddress
};
