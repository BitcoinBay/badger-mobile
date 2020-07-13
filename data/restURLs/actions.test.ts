import { AnyAction } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import configureMockStore from "redux-mock-store";

import * as actions from "./actions";
import * as actionTypes from "./constants";
import { FullState } from "../store";
import { Nodeinfo } from "./reducer";

type DispatchExts = ThunkDispatch<FullState, void, AnyAction>;

const middlewares = [thunk];
const mockStore = configureMockStore<FullState, DispatchExts>(middlewares);

describe("restURLs::action::creators", () => {
  it("should create action for - Get restURL start", () => {
    const expectedAction = {
      type: actionTypes.GET_NODEINFO_START,
      payload: null
    };
    expect(actions.getNodeinfoStart()).toEqual(expectedAction);
  });

  it("should create action for - Get restURL fail", () => {
    const expectedAction = {
      type: actionTypes.GET_NODEINFO_FAIL,
      payload: null
    };
    expect(actions.getNodeinfoFail()).toEqual(expectedAction);
  });

  it("should create action for - Get restURL success", () => {
    let testURL = "https://api.fullstack.cash/v3/";
    let restNodeInfo = {
      restURL: testURL,
      apiToken: null
    } as Nodeinfo;

    const expectedAction = {
      type: actionTypes.GET_NODEINFO_SUCCESS,
      payload: {
        restNodeInfo
      }
    };
    expect(actions.getNodeinfoSuccess(restNodeInfo)).toEqual(expectedAction);
  });
});
