const { isString, isUndefinedOrNull } = require('./typeChecks');

module.exports = async(pgp, database, schema, scopeId, aggregateId, value) => {

  if (!isString(scopeId))
    throw new Error('Invalid parameter [scopeId]!');

  if (!isString(aggregateId))
    throw new Error('Invalid parameter [aggregateId]!');

  if (isUndefinedOrNull(value))
    throw new Error('Invalid parameter [value]');

  const row = await database.oneOrNone(`
    INSERT INTO "${schema}".uniques (scopeid, aggregateid, value)
    VALUES ($(scopeId), $(aggregateId), $(value))
    ON CONFLICT DO NOTHING
    RETURNING scopeid `, {
    scopeId, aggregateId, value,
  });

  if (row == null) {
    throw new Error(`Der Wert '${value}' ist bereits vergeben!`);
  } else {
    return {
      sequenceId: row.sequenceid,
      aggregateVersion: row.aggregateversion,
      createdAt: row.createdat,
    };
  }
};
