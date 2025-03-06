import * as OpenID from 'openid-client'

import { useContext, useEffect, useState } from 'react';
import Database from './logic/database.js'
import DatabaseContext from './DatabaseContext.jsx';
import MastodonAPI from './mastodon-api/mastodon-api.js'
import UserDB from './logic/user.js'

export default function Test({dbConnection}) {
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('serverUrl'));
  const [authToken, setAuthToken] = useState();

  const db = new Database();

  useEffect(() => {
    (async () => {
      const searchParams = new URLSearchParams(window.location.search);
      console.log("sp", searchParams);
      if (searchParams.has('code')) {
        const codeVerifiers = JSON.parse(localStorage.getItem('codeVerifiers')) ?? {};
        console.log("I have code", searchParams.get('code'));
        console.log("I have codeVerifiers", serverUrl, codeVerifiers);
        console.log("I have codeVerifier", codeVerifiers[serverUrl]);

        await db.open(serverUrl);
        const mastodonApi = new MastodonAPI(db);
        await mastodonApi.open(serverUrl);
        await mastodonApi.getAuthorizedToken();
      }

      if (authToken || (serverUrl && authTokens[serverUrl])) {
        await db.open(serverUrl);
        const mastodonApi = new MastodonAPI(db);
        await mastodonApi.open(serverUrl);

        const response = await mastodonApi.apiGet('/api/v1/accounts/verify_credentials');
        console.log(response);
      }
    })();
  }, []);


  const authTokens = JSON.parse(localStorage.getItem('authTokens')) ?? {};
  console.log("atat", serverUrl, authTokens);
  if (authToken || (serverUrl && authTokens[serverUrl])) {
    return <>Authorized, baybee 😎</>;
  }

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('code')) {
    return <>Logging in...</>;
  }

  return serverUrl? <LoginForm db={db} serverUrl={serverUrl} /> : <HostForm setServerUrl={setServerUrl} db={db} />
}

function LoginForm({db, serverUrl}) {
  const [loginUrl, setLoginUrl] = useState();

  useEffect(() => {
    (async () => {
      await db.open(serverUrl);
      const mastodonApi = new MastodonAPI(db);
      await mastodonApi.open();
      const myLoginUrl = await mastodonApi.loginUrl();
      setLoginUrl(myLoginUrl);
    })();
  }, []);

  return typeof loginUrl === "undefined"? "Uwu hewwo" : <>U should go to <a href={loginUrl.href}>the login url</a></>;
}

function HostForm({db, setServerUrl}) {
  return <form onSubmit={async e => {
        e.preventDefault();
        const form = e.target;

        const serverName = form.querySelector("input[name=\"server\"]").value;

        const hostName = serverName.replace(/^https:\/\//, '');

        const serverUrl = new URL(`https://${hostName}`);

        await db.open(serverUrl);
        const mastodonApi = new MastodonAPI(db);

        await mastodonApi.open(serverUrl.toString());
        const anonymousToken = await mastodonApi.getAnonymousToken();

        localStorage.setItem('serverUrl', serverUrl.toString());
        setServerUrl(serverUrl);

        // Get some anonymous data to show that we can.
        /*
        console.log(await mastodonApi.apiGet('/api/v1/accounts/110881637687376775'));
        console.log(await mastodonApi.apiGet('/api/v1/accounts/110881637687376775/followers'));
        console.log(await mastodonApi.apiGet('/api/v1/accounts/110881637687376775/following'));

        console.log(await mastodonApi.apiGet('/api/v1/accounts/110854828163953676/following'));
        */
      }}>
    <label>Your server: <input type="text" name="server" /></label>
    <input type="submit" />
  </form>;
}
