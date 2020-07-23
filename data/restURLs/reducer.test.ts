import restURLsReducer, { initialState } from "./reducer";
import {
  getNodeinfoStart,
  getNodeinfoFail,
  getNodeinfoSuccess
} from "./actions";

describe("restURLs::reducer", () => {
  it("should return the initial state", () => {
    expect(
      restURLsReducer(undefined, { type: "__init", payload: null })
    ).toEqual(initialState);
  });

  it("should start getting restURL by doing nothing", () => {
    const stateBefore = initialState;
    const stateAfter = restURLsReducer(stateBefore, getNodeinfoStart());

    const expectedState = initialState;
    expect(stateAfter).toEqual(expectedState);
  });

  it("should handle failing to get restURL", () => {
    const stateBefore = initialState;
    const stateAfter = restURLsReducer(stateBefore, getNodeinfoFail());

    const expectedState = initialState;
    expect(stateAfter).toEqual(expectedState);
  });
  /*
  it("should successfully get and store restURL", () => {
    const stateBefore = initialState;
    const expectedState = {
      ...initialState,
      byNodeId: {
        ...initialState.byNodeId,
        []
      }
    }
  });
*/
});
