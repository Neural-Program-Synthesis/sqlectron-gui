import { ThunkResult } from '../reducers';
import { requestSQL } from '../api/index';

export const FETCH_SQL_REQUEST = 'FETCH_SQL_REQUEST';
export const FETCH_SQL_SUCCESS = 'FETCH_SQL_SUCCESS';
export const FETCH_SQL_FAILURE = 'FETCH_SQL_FAILURE';
export const SET_SQL_SUCCESS = 'SET_SQL_SUCCESS';
export const SET_SQL_FAILUER = 'SET_SQL_FAILUER';

// get schema, query
// return formal sql string
export function fetchSQLQuery(query?: string, schema?: string): ThunkResult<void> {
  return async (dispatch) => {
    const data = {
      query: query,
      // schema: schema,
      n: 3,
    };
    const sql_query = await requestSQL(data).then((resp) => {
      const resp_json = JSON.parse(resp['data']);
      // eliminate duplicate queries
      const uniqueQueries = resp_json['data'].filter((query, index) => {
        return resp_json['data'].indexOf(query) === index;
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

export function setTargetSQL(query?: string): ThunkResult<void> {
  return (dispatch) => {
    try {
      dispatch({ type: SET_SQL_SUCCESS, selected_query: query });
    } catch (error) {
      dispatch({ type: SET_SQL_FAILUER, error });
    }
  };
}
