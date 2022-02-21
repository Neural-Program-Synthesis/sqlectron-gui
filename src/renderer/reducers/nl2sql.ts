import { Reducer } from 'redux';
import * as types from '../actions/nl2sql';

export interface NL2SQLState {
  query: string;
}

const INITIAL_STATE: NL2SQLState = {
  query: '',
};

const NL2SQLReducer: Reducer<NL2SQLState> = function (
  state: NL2SQLState = INITIAL_STATE,
  action,
): NL2SQLState {
  switch (action.type) {
    case types.FETCH_SQL_SUCCESS: {
      return {
        ...state,
        query: action.query,
      };
    }
    default:
      return state;
  }
};

export default NL2SQLReducer;
