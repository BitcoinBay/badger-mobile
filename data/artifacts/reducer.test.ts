import artifactsReducer, { initialState } from "./reducer";
import {
  getArtifactStart,
  getArtifactSuccess,
  getArtifactFail,
  getP2SHAddress
} from "./actions";

import { deriveP2SH } from "../../utils/cashscript-utils";

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
  /*
  it("should get and store new artifact", () => {
    const testAddr = "bitcoincash:qqakphm6jqeteh902n59h2jct706n4srpuzp95a5qh";
    const stateBefore = initialState;
    const stateAfter = artifactsReducer(stateBefore, getP2SHAddress(testAddr));

    const { P2SHaddress, artifact } = deriveP2SH(testAddr);
    const expectedState = {
      ...initialState,
      byId: {
        ...initialState.byId,
        P2SHAddress: artifact
      },
      //allIds not currently working
      allIds: {
        ...initialState.allIds,
        P2SHaddress
      }
    };

    expect(stateAfter).toEqual(expectedState);
  });
*/
});
