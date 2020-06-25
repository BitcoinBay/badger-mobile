import { createSelector } from "reselect";
import { FullState } from "../store";

const accountsSelector = (state: FullState) => state.accounts;

const accountsByIdSelector = (state: FullState) => state.accounts.byId;

const activeAccountIdSelector = (state: FullState) => state.accounts.activeId;

const keypairsByAccountSelector = (state: FullState) =>
  state.accounts.keypairsByAccount;

const bchKeypairByAccountSelector = (
  state: FullState,
  address?: string | null
) => {
  if (!address) return null;

  const { keypairsByAccount } = state.accounts;

  if (!keypairsByAccount) return null;

  const accountKeypairs = keypairsByAccount[address];

  if (!accountKeypairs) return null;

  return accountKeypairs.bch;
};

const activeAccountSelector = createSelector(
  accountsByIdSelector,
  activeAccountIdSelector,
  (byId, activeId) => {
    return activeId ? byId[activeId] : null;
  }
);

const hasMnemonicSelector = createSelector(activeAccountSelector, account => {
  if (account && account.mnemonic) {
    return true;
  }
  return false;
});

const getMnemonicSelector = createSelector(activeAccountSelector, account => {
  return account ? account.mnemonic : "";
});

const getKeypairSelector = createSelector(
  keypairsByAccountSelector,
  activeAccountIdSelector,
  (keypairs, accountId) => {
    return keypairs && accountId ? keypairs[accountId] : null;
  }
);

const getAddressSelector = createSelector(activeAccountSelector, account => {
  return account ? account.address : "";
});

const getAddressSlpSelector = createSelector(activeAccountSelector, account => {
  return account ? account.addressSlp : "";
});

const getSeedViewedSelector = createSelector(activeAccountSelector, account => {
  return account && account.seedViewed;
});

export {
  activeAccountIdSelector,
  bchKeypairByAccountSelector,
  activeAccountSelector,
  accountsByIdSelector,
  getAddressSelector,
  getAddressSlpSelector,
  getKeypairSelector,
  getMnemonicSelector,
  hasMnemonicSelector,
  getSeedViewedSelector
};
