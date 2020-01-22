const { isString } = require('./typeChecks');

module.exports = async(pgp, database, schema, aggregateId) => {
  if (!isString(aggregateId))
    throw new Error('Invalid parameter [aggregateId]!');

  await database.none(`
    DELETE FROM "${schema}".uniques WHERE aggregateid = $(aggregateId);
    DELETE FROM "${schema}".snapshots WHERE aggregateid = $(aggregateId);
    DELETE FROM "${schema}".events WHERE aggregateid = $(aggregateId);`, { aggregateId });
};
