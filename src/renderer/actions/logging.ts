import { ThunkResult } from '../reducers';
import { requestLogging } from '../api/index';

// for interaction in payload
export const NL2SQLClick = 'NL2SQLClick';
export const SQLQuerySelected = 'SQLQuerySelected';
export const SQLQueryExecuted = 'SQLQueryExecuted';
export const CopyQueryButtonClicked = 'CopyQueryButtonClicked';
export const ExportResultsButtonClicked = 'ExportResultsButtonClicked';
export const LOG_EVENT_SUCCESS = 'LOG_EVENT_SUCCESS';
export const LOG_EVENT_FAILURE = 'LOG_EVENT_FAILURE';

export function logEvent(data): ThunkResult<void> {
  return async (dispatch) => {
    const result = await requestLogging(data);

    try {
      if (result.data === 'true') {
        dispatch({ type: LOG_EVENT_SUCCESS, data: data });
      } else {
        dispatch({ type: LOG_EVENT_FAILURE, data: data });
      }
    } catch (error) {
      dispatch({ type: LOG_EVENT_FAILURE, error });
    }
  };
}
