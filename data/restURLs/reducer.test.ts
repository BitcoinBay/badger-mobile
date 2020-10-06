import restURLsReducer, { initialState, Nodeinfo } from "./reducer";
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

  it("should successfully get and store restURL", () => {
    const stateBefore = initialState;
    const testURL1 = ({
      restURL: "http://test.com/api",
      apiToken: "testAPIToken"
    } as unknown) as Nodeinfo;
    const testURL2 = ({
      restURL: "http://test2.com/api2",
      apiToken: "testAPIToken2"
    } as unknown) as Nodeinfo;
    const testURL1Update = ({
      restURL: "http://test.com/api",
      apiToken: null
    } as unknown) as Nodeinfo;

    const expectedState1 = {
      ...initialState,
      byNodeId: {
        ...initialState.byNodeId,
        [testURL1.restURL]: testURL1
      },
      allNodeIds: [...initialState.allNodeIds, testURL1.restURL],
      activeNodeId: testURL1.restURL
    };

    const expectedState2 = {
      ...expectedState1,
      byNodeId: {
        ...expectedState1.byNodeId,
        [testURL2.restURL]: testURL2
      },
      allNodeIds: [...expectedState1.allNodeIds, testURL2.restURL],
      activeNodeId: testURL2.restURL
    };

    const stateAfterOnce = restURLsReducer(
      stateBefore,
      getNodeinfoSuccess(testURL1)
    );
    expect(stateAfterOnce).toEqual(expectedState1);

    const stateAfterTwice = restURLsReducer(
      stateAfterOnce,
      getNodeinfoSuccess(testURL2)
    );
    expect(stateAfterTwice).toEqual(expectedState2);
  });
});
