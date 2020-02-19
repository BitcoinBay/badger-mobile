import { createSelector } from "reselect";
import { FullState } from "../store";

const artifactsSelector = (state: FullState) => state.artifacts;

const artifactsByIdSelector = (state: FullState) => state.artifacts.byId;

const activeArtifactIdSelector = (state: FullState) => state.artifacts.activeId;

const activeArtifactSelector = createSelector(
  artifactsByIdSelector,
  activeArtifactIdSelector,
  (byId, activeId) => {
    return activeId ? byId[activeId] : null;
  }
);

export { activeArtifactIdSelector, activeArtifactSelector };
