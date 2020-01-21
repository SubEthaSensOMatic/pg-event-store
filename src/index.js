'use strict';

const initDb = require('./initializeDatabase');
const initializeEventStore = require('./initializeEventStore');
const eventStoreApi = require('./api');
const eventStoreTransactionalApi = require('./transactionalApi');

module.exports = async config => {

    const db = initDb(config);

    try {
        await initializeEventStore(db);
    }
    catch (err) {
        db.database.$pool.end();
        throw err;
    }

    const noneTransactionalApi = eventStoreApi(db.pgp, db.database, db.schema);

    return {
        ...noneTransactionalApi,
        tx: async action => await eventStoreTransactionalApi(db.pgp, db.database, db.schema, action),
        end: () => db.database.$pool.end()
    }
}
