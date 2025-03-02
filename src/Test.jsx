import * as OpenID from 'openid-client'

import { useContext, useEffect, useState } from 'react';
import Database from './logic/database.js'
import DatabaseContext from './DatabaseContext.jsx';
import MastodonAPI from './mastodon-api/mastodon-api.js'
import UserDB from './logic/user.js'

export default function Test({dbConnection}) {
  const [nonsense, setNonsense] = useState(<>Loading</>);

  useEffect(() => {
    (async () => {
/*
      const response = await fetch('https://social.iheartmichelle.com/api/v1/instance');
      console.log(response);

      const response2 = await fetch('https://social.iheartmichelle.com/api/v1/timelines/public?limit=30&local=true');
      console.log(response2);
*/
    })();
  }, []);

  return <form onSubmit={async e => {
        e.preventDefault();
        const form = e.target;
        console.log("uwu", e.target);

        const serverName = form.querySelector("input[name=\"server\"]").value;

        const hostName = serverName.replace(/^https:\/\//, '');

        const serverUrl = new URL(`https://${hostName}`);

        const db = new Database(serverUrl);
        await db.open();

        const mastodonApi = new MastodonAPI(db);
        await mastodonApi.open(serverUrl.toString());
        const anonymousToken = await mastodonApi.getAnonymousToken();

        console.log(anonymousToken);

        await mastodonApi.apiGet('/api/v1/accounts/110881637687376775');
        await mastodonApi.apiGet('/api/v1/accounts/110881637687376775/followers');
        await mastodonApi.apiGet('/api/v1/accounts/110881637687376775/following');

        await mastodonApi.apiGet('/api/v1/accounts/110854828163953676/following');
      }}>
    <label>Your server: <input type="text" name="server" /></label>
    <input type="submit" />
  </form>;
}

function People({people}) {
  return (
    <ul>
    {people.map(person => <Person key={person.handle} person={person} />)}
    </ul>
  );
}

function Person({person}) {
  return <li>{person.displayName} ({person.handle})</li>;
}
