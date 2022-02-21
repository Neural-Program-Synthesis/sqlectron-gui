import { ThunkResult } from '../reducers';
import { requestSQL } from '../api/index';

export const FETCH_SQL_REQUEST = 'FETCH_SQL_REQUEST';
export const FETCH_SQL_SUCCESS = 'FETCH_SQL_SUCCESS';
export const FETCH_SQL_FAILURE = 'FETCH_SQL_FAILURE';

// get schema, query
// return formal sql string
export function fetchSQLQuery(query?: string, schema?: string): ThunkResult<void> {
  return async (dispatch) => {
    const data = {
      query: query,
      schema: schema,
    };
    const sql_query = await requestSQL(data).then((resp) => {
      return resp;
    });
    try {
      dispatch({ type: FETCH_SQL_SUCCESS, query: sql_query.data });
    } catch (error) {
      dispatch({ type: FETCH_SQL_FAILURE, error });
    }
  };
}
