import { useContext, useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"

import MastodonAPIContext from './context/MastodonAPIContext.jsx';
import DatabaseContext from './DatabaseContext.jsx';
import UserContext from './UserContext.jsx';

export default function LoginLanding() {
  const { user, setUser, serverUrl, setServerUrl, userDB } = useContext(UserContext);
  const mastodonApi = useContext(MastodonAPIContext);

  const navigate = useNavigate();

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
        const codeVerifiers = JSON.parse(localStorage.getItem('codeVerifiers')) ?? {};
        if (codeVerifiers[serverUrl]) {
          await mastodonApi.ready();
          console.log("Making a request for authorized token");
          const authToken = await mastodonApi.getAuthorizedToken({newToken: true});
          console.log("ATATAT", authToken);
          const response = await mastodonApi.apiGet('/api/v1/accounts/verify_credentials');

          console.log("Logged in as", response);

          const person = await userDB.updatePersonFromApi(response);
          setUser(person);

          // Previously, we had the oauthToken, but not the handle of the user
          // it corresponded to.
          // Now that we know more about that user (from the verify_credentials
          // call), we can set the handle in our list of tokens.
          const oauthToken = localStorage.getItem('oauthToken');
          const oauthTokens = JSON.parse(localStorage.getItem('oauthTokens'));
          const oauthData = oauthTokens[serverUrl].authorized.find(item => item.token === oauthToken);
          oauthData.handle = person.handle;
          localStorage.setItem('oauthTokens', JSON.stringify(oauthTokens));

          console.log("Locally Logged in as", person);
          navigate("/");
        } else {
          alert("We don't have a code verifier for "+serverUrl);
        }
      }
    })();
  }, [serverUrl]);

  return "Logging in...";
}
