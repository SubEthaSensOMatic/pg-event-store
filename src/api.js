'use strict';

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
         * Event zum Stream hinzufügen
         * @param {Object} event Event
         * @param {string} event.eventType Event Typ
         * @param {string} event.aggregateId Aggregat Id
         * @param {string} event.aggregateType Aggregat Typ
         * @param {string} [event.correlationId] Zusammenhangsid
         * @param {string} [event.userId] Auslösender Benutzer
         * @param {Object} event.payload Eventdaten
         * @param {Object} [event.snapshot] Snapshot des Aggregats
         * @param {number} expectedVersion Aktuell angenommene Aggregat Version
         * @returns {Promise<{ sequenceId: BigInt, aggregateVersion: number }>} Ergebnis
         * @throws {Error} Im Konfliktfall wird ein Error geworfen
         */
    addEvent: async(event, expectedVersion) => await addEvent(pgp, database, schema, event, expectedVersion),

    /**
         * Events streamen
         * @param {Object} options Event
         * @param {BigInt} [options.fromSequenceId] Start Seq.Id (>=)
         * @param {BigInt} [options.toSequenceId] Stop Seq.Id (<=)
         * @param {string} [options.aggregateId] Aggregat Id
         * @param {callback} callback Callback wird pro Event aufgerufen
         */
    streamEvents: async(options, callback) => await streamEvents(pgp, database, schema, options, callback),

    /**
         * Eventsteam, Uniques und Snapshot zur Aggregat Id entfernen
         * @returns Promise<void>
         */
    removeStream: async aggregateId => await removeStream(pgp, database, schema, aggregateId),

    /**
         * Snapshot laden, falls vorhanden
         * @param {string} aggregateId Aggregat id
         * @returns {Promise<{ sequenceId: BigInt, aggregateId: string, aggregateVersion: number, aggregateType: string, state: any }|undefined>}
         */
    getSnapshot: async aggregateId => await getSnapshot(pgp, database, schema, aggregateId),

    /**
         * Eindeutigen Wert festlegen
         * @param {string} scopeId Wertebereichs Id
         * @param {string} aggregateId Vernwedet im Aggregate mit der Id
         * @param {string} value Der eindeutige Wert
         */
    ensureUniqueValue: async(scopeId, aggregateId, value) => await ensureUniqueValue(pgp, database, schema, scopeId, aggregateId, value),

    /**
         * Eindeutigen Wert für Aggregat entfernen
         * @param {string} scopeId Wertebereichs Id
         * @param {string} aggregateId Vernwedet im Aggregate mit der Id
         * @returns {Promise<boolean>} true, wenn Wert gelöscht wurde, sonst false
         */
    removeUniqueValue: async(scopeId, aggregateId) => await removeUniqueValue(pgp, database, schema, scopeId, aggregateId),

    /**
         * Aggregat laden. Alle Events ab SequenceId 0 bzw. letztem Snapshot werden
         * auf den Initialen- bzw. Snapshotzustand über den Reducer angewendet.
         * Im Ergebnisobjekt ist aggregateType nur bei bereits persistenten Aggregaten gefüllt.
         * @param {string} Aggregat Id
         * @param {object} [options] Optionen
         * @param {function} [options.eventReducer] Eventreducer
         * @param {any} [options.initialState] Initialer Zustand
         * @returns { sequenceId: BigInt, aggregateId: string, aggregateVersion: number, aggregateType: string, state: any } Aggregat
         */
    loadAggregate: async(aggregateId, options) => await loadAggregate(pgp, database, schema, aggregateId, options),
  };
};
