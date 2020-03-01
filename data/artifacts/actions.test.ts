import { AnyAction } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import configureMockStore from "redux-mock-store";
import fetchMock from "fetch-mock";

import * as actions from "./actions";
import * as actionTypes from "./constants";
import { FullState } from "../store";
import { Artifact } from "./reducer";

import { deriveP2SH } from "../../utils/cashscript-utils";

type DispatchExts = ThunkDispatch<FullState, void, AnyAction>;

const middlewares = [thunk];
const mockStore = configureMockStore<FullState, DispatchExts>(middlewares);

describe("artifacts::action", () => {
  it("should create action for - Start to get artifact", () => {
    const expectedAction = {
      type: actionTypes.GET_ARTIFACT_START,
      payload: null
    };
    expect(actions.getArtifactStart()).toEqual(expectedAction);
  });

  it("should create action for - Fail to get artifact", () => {
    const expectedAction = {
      type: actionTypes.GET_ARTIFACT_FAIL,
      payload: null
    };
    expect(actions.getArtifactFail()).toEqual(expectedAction);
  });

  it("should create action for - Get artifact success", () => {
    const testAddr = "bitcoincash:qqakphm6jqeteh902n59h2jct706n4srpuzp95a5qh";
    const { P2SHaddress, artifact } = deriveP2SH(testAddr);
    const expectedAction = {
      type: actionTypes.GET_ARTIFACT_SUCCESS,
      payload: {
        address: P2SHaddress,
        artifact: artifact
      }
    };
    expect(actions.getArtifactSuccess(P2SHaddress, artifact)).toEqual(
      expectedAction
    );
  });
});
