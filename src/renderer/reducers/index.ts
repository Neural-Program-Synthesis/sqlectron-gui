import { combineReducers, Reducer, AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';
import config, { ConfigState } from './config';
import databases, { DatabaseState } from './databases';
import servers, { ServerState } from './servers';
import queries, { QueryState } from './queries';
import connections, { ConnectionState } from './connections';
import schemas, { SchemaState } from './schemas';
import tables, { TableState } from './tables';
import status from './status';
import views, { ViewState } from './views';
import routines, { RoutineState } from './routines';
import columns, { ColumnState } from './columns';
import triggers, { TriggerState } from './triggers';
import indexes, { IndexState } from './indexes';
import sqlscripts, { ScriptState } from './sqlscripts';
import nl2sqls, { NL2SQLState } from './nl2sql';
import voiceCommands, { VoiceCommandState } from './voiceCommands';
import keys, { KeyState } from './keys';
import tablecolumns, { TableColumnState } from './table_columns';

export type ThunkResult<R> = ThunkAction<R, ApplicationState, undefined, AnyAction>;

// The top-level state object
export interface ApplicationState {
  config: ConfigState;
  databases: DatabaseState;
  servers: ServerState;
  queries: QueryState;
  connections: ConnectionState;
  tablecolumns: TableColumnState;
  schemas: SchemaState;
  tables: TableState;
  status: string;
  views: ViewState;
  routines: RoutineState;
  columns: ColumnState;
  triggers: TriggerState;
  indexes: IndexState;
  sqlscripts: ScriptState;
  keys: KeyState;
  nl2sqls: NL2SQLState;
  voiceCommands: VoiceCommandState;
}

const rootReducer: Reducer<ApplicationState> = combineReducers<ApplicationState>({
  config,
  databases,
  servers,
  queries,
  connections,
  tablecolumns,
  schemas,
  tables,
  status,
  views,
  routines,
  columns,
  triggers,
  indexes,
  sqlscripts,
  keys,
  nl2sqls,
  voiceCommands,
});

export default rootReducer;
