const { isPromise, isFunction } = require('./typeChecks');
const api = require('./api');

module.exports = async(pgp, database, schema, callback) => {
  if (!isFunction(callback))
    throw Error('Transactional callback has to be of type [function]!');

  return await database.tx(async t => {

    let result = callback(api(pgp, t, schema));

    if (isPromise(result))
      result = await result;

    return result;
  });
};
