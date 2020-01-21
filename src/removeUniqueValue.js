'use strict';

const { isString } = require('./typeChecks');


module.exports = async(pgp, database, schema, scopeId, aggregateId) => {

  if (!isString(scopeId))
    throw new Error('Ungültiger Namensbereich!');
  if (!isString(aggregateId))
    throw new Error('Ungültige  Aggregat Id!');

  const row = await database.oneOrNone(`
        DELETE FROM "${schema}".uniques
        WHERE scopeid = $(scopeId)
          AND aggregateid = $(aggregateId)
        RETURNING scopeid`, {
    scopeId, aggregateId,
  });

  return row != null;
};
