import { ThunkResult } from '../reducers';
import { requestSQL, requestEdit } from '../api/index';
// import { uniq } from 'lodash';

export const FETCH_SQL_SUCCESS = 'FETCH_SQL_SUCCESS';
export const FETCH_SQL_FAILURE = 'FETCH_SQL_FAILURE';
export const FETCH_SQL_IN_PROGRESS = 'FETCH_SQL_IN_PROGRESS';

export const EDIT_SQL_SUCCESS = 'EDIT_SQL_SUCCESS';
export const EDIT_SQL_FAILURE = 'EDIT_SQL_FAILURE';
export const EDIT_SQL_IN_PROGRESS = 'EDIT_SQL_IN_PROGRESS';

export const CLEAR_EVERYTHING = 'CLEAR_EVERYTHING';
export const SET_SQL_SUCCESS = 'SET_SQL_SUCCESS';
export const SET_SQL_FAILURE = 'SET_SQL_FAILURE';

export const SELECT_CELL = 'SELECT_CELL';
export const UNSELECT_ALL = 'UNSELECT_ALL';

const TopNQuery = 3;

// import WebSocket from "ws";

// get schema, query
// return formal sql string
export function fetchSQLQuery(query?: string, schema?: any): ThunkResult<void> {
  return async (dispatch) => {
    dispatch({ type: FETCH_SQL_IN_PROGRESS });
    const data = {
      query: query,
      sqlschema: schema,
      n: TopNQuery,
    };
    // const ws = new WebSocket("wss://www.example.com/socketserver");
    const tStart = performance.now();
    const sql_query = await requestSQL(data).then((resp) => {
      const tEnd = performance.now();
      // console.log('Time taken: ', tEnd - tStart);
      const queries = JSON.parse(resp['data'])['generated'];
      // eliminate duplicate queries
      const uniqueQueries = queries.filter(({ sql }, index) => {
        return queries.map(({ sql }) => sql).indexOf(sql) === index;
      });
      return uniqueQueries;
    });
    try {
      const annotation = `Generated from "${query}"`;
      dispatch({ type: FETCH_SQL_SUCCESS, queries: sql_query, annotation: annotation });
    } catch (error) {
      dispatch({ type: FETCH_SQL_FAILURE, error });
    }
  };
}

export function editSQL({ query, selection, command, schema }) {
  return async (dispatch) => {
    dispatch({ type: EDIT_SQL_IN_PROGRESS });

    try {
      const editResponse = await requestEdit({
        query: query,
        command: command,
        sqlschema: schema,
        selection: selection,
      });
      const editedQuery = await JSON.parse(editResponse.data);

      const annotation = `Edited from "${query}" with command "${command}"`;
      dispatch({ type: EDIT_SQL_SUCCESS, editedQuery: editedQuery, annotation: annotation });
    } catch (error) {
      dispatch({ type: EDIT_SQL_FAILURE, error: String(error) });
    }
  };
}

export function selectCell({
  row,
  col,
  isHeader,
}: {
  row: number;
  col: string;
  isHeader: boolean;
}) {
  return (dispatch) => {
    dispatch({ type: SELECT_CELL, row, col, isHeader });
  };
}

export function unselectAll() {
  return (dispatch) => {
    dispatch({ type: UNSELECT_ALL });
  };
}

export function clearEverything(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: CLEAR_EVERYTHING });
  };
}

export function setTargetSQL(query?: string): ThunkResult<void> {
  return (dispatch) => {
    try {
      dispatch({ type: SET_SQL_SUCCESS, selectedQuery: query });
    } catch (error) {
      dispatch({ type: SET_SQL_FAILURE, error });
    }
  };
}
