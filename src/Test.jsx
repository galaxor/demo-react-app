import * as OpenID from 'openid-client'

import { useContext, useEffect, useState } from 'react';
import Database from './logic/database.js'
import DatabaseContext from './DatabaseContext.jsx';
import MastodonAPI from './mastodon-api/mastodon-api.js'
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

import {findHomeForChunk} from './include/backfill.js';

export default function Test({dbConnection}) {
  const chunkSource = [{minId: 1, maxId: 3}];
  const pagination = {prev: {sinceId: 7}, next: {maxId: 6}};
  const body = "nothing";
  console.log(findHomeForChunk(chunkSource, pagination, body));

  return "Cool beans";
}
