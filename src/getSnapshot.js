'use strict';

const { isString } = require('./typeChecks');

module.exports = async(pgp, database, schema, aggregateId) => {
  if (!isString(aggregateId))
    throw new Error('Ungültiger Paramter [aggregateId]!');

  const row = await database.oneOrNone(`
        SELECT sequenceid, aggregateid, aggregateversion, aggregatetype, state
        FROM "${schema}".snapshots
        WHERE aggregateid = $(aggregateId)`, { aggregateId });

  if (row == null) {
    return undefined;
  } else {
    return {
      sequenceId: row.sequenceid,
      aggregateId: row.aggregateid,
      aggregateVersion: row.aggregateversion,
      aggregateType: row.aggregatetype,
      state: row.state,
    };
  }
};
