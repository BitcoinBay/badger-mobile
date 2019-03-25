// @flow

import { createStore, combineReducers, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import ReduxThunk from "redux-thunk";

import accountsReducer, {
  type State as StateAccount,
  initialState as initialAccountState
} from "./accounts/reducer";

import transactionsReducer, {
  type State as StateTransactions,
  initialState as initialTransactionsState
} from "./transactions/reducer";

export type FullState = {
  accounts: StateAccount,
  transactions: StateTransactions
};

const initialState: FullState = {
  accounts: initialAccountState,
  transactions: initialTransactionsState
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["accounts"]
};

const rootReducer = combineReducers({
  accounts: accountsReducer,
  transactions: transactionsReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const Logger = ({ getState }) => {
  return next => action => {
    if (__DEV__) {
      console.log("::LOG_ACTION::", action);
    }
    return next(action);
  };
};

const middleware = [Logger, ReduxThunk];

const getStore = () => {
  const store = createStore(
    persistedReducer,
    initialState,
    applyMiddleware(...middleware)
  );
  const persistor = persistStore(store);
  return { store, persistor };
};

export { getStore };
