import { ThunkResult } from '../reducers';
import { requestSQL } from '../api/index';
// import { uniq } from 'lodash';

export const FETCH_SQL_REQUEST = 'FETCH_SQL_REQUEST';
export const FETCH_SQL_SUCCESS = 'FETCH_SQL_SUCCESS';
export const FETCH_SQL_FAILURE = 'FETCH_SQL_FAILURE';
export const FETCH_SQL_IN_PROGRESS = 'FETCH_SQL_IN_PROGRESS';
export const CLEAR_EVERYTHING = 'CLEAR_EVERYTHING';
export const SET_SQL_SUCCESS = 'SET_SQL_SUCCESS';
export const SET_SQL_FAILUER = 'SET_SQL_FAILUER';
const TopNQuery = 3;

// import WebSocket from "ws";

// get schema, query
// return formal sql string
export function fetchSQLQuery(query?: string, schema?: string): ThunkResult<void> {
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
      const uniqueQueries = queries.filter(({ sql, source }, index) => {
        return queries.map(({ sql, source }) => sql).indexOf(sql) === index;
      });
      return uniqueQueries;
    });
    try {
      dispatch({ type: FETCH_SQL_SUCCESS, queries: sql_query });
    } catch (error) {
      dispatch({ type: FETCH_SQL_FAILURE, error });
    }
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
      dispatch({ type: SET_SQL_FAILUER, error });
    }
  };
}
