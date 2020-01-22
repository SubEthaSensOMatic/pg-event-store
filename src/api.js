const addEvent = require('./addEvent');
const streamEvents = require('./streamEvents');
const ensureUniqueValue = require('./ensureUniqueValue');
const removeUniqueValue = require('./removeUniqueValue');
const getSnapshot = require('./getSnapshot');
const removeStream = require('./removeStream');
const loadAggregate = require('./loadAggregate');

module.exports = (pgp, database, schema) => {

  return {

    /**
     * Eventdata
     * @typedef EventToAdd
     * @type {Object}
     * @property {string} eventType Event type
     * @property {string} aggregateId Aggregate id
     * @property {string} aggregateType Aggregate type
     * @property {string} [correlationId] Correlation id
     * @property {string} [userId] Caused by user id
     * @property {Object} payload Event payload
     * @property {Object} [snapshot] Snapshot of aggregate state. If defined, a snapshot will be persisted.
     */

    /**
     * Result of adding event to store
     * @typedef AddEventResult
     * @type {Object}
     * @property {BigInt} sequenceId Added with this sequence id
     * @property {number} aggregateVersion New version of aggregate
     */

    /**
     * Add event to stream
     * @param {EventToAdd} event Event
     * @param {number} expectedVersion Expected aggregate version
     * @returns {Promise<AddEventResult>} Result of adding operation
     * @throws {Error} Throws error if concurrent conflict occurs
     */
    addEvent: async(event, expectedVersion) => await addEvent(pgp, database, schema, event, expectedVersion),

    /**
     * @typedef StreamedEvent
     * @type {Object}
     * @property {BigInt} sequenceId Sequence id
     * @property {string} eventType Type of event
     * @property {string} aggregateId Aggregate id
     * @property {string} aggregateType Type of aggregate
     * @property {number} aggregateVersion Aggregate version
     * @property {string} [userId] Caused by user
     * @property {string} [correlationId] Correlation id
     * @property {Date} createdAt Create at
     * @property {Object} payload
     */

    /**
     * Streaming events callback
     * @callback EventStreamCallback
     * @param {StreamedEvent} event Event
     * @returns {Promise<void>|void}
     */

    /**
     * Stream events
     * @param {Object} options Event
     * @param {BigInt} [options.fromSequenceId] Start sequence id (>=)
     * @param {BigInt} [options.toSequenceId] Stop sequence id (<=)
     * @param {string} [options.aggregateId] Aggregate id
     * @param {EventStreamCallback} callback Callback will be called for every streamed event
     * @returns {Promise<void>}
     */
    streamEvents: async(options, callback) => await streamEvents(pgp, database, schema, options, callback),

    /**
     * Remove all data associated with this aggregate id from store
     * @param {string} aggregateId Aggregate id
     * @returns Promise<void>
     */
    removeStream: async aggregateId => await removeStream(pgp, database, schema, aggregateId),

    /**
     * @typedef Snapshot
     * @type {Object}
     * @property {BigInt} sequenceId Sequence id
     * @property {string} aggregateId Aggregate id
     * @property {string} aggregateType Type of aggregate
     * @property {number} aggregateVersion Aggregate version
     * @property {Object} state
     */

    /**
     * Gets snapshot of aggregate if exists
     * @param {string} aggregateId Aggregate id
     * @returns {Promise<Snapshot|undefined>} Returns snapshot or undefined if snapshot does not exist.
     */
    getSnapshot: async aggregateId => await getSnapshot(pgp, database, schema, aggregateId),

    /**
     * Ensure that given value is unique within scope id
     * @param {string} scopeId Scope id
     * @param {string} aggregateId Associated with this aggregate
     * @param {string} value Unique value
     * @returns {Promise<void>}
     * @throws {Error} Throws error if value already exists within scope.
     */
    ensureUniqueValue: async(scopeId, aggregateId, value) => await ensureUniqueValue(pgp, database, schema, scopeId, aggregateId, value),

    /**
     * Remove unique value for aggregate from scope
     * @param {string} scopeId Scope id
     * @param {string} aggregateId Associated with this aggregate
     * @returns {Promise<boolean>} true, if value removed, else false
     */
    removeUniqueValue: async(scopeId, aggregateId) => await removeUniqueValue(pgp, database, schema, scopeId, aggregateId),

    /**
     * @typedef Aggregate
     * @type {Object}
     * @property {BigInt} sequenceId Sequence id
     * @property {string} aggregateId Aggregate id
     * @property {string} aggregateType Type of aggregate
     * @property {number} aggregateVersion Aggregate version
     * @property {Object} state
     */

    /**
     * Load aggregate. All events starting at sequence id 0 or at sequence id of last snapshot
     * will applied with reducer to initial state.
     * Aggregate type of returning object is only filled if aggregate is not new.
     * @param {string} Aggregat Id
     * @param {Object} [options] Optionen
     * @param {function} [options.eventReducer] Eventreducer
     * @param {Object} [options.initialState] Initialer Zustand
     * @returns {Promise<Aggregate>} Aggregat
     */
    loadAggregate: async(aggregateId, options) => await loadAggregate(pgp, database, schema, aggregateId, options),
  };
};
