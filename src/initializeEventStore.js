'use strict';

module.exports = async db => {

  // Schema anlegen
  await db.database.task(async t => {

    // Schema
    await t.none(`CREATE SCHEMA IF NOT EXISTS "${db.schema}"`);

    // Events
    await t.none(`
            CREATE TABLE IF NOT EXISTS "${db.schema}".events
            (
                sequenceid bigserial NOT NULL,
                eventtype character varying(1024) NOT NULL,
                aggregateid character varying(64) NOT NULL,
                aggregatetype character varying(128) NOT NULL,
                aggregateversion integer NOT NULL,
                correlationid character varying(64),
                userid character varying(64),
                createdat timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
                payload jsonb NOT NULL,
                CONSTRAINT pk_events PRIMARY KEY (sequenceid),
                CONSTRAINT ux_aggregate_version UNIQUE (aggregateid, aggregateversion)
            )`);

    // Snapshot
    await t.none(`
            CREATE TABLE IF NOT EXISTS "${db.schema}".snapshots
            (
                sequenceid bigint NOT NULL,
                aggregateid character varying(64) NOT NULL,
                aggregateversion integer NOT NULL,
                aggregatetype character varying(128) NOT NULL,
                state jsonb NOT NULL,
                CONSTRAINT pk_snapshots PRIMARY KEY (aggregateid)
            )`);

    // Unqiues
    await t.none(`
            CREATE TABLE IF NOT EXISTS "${db.schema}".uniques
            (
                scopeid character varying(1024) NOT NULL,
                aggregateid character varying(64) NOT NULL,
                value character varying(1024) NOT NULL,
                CONSTRAINT pk_uniques PRIMARY KEY (scopeid, aggregateid, value),
                CONSTRAINT ux_uniques_value UNIQUE (scopeid, value)
            );
            CREATE INDEX IF NOT EXISTS idx_uniques_aggregateid ON "${db.schema}".uniques (aggregateid); `);
  });
};
