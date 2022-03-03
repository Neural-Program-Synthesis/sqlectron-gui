import { Reducer } from 'redux';
import * as types from '../actions/nl2sql';

export interface NL2SQLState {
  queries: [];
  selected_query: string;
}

const INITIAL_STATE: NL2SQLState = {
  queries: [],
  selected_query: '',
};

const NL2SQLReducer: Reducer<NL2SQLState> = function (
  state: NL2SQLState = INITIAL_STATE,
  action,
): NL2SQLState {
  switch (action.type) {
    case types.FETCH_SQL_SUCCESS: {
      return {
        ...state,
        queries: action.queries,
      };
    }
    case types.SET_SQL_SUCCESS: {
      return {
        ...state,
        selected_query: action.selected_query,
      };
    }
    default:
      return state;
  }
};

export default NL2SQLReducer;
