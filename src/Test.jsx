import * as OpenID from 'openid-client'

import { useContext, useEffect, useState } from 'react';
import Database from './logic/database.js'
import DatabaseContext from './DatabaseContext.jsx';
import MastodonAPI from './mastodon-api/mastodon-api.js'
import UserDB from './logic/user.js'

export default function Test({dbConnection}) {
  useEffect(() => {
    (async () => {
      await dbConnection.open('https://social.iheartmichelle.com');
      const transaction = dbConnection.db.transaction("people");
      const peopleStore = transaction.objectStore('people');
      const p = new Promise(resolve => {
        peopleStore.openCursor().onsuccess = event => {
          const cursor = event.target.result;
          if (cursor === null) {
            console.log("That's all o0f them");
            resolve();
          } else {
            const person = cursor.value;
            console.log(person);
            cursor.continue();
          }
        };
      });

      await p;
    })();
  }, []);
}
