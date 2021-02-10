import { AnyAction } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import configureMockStore from "redux-mock-store";
import fetchMock from "fetch-mock";

import * as actions from "./actions";
import * as actionTypes from "./constants";
import { FullState } from "../store";

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
});
