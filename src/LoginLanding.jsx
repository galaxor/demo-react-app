import { useContext, useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"

import MastodonAPIContext from './context/MastodonAPIContext.jsx';
import DatabaseContext from './DatabaseContext.jsx';
import { PeopleDB } from './logic/people.js'
import WorkerContext from './context/WorkerContext.jsx'
import UserContext from './UserContext.jsx';

export default function LoginLanding() {
  const { user, setUser, serverUrl, setServerUrl, userDB } = useContext(UserContext);
  const mastodonApi = useContext(MastodonAPIContext);
  const db = useContext(DatabaseContext);

  const navigate = useNavigate();
  const {worker} = useContext(WorkerContext);

  // In dev mode, React mounts everything twice. That means the Effect will
  // fire twice. But we can only use the code to get a token once.
  // So we need to make sure that only one instance of the Effect asks for a
  // token.  The first one to "grab the brass ring" will set it to false, and
  // the other one will not attempt to get a token.
  var brassRing = true;

  useEffect(() => {
    (async () => {
      const searchParams = new URLSearchParams(window.location.search);

      if (searchParams.has('code') && brassRing) {
        brassRing = false;

        // If there's a 'code' parameter on this page, that probably means we
        // were redirected here in the middle of an oauth authorization.  So,
        // they gave us a code and we can use that to get an authorized token.
        // But we have to prove that we initiated the request for the code.  If
        // we did, we'll have the correct codeVerifier.
        await mastodonApi.ready();

        const codeVerifiers = mastodonApi.getCodeVerifiers();
        console.log("CODV", codeVerifiers);
        if (codeVerifiers) {
          console.log("Making a request for authorized token");
          const authToken = await mastodonApi.getAuthorizedToken({newToken: true});
          console.log("ATATAT", authToken);

          // Save their token without their handle.
          const oauthTokens = mastodonApi.getOauthTokens();
          const oauthData = oauthTokens.find(item => item.token === authToken);
          oauthData.chosen = true;
          await mastodonApi.setOauthTokens(oauthTokens);

          const response = await mastodonApi.apiGet('/api/v1/accounts/verify_credentials');

          console.log("Logged in as", response);

          const person = await userDB.updatePersonFromApi(response);
          setUser(person);
          worker.send({command: 'fetchImage', url: response.avatar}, async hash => {
            console.log("the hash", hash);
            person.avatar = hash;
            setUser({...person});
            await db.set('people', person);
          });

          // Save their token with their handle.
          oauthData.handle = person.handle;
          await mastodonApi.setOauthTokens(oauthTokens);

          navigate("/");
        } else {
          alert("We don't have a code verifier for "+serverUrl);
        }
      }
    })();
  }, [serverUrl]);

  return "Logging in...";
}
