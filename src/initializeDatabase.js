const pgp = require('pg-promise')({});
const moment = require('moment');
const { isString } = require('./typeChecks');

pgp.pg.types.setTypeParser(1114, str => moment.utc(str).format());
pgp.pg.types.setTypeParser(20, BigInt);

module.exports = config => {

  const schema = isString(config.schema)
    ? config.schema
    : 'eventstore';

  const database = pgp(config);

  return {
    schema,
    pgp,
    database,
  };
};
