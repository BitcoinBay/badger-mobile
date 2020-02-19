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
  paylaod: null
});

const getP2SHAddress = (state: FullState) => {
  return async (dispatch: Function, getState: Function) => {
    dispatch(getArtifactStart());
    const accountId = activeAccountIdSelector(state);
    const { address, artifact } = deriveP2SH(accountId) as Artifact;
    dispatch(getArtifactSuccess(address, artifact));
  };
};

export { getP2SHAddress };
