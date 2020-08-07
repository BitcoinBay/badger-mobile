import {
  activeNodeIdSelector,
  activeNodeSelector,
  getNodeApiToken,
  hasNodeApiToken,
  nodesByNodeIdSelector
} from "./selectors";
import { initialState, State, Nodeinfo } from "./reducer";
import { FullState } from "../store";

describe("restURL::selectors", () => {
  describe("activeNodeSelector", () => {
    it("return the active restURL node id", () => {
      const restURLState = {
        ...initialState,
        activeNodeId: "https://api.fullstack.cash/v3/"
      };
      const state = ({ restURLs: restURLState } as unknown) as FullState;
      expect(activeNodeIdSelector(state)).toEqual(
        "https://api.fullstack.cash/v3/"
      );
    });
  });
});
