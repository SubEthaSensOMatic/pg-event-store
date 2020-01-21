'use strict';

const { isPromise, isFunction } = require('./typeChecks');
const api = require('./api');

module.exports = async(pgp, database, schema, action) => {
  if (!isFunction(action))
    throw Error('Transaktionale Aktion muss vom Type [function] sein!');

  return await database.tx(async t => {

    let result = action(api(pgp, t, schema));

    if (isPromise(result))
      result = await result;

    return result;
  });
};
