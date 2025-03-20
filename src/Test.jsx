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

export default function Test({dbConnection}) {
  useEffect(() => {
    (async () => {
      await dbConnection.open('https://social.iheartmichelle.com/');
      await dumpTable(dbConnection, 'people');
      await dumpTable(dbConnection, 'posts');
    })();
  }, []);

  return "Cool beans";
}
