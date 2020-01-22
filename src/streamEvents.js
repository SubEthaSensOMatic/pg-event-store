const { Writable } = require('stream');
const { isPromise } = require('./typeChecks');
const QueryStream = require('pg-query-stream');

const Ajv = require('ajv');
const ajv = new Ajv();

const validateOptions = ajv.compile({
  type: 'object',
  properties: {
    fromSequenceId: { typeof: 'bigint' },
    toSequenceId: { typeof: 'bigint' },
    aggregateId: { type: 'string' },
  },
});

const rowToEvent = row => Object.freeze({
  sequenceId: row.sequenceid,
  eventType: row.eventtype,
  aggregateId: row.aggregateid,
  aggregateType: row.aggregatetype,
  aggregateVersion: row.aggregateversion,
  userId: row.userid || undefined,
  correlationId: row.correlationid || undefined,
  createdAt: row.createdat,
  payload: row.payload,
});

const eventWritable = callback => new Writable({
  objectMode: true,
  write: (row, _, done) => {
    (async() => {
      try {
        const event = rowToEvent(row);
        const result = callback(event);

        if (isPromise(result))
          await result;
        done();
      } catch (err) {
        done(err);
      }
    })();
  },
});

module.exports = (pgp, database, schema, options, callback) => new Promise((resolve, reject) => {
  try {
    if (!validateOptions(options))
      throw new Error('Invalid parameter [options]!');

    let query = `SELECT * FROM "${schema}".events WHERE 1=1 `;

    if (options.fromSequenceId)
      query += ' AND sequenceid >= $(fromSequenceId) ';

    if (options.toSequenceId)
      query += ' AND sequenceid <= $(toSequenceId) ';

    if (options.aggregateId)
      query += ' AND aggregateid = $(aggregateId) ';

    query += ' ORDER BY sequenceid ASC';

    query = pgp.as.format(query, options);

    const qs = new QueryStream(query);

    database.stream(
      qs,
      stream => {
        stream
          .pipe(eventWritable(callback))
          .on('error', err => reject(err))
          .on('finish', () => resolve());

      }).then(() => {}, err => reject(err));
  } catch (err) {
    reject(err);
  }
});
