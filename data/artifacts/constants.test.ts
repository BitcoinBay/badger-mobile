import {
  GET_ARTIFACT_START,
  GET_ARTIFACT_SUCCESS,
  GET_ARTIFACT_FAIL
} from "./constants";

describe("artifacts::constants", () => {
  it("GET_ARTIFACT_START defined", () => {
    expect(GET_ARTIFACT_START).toBeDefined();
  });

  it("GET_ARTIFACT_SUCCESS defined", () => {
    expect(GET_ARTIFACT_SUCCESS).toBeDefined();
  });

  it("GET_ARTIFACT_FAIL defined", () => {
    expect(GET_ARTIFACT_FAIL).toBeDefined();
  });
});
