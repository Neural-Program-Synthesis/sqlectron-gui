import Fetcher from './fetch';
import * as routes from './routes';

const nl2sqlfetcher = new Fetcher(routes.nl2sqlEndpoint, true);
const voiceDataFetcher = new Fetcher(routes.nl2sqlEndpoint, true, 'multipart/form-data');

export const requestInit = (data) => nl2sqlfetcher.post(routes.initRoute, data);
export const requestSQL = (data) => nl2sqlfetcher.post(routes.queryRoute, data);
export const requestLogging = (data) => nl2sqlfetcher.post(routes.loggingRoute, data);
export const requestEdit = (data) => nl2sqlfetcher.post(routes.editRoute, data);
export const requestSpeechRecognition = (data) =>
  voiceDataFetcher.post(routes.recognizeRoute, data);
