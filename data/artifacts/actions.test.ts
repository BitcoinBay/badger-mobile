import { AnyAction } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import configureMockStore from "redux-mock-store";
import fetchMock from "fetch-mock";

import * as actions from "./actions";
import * as actionTypes from "./constants";
import { FullState } from "../store";

type DispatchExts = ThunkDispatch<FullState, void, AnyAction>;

const middlewares = [thunk];
const mockStore = configureMockStore<FullState, DispatchExts>(middlewares);
