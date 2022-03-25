import { string } from 'prop-types';
import { Reducer } from 'redux';
import * as types from '../actions/nl2sql';

export interface NL2SQLState {
  queries: Array<string>;
  selectedQuery: string;
  annotation: null | string;
  isCalling: boolean;
  events: Array<any>;
  isEditing: boolean;
  errorMessage: string;
  // lastNL: string;
}

const INITIAL_STATE: NL2SQLState = {
  queries: [],
  selectedQuery: '',
  annotation: null,
  isCalling: false,
  events: [],
  isEditing: false,
  errorMessage: '',
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
        isEditing: false,
        selectedQuery: '',
        // annotation: '',
        errorMessage: '',
      };
    }
    case types.FETCH_SQL_SUCCESS: {
      return {
        ...state,
        queries: action.queries,
        isCalling: false,
        annotation: action.annotation,
        // lastNL: action.lastNL
      };
    }
    case types.FETCH_SQL_FAILURE: {
      return {
        ...state,
        isCalling: false,
        errorMessage: action.error,
      };
    }

    case types.EDIT_SQL_IN_PROGRESS: {
      return {
        ...state,
        isEditing: true,
        errorMessage: '',
      };
    }
    case types.EDIT_SQL_SUCCESS: {
      return {
        ...state,
        isEditing: false,
        selectedQuery: action.editedQuery,
        annotation: action.annotation,
        // lastNL: action.lastNL
      };
    }
    case types.EDIT_SQL_FAILURE: {
      return {
        ...state,
        isEditing: false,
        errorMessage: action.error,
      };
    }

    case types.SET_SQL_SUCCESS: {
      return {
        ...state,
        selectedQuery: action.selectedQuery,
        isCalling: false,
      };
    }
    case types.SET_SQL_FAILURE: {
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
        annotation: null,
        isCalling: false,
        isEditing: false,
        errorMessage: '',
      };
    }
    default:
      return state;
  }
};

export default NL2SQLReducer;
