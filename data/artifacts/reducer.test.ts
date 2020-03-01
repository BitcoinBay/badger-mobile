import artifactsReducer, { initialState } from "./reducer";
import {
  getArtifactStart,
  getArtifactSuccess,
  getArtifactFail,
  getP2SHAddress
} from "./actions";

describe("artifacts::reducer", () => {
  it("should return the initial state", () => {
    expect(
      artifactsReducer(undefined, { type: "__init", payload: null })
    ).toEqual(initialState);
  });

  it("should start getting artifact by doing nothing", () => {
    const stateBefore = initialState;
    const stateAfter = artifactsReducer(stateBefore, getArtifactStart());

    const expectedState = initialState;
    expect(stateAfter).toEqual(expectedState);
  });

  it("should handle failing to get artifact", () => {
    const stateBefore = initialState;
    const stateAfter = artifactsReducer(stateBefore, getArtifactFail());

    const expectedState = {
      ...initialState
    };
    expect(stateAfter).toEqual(expectedState);
  });
});
