import { Reducer } from 'redux';
import * as types from '../actions/nl2sql';

export interface NL2SQLState {
  queries: Array<string>;
  selectedQuery: string;
  isCalling: boolean;
  events: Array<any>;
  // lastNL: string;
}

const INITIAL_STATE: NL2SQLState = {
  queries: [],
  selectedQuery: '',
  isCalling: false,
  events: [],
  // lastNL: ''
};

const NL2SQLReducer: Reducer<NL2SQLState> = function (
  state: NL2SQLState = INITIAL_STATE,
  action,
): NL2SQLState {
  switch (action.type) {
    case types.FETCH_SQL_IN_PROGRESS: {
      return {
        ...state,
        isCalling: true,
        selectedQuery: '',
      };
    }
    case types.FETCH_SQL_SUCCESS: {
      return {
        ...state,
        queries: action.queries,
        isCalling: false,
        // lastNL: action.lastNL
      };
    }
    case types.FETCH_SQL_FAILURE: {
      return {
        ...state,
        isCalling: false,
      };
    }
    case types.SET_SQL_SUCCESS: {
      return {
        ...state,
        selectedQuery: action.selectedQuery,
        isCalling: false,
      };
    }
    case types.SET_SQL_FAILUER: {
      return {
        ...state,
        isCalling: false,
      };
    }
    case types.CLEAR_EVERYTHING: {
      return {
        ...state,
        queries: [],
        selectedQuery: '',
        isCalling: false,
      };
    }
    default:
      return state;
  }
};

export default NL2SQLReducer;
