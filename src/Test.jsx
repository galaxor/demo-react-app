import * as OpenID from 'openid-client'

import { useContext, useEffect, useState } from 'react';
import Database from './logic/database.js'
import DatabaseContext from './DatabaseContext.jsx';
// import MastodonAPI from './mastodon-api/mastodon-api.js'
import UserDB from './logic/user.js'

import workerUrl from './workers/worker.js?worker&url'

function dumpTable(db, table) {
  return new Promise(resolve => {
    db.db.transaction(table).objectStore(table).count().onsuccess = event => console.log(`-${table}- COUNT`, event.target.result);

    db.db.transaction(table).objectStore(table).openCursor().onsuccess = event => {
      const cursor = event.target.result;
      if (cursor === null) {
        resolve();
      } else {
        console.log(cursor.value);
        cursor.continue();
      }
    };
  });
}

import MastodonAPI from './mastodon-api/mastodon-api-mock.js'
import {backfillAll, backfillIteration} from './mastodon-api/backfill.js'

export default function Test({dbConnection}) {

  useEffect(() => {
    (async () => {
      // Test backfillIteration.

      function backfillCallbackFn(accumulator) {
        return (body) => {
          accumulator.push(body);
        };
      }

  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 6]], true);
  const knownChunks = [{minId: 3, maxId: 6}];
  await backfillAll({knownChunks, mastodonApi, apiUrl: '/', limit: 3, callback: backfillCallbackFn(accumulator)});

  // expect(accumulator).toStrictEqual([{id: 1}, {id: 2}, {id: 3}]);

      console.log("Accumulator:", accumulator);
      console.log("Known", knownChunks);
    })();
  }, []);

  return "Cool beans";
}
