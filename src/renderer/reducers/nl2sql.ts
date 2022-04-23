import { string } from 'prop-types';
import { Reducer } from 'redux';
import * as types from '../actions/nl2sql';

// export interface SelectedCell {
//   col: string;
//   rowIndex: number;
//   isHeaderCell: boolean;
// }

// export const formatSelection = (rowIndex, col, isHeader): String => `${rowIndex},${col},${isHeader}`;
// export const isCurrentlySelected = (selectedCells: Set<String>, rowIndex, col, isHeader): boolean => {
//   const formatted = formatSelection(rowIndex, col, isHeader);
//   const headerFormatted = formatSelection(-1, col, true);
//   if (selectedCells.has(formatted)) {
//     return true;
//   } else if (selectedCells.has(headerFormatted)) {
//     return true;
//   }
//   return false;
// }

export interface NL2SQLState {
  queries: Array<string> | null;
  selectedQuery: string;
  annotation: null | string;
  isCalling: boolean;
  events: Array<any>;
  isEditing: boolean;
  errorMessage: string;
  // selectedCells: Set<string>;
  selectedCellRow: number;
  selectedCellCol: string;
  selectedCellIsHeader: boolean;
  // lastNL: string;
}

const INITIAL_STATE: NL2SQLState = {
  queries: null,
  selectedQuery: '',
  annotation: null,
  isCalling: false,
  events: [],
  isEditing: false,
  errorMessage: '',
  // selectedCells: new Set(),
  selectedCellRow: -1,
  selectedCellCol: '',
  selectedCellIsHeader: false,
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
    case types.SELECT_CELL: {
      return {
        ...state,
        // selectedCells: state.selectedCells.add(`${action.row},${action.col},${action.isHeader}`),
        selectedCellRow: action.row,
        selectedCellCol: action.col,
        selectedCellIsHeader: action.isHeader,
      };
    }
    case types.UNSELECT_ALL: {
      return {
        ...state,
        // selectedCells: new Set(),
        selectedCellRow: -1,
        selectedCellCol: '',
        selectedCellIsHeader: false,
      };
    }
    case types.CLEAR_EVERYTHING: {
      return {
        ...state,
        queries: null,
        selectedQuery: '',
        annotation: null,
        isCalling: false,
        isEditing: false,
        errorMessage: '',
        // selectedCellRow: -1,
        // selectedCellCol: '',
        // selectedCellIsHeader: false,
      };
    }
    default:
      return state;
  }
};

export default NL2SQLReducer;
