import {
  GET_ARTIFACT_START,
  GET_ARTIFACT_SUCCESS,
  GET_ARTIFACT_FAIL
} from "./constants";

import { Artifact } from "./reducer";

import { deriveP2SH } from "../../utils/cashscript-utils";

import { activeAccountIdSelector } from "../accounts/selectors";
import { FullState } from "../store";

const getArtifactStart = () => ({
  type: GET_ARTIFACT_START,
  payload: null
});

const getArtifactSuccess = (address: string, artifact: Artifact) => ({
  type: GET_ARTIFACT_SUCCESS,
  payload: {
    address,
    artifact
  }
});

const getArtifactFail = () => ({
  type: GET_ARTIFACT_FAIL,
  payload: null
});

const getP2SHAddress = (addrString: string) => {
  return async (dispatch: Function, getState: Function) => {
    dispatch(getArtifactStart());
    try {
      const { address, artifact } = deriveP2SH(addrString) as Artifact;
      dispatch(getArtifactSuccess(address, artifact));
    } catch (e) {
      console.log(e);
      dispatch(getArtifactFail());
    }
  };
};

export {
  getArtifactStart,
  getArtifactSuccess,
  getArtifactFail,
  getP2SHAddress
};
