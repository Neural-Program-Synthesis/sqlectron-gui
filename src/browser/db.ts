// TODO: Fix this once sqlectron-core has been migrated to typescript
// @ts-ignore
const sqlectron = require('sqlectron-core');

// Reference to current selected server connection
let serverConnection: any | null;

// Reference to current selected database connection
let dbConn: any | null;

const serverConnections: {
  [serverId: string]: {
    session: any;
    dbs: {
      [dbName: string]: any;
    };
  };
} = {};

export const connect = async function (
  id: string,
  databaseName: string,
  reconnecting: boolean = false,
  sshPassphrase: string,
) {
  console.log('***connect', { id, databaseName, reconnecting, sshPassphrase });
  let server: any | null;
  let database: any | null;
  let defaultDatabase: any | null;

  try {
    const cryptoSecret =
      'j[F6Y6NoWT}+YG|4c|-<89:ByJ83-9Aj?O8>$Zk/[WFk_~gFbg7<wm+*V|A{xQZ,';

    // TODO: Fix this once sqlectron-core has been migrated to typescript
    // @ts-ignore
    const servers = await sqlectron.servers.getAll();
    server = servers.find((srv: any) => srv.id === id);
    if (!server) {
      throw new Error('Server configuration not found');
    }

    server = sqlectron.servers.decryptSecrects(server, cryptoSecret);

    defaultDatabase = sqlectron.db.CLIENTS.find(
      (c: any) => c.key === server.client,
    ).defaultDatabase;
    database = databaseName || server.database || defaultDatabase;

    serverConnection = serverConnections[server.id];
    if (!serverConnection) {
      if (server.ssh) {
        if (
          server.ssh.privateKeyWithPassphrase &&
          typeof sshPassphrase === 'undefined'
        ) {
          // TODO: prompt for ssh passphrase
          return;
        }

        if (server.ssh.privateKeyWithPassphrase) {
          server.ssh.passphrase = sshPassphrase;
        }
      }
      serverConnection = {
        session: sqlectron.db.createServer(server),
        dbs: {},
      };
      serverConnections[server.id] = serverConnection;
    }

    dbConn = serverConnection.session.db(database);
    if (dbConn) {
      return {
        server,
        database,
        reconnecting,
      };
    }

    dbConn = serverConnection.session.createConnection(database);
    serverConnection.dbs[database] = dbConn;
    await dbConn.connect();

    return {
      server,
      database,
      reconnecting,
    };
  } catch (error) {
    console.log('****connect error', error);
    if (dbConn) {
      dbConn.disconnect();
      dbConn = null;
    }

    if (database && serverConnection && serverConnection.dbs[database]) {
      delete serverConnection.dbs[database];
    }

    // TODO: Close server connection if there are no other connections left
    // const currentConn = getState().connections;
    // if (!currentConn.databases.length) {
    //   this.disconnect();
    // }

    return {
      server,
      database,
      error,
    };
  }
};

export const listTables = async function () {
  console.log('***listTables fetching...');
  // TODO: Fix this once sqlectron-core has been migrated to typescript
  // @ts-ignore
  const tables = await dbConn.listTables();
  console.log('***listTables result', tables);
  return tables;
};

export const executeQuery = async function (query: string) {
  console.log('***executeQuery running...', query);
  // TODO: Fix this once sqlectron-core has been migrated to typescript
  // @ts-ignore
  const rows = await dbConn.executeQuery(query);
  console.log('***executeQuery result', rows);
  return rows;
};

export const listDatabases = async function () {
  console.log('***listDatabases fetching...');
  // TODO: Fix this once sqlectron-core has been migrated to typescript
  // @ts-ignore
  const results = await dbConn.executeQuery(`
    select schema_name as name
    from information_schema.schemata
    order by schema_name;
  `);
  console.log('***listDatabases result', results[0].rows);
  return results[0].rows;
};

export const openDatabase = async function (databaseName: string) {
  console.log('***openDatabase fetching...');
  // TODO: Fix this once sqlectron-core has been migrated to typescript
  // @ts-ignore
  const results = await dbConn.executeQuery(`
    USE ${databaseName}
  `);
  console.log('***openDatabase result', results);
};
