import { Reducer } from 'redux';
import * as types from '../actions/voiceCommands';

export interface VoiceCommandState {
  parsedCommandText: null | string;
  parsedCommandConfidence: null | number;
  errorMessage: null | string;
}

const INITIAL_STATE: VoiceCommandState = {
  parsedCommandText: null,
  parsedCommandConfidence: null,
  errorMessage: null,
};

const Logging: Reducer<VoiceCommandState> = function (
  state: VoiceCommandState = INITIAL_STATE,
  action,
): VoiceCommandState {
  switch (action.type) {
    case types.VOICE_COMMAND_CLEAR:
      return {
        ...INITIAL_STATE,
      };

    case types.VOICE_COMMAND_RECOGNITION_SUCCESS:
      return {
        ...state,
        parsedCommandText: action.transcript,
        parsedCommandConfidence: action.confidence,
      };
    case types.VOICE_COMMAND_FAILURE:
      return {
        ...INITIAL_STATE,
        errorMessage: action.errorMessage,
      };
    default:
      return state;
  }
};

export default Logging;
