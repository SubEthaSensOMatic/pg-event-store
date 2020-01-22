const { isString } = require('./typeChecks');
const getSnapshot = require('./getSnapshot');
const streamEvents = require('./streamEvents');

const Ajv = require('ajv');
const ajv = new Ajv();

const validateOptions = ajv.compile({
  type: 'object',
  properties: {
    eventReducer: { typeof: 'function' },
    initialState: { typeof: 'object' },
  },
});

const standardReducer = (state, event) => ({ ...state, ...event.payload });

module.exports = async(pgp, database, schema, aggregateId, options = {}) => {

  if (!isString(aggregateId))
    throw new Error('Invalid parameter [aggregateId]!');

  if (!validateOptions(options))
    throw new Error('Invalid parameter [options]!');

  let aggregateVersion = 0;
  let sequenceId = BigInt(0);
  let state = options.initialState || {};
  let aggregateType;
  const eventReducer = options.eventReducer || standardReducer;

  await database.tx(async database => {
    const snapshot = await getSnapshot(pgp, database, schema, aggregateId);

    if (snapshot) {
      state = snapshot.state;
      sequenceId = snapshot.sequenceId;
      aggregateVersion = snapshot.aggregateVersion;
      aggregateType = snapshot.aggregateType;
    }

    const fromSequenceId = snapshot
      ? snapshot.sequenceId + BigInt(1)
      : BigInt(0);

    await streamEvents(pgp, database, schema, { aggregateId, fromSequenceId }, event => {
      state = eventReducer(state, event);
      aggregateVersion = event.aggregateVersion;
      sequenceId = event.sequenceId;
      aggregateType = event.aggregateType;
    });
  });

  return Object.freeze({
    sequenceId, aggregateId, aggregateVersion, aggregateType, state,
  });
};
