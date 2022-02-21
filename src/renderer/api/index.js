import Fetcher from './fetch';
import * as routes from './routes';

const nl2sqlfetcher = new Fetcher(routes.nl2sqlEndpoint, true);
export const requestSQL = (data) => nl2sqlfetcher.post(routes.queryRoute, data);
