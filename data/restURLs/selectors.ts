import { createSelector } from "reselect";
import { FullState } from "../store";

const nodesSelector = (state: Fullstate) => state.restURLs;

const nodesByNodeIdSelector = (state: Fullstate) => state.restURLs.byNodeId;

const activeNodeIdSelector = (state: Fullstate) => state.restURLs.activeNodeId;

const activeNodeSelector = createSelector(
  nodesByNodeIdSelector,
  activeNodeIdSelector,
  (byNodeId, activeNodeId) => {
    return activeNodeId ? byNodeId[activeNodeId] : null;
  }
);

const hasNodeApiToken = createSelector(activeNodeSelector, node => {
  return node.apiToken ? true : false;
});

const getNodeApiToken = createSelector(activeNodeSelector, node => {
  return node.apiToken ? node.apiToken : null;
});

export {
  activeNodeSelector,
  activeNodeSelector,
  getNodeApiToken,
  hasNodeApiToken,
  nodesByNodeIdSelector
};
