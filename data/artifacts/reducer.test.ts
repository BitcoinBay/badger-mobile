import artifactsReducer, { initialState } from "./reducer";
import { getP2SHAddress } from "./actions";

describe("artifacts::reducer", () => {
  it("should return the initial state", () => {
    expect(
      artifactsReducer(undefined, { type: "__init", payload: null })
    ).toEqual(initialState);
  });
});
