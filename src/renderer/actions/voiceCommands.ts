import { ThunkResult } from '../reducers';
import { requestSpeechRecognition } from '../api/index';
import * as FileHandler from '../utils/file';
import fetch from 'node-fetch';

// export const RECORDING_START = 'RECORDING_START';
// export const RECORDING_STOP = 'RECORDING_STOP';
// export const RECORDING_CANCEL = 'RECORDING_CANCEL';

export const VOICE_COMMAND_CLEAR = 'VOICE_COMMAND_CLEAR';
export const VOICE_COMMAND_SAVE_SUCCESS = 'VOICE_COMMAND_SAVE_SUCCESS';
export const VOICE_COMMAND_RECOGNITION_SUCCESS = 'VOICE_COMMAND_RECOGNITION_SUCCESS';
export const VOICE_COMMAND_FAILURE = 'VOICE_COMMAND_FAILURE';

const blobToFile = (theBlob: Blob, fileName: string): File => {
  return new File([theBlob], fileName, { lastModified: new Date().getTime(), type: theBlob.type });
};

export function voiceCommand(audioData: Blob): ThunkResult<void> {
  return async (dispatch) => {
    dispatch({ type: VOICE_COMMAND_CLEAR });
    try {
      const { data } = await requestSpeechRecognition(audioData);
      const { transcript, confidence } = await JSON.parse(data);
      dispatch({ type: VOICE_COMMAND_RECOGNITION_SUCCESS, transcript, confidence });
    } catch (error) {
      dispatch({ type: VOICE_COMMAND_FAILURE, errorMessage: String(error) });
    }
  };
}
