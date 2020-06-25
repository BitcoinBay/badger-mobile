import { createSelector } from "reselect";
import { FullState } from "../store";
import { State } from "react-native-gesture-handler";

const artifactsSelector = (state: FullState) => state.artifacts;

const artifactsAllIdsSelector = (state: FullState) => state.artifacts.allIds;

const artifactsByIdSelector = (state: FullState) => state.artifacts.byId;

const activeArtifactIdSelector = (state: FullState) => state.artifacts.activeId;

const hasArtifactSelector = createSelector(
  artifactsAllIdsSelector,
  allIds => allIds.length > 0
);

const artifactsAllIdsAndNamesSelector = createSelector(
  artifactsAllIdsSelector,
  artifactsByIdSelector,
  (allIds, byId) => {
    return allIds.map(id => ({ address: id, name: byId[id].contractName }));
  }
);

const activeArtifactSelector = createSelector(
  artifactsByIdSelector,
  activeArtifactIdSelector,
  (byId, activeId) => {
    return activeId ? byId[activeId] : null;
  }
);

const getArtifactSelector = createSelector(activeArtifactSelector, artifact => {
  return artifact && artifact.networks ? artifact : null;
});

export {
  artifactsByIdSelector,
  activeArtifactIdSelector,
  getArtifactSelector,
  artifactsAllIdsSelector,
  hasArtifactSelector,
  artifactsAllIdsAndNamesSelector
};
