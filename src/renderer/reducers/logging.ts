import { Reducer } from 'redux';
import * as types from '../actions/logging';

export interface LoggingState {
  status: string;
}

const INITIAL_STATE: LoggingState = {
  status: '',
};

const Logging: Reducer<LoggingState> = function (
  state: LoggingState = INITIAL_STATE,
  action,
): LoggingState {
  switch (action.type) {
    case types.LOG_EVENT_SUCCESS:
      return {
        ...state,
        status: action.data,
      };

    case types.LOG_EVENT_FAILURE:
      return {
        ...state,
        status: action.data,
      };
    default:
      return state;
  }
};

export default Logging;
