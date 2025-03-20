import * as OpenID from 'openid-client'

import { useContext, useEffect, useState } from 'react';
import Database from './logic/database.js'
import DatabaseContext from './DatabaseContext.jsx';
import MastodonAPI from './mastodon-api/mastodon-api.js'
import UserDB from './logic/user.js'

import workerUrl from './workers/worker.js?worker&url'

export default function Test({dbConnection}) {
  useEffect(() => {
    (async () => {
      await dbConnection.open('https://social.iheartmichelle.com');
      await new Promise(resolve => {
        dbConnection.db.transaction('oauthTokens').objectStore('oauthTokens').count().onsuccess = event => console.log("COUNT", event.target.result);

        dbConnection.db.transaction('oauthTokens').objectStore('oauthTokens').openCursor().onsuccess = event => {
          const cursor = event.target.result;
          if (cursor === null) {
            resolve();
          } else {
            console.log(cursor.value);
            cursor.continue();
          }
        };
      });
    })();
  }, []);

  return "Cool beans";
}
