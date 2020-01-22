# pg-event-store

PostgreSQL based Node.js javascript event store

## Install

Install with npm

```shell
npm install pg-event-store
```

or with yarn

```shell
yarn add pg-event-store
```

## Usage

### Initialization of store

```js
// Require factory function
const EventStore = require('pg-event-store');

// Initialization has to be called in async context
(async () => {

  // Create new store
  const connection = {
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: 'mySecretPassword',
    database: 'mydatabase',
    schema: 'eventstore'
  };

  const myStore = await EventStore(connection);

})();
```

The event store internally uses [pg-promise](https://github.com/vitaly-t/pg-promise) to access the PostgreSQL server. So the connection options are the same as for pg-promise and are passed directly to pg-promise module. See pg-promise [documentation](https://github.com/vitaly-t/pg-promise/wiki/Connection-Syntax#configuration-object) for possible parameters.

When you create a new event store instance three tables will be created in the PostgreSQL database in the specified schema, if they not already exist. It is necessary, that the specified user has permissions to create schema and tables.

#### Database tables

* **[schema].events** Contains all events
* **[schema].snapshots** Contains all snapshots
* **[schema].uniques** Contains all unique values

### Storing events

### Streaming of stored events

### Rehydrating aggregates from events

### Unique values

### Removing event streams
