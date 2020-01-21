'use strict';

const Ajv = require('ajv');
const ajv = new Ajv();

const validateEvents = ajv.compile({
    type: 'object',
    properties: {
        eventType: { type: 'string' },
        aggregateId: { type: 'string' },
        aggregateType: { type: 'string' },
        correlationId: { type: 'string' },
        userId: { type: 'string' },
        payload: { type: 'object' },
        snapshot: { type: 'object' }
    },
    requiredProperties: [ 'eventType', 'aggregateId', 'aggregateType', 'payload']
});

module.exports = async (pgp, database, schema, event, expectedAggregateVersion) => {
    if (!validateEvents(event))
        throw new Error('Ungültiger Paramter [events]!');

    let stmt = `
        WITH
            new_event AS (
                SELECT $(eventType) eventtype, $(aggregateId) aggregateid, $(aggregateType) aggregatetype,
                    $(expectedVersion) + 1 aggregateversion, $(correlationId) correlationid, $(userId) userid,
                    $(payload)::jsonb payload, $(expectedVersion) expectedversion,
                    (select coalesce(max(aggregateversion), 0)
                FROM '${schema}'.events
                WHERE aggregateid = $(aggregateId)) currentversion
            ) `;

    const eventInsertStmt = `
        INSERT INTO '${schema}'.events (eventtype, aggregateid, aggregatetype,  aggregateversion, correlationid, userid, payload)
        SELECT eventtype, aggregateid, aggregatetype, aggregateversion, correlationid, userid, payload
        FROM new_event
        WHERE new_event.expectedversion = new_event.currentversion
        RETURNING sequenceid, aggregateversion `;

    if (event.snapshot) {
        stmt = stmt + `
            , insert_event AS ( ${eventInsertStmt} )
            INSERT INTO '${schema}'.snapshots (sequenceid, aggregateid, aggregateversion, aggregatetype, state)
            SELECT sequenceid, $(aggregateId), aggregateversion, $(aggregateType), $(snapshot)::jsonb
            FROM insert_event
            RETURNING sequenceid, aggregateid `;
    }
    else {
        stmt += eventInsertStmt;
    }

    const row = await database.oneOrNone(stmt, {
            ...event,
            correlationId: event.correlationId || null,
            userId: event.userId || null,
            snapshot: event.snapshot || null,
            expectedVersion: parseInt(expectedAggregateVersion)
        });

    if (row == null) {
        throw new Error('Ein anderer Benutzer hat den Datensatz bereits geändert oder gelöscht. Bitte überprüfen Sie die Änderungen, bevor Sie es erneut versuchen.');
    }
    else {
        return {
            sequenceId: row.sequenceid,
            aggregateVersion: row.aggregateversion
        }
    }
}
