import { useContext, useEffect, useState } from 'react'

import MastodonAPIContext from './context/MastodonAPIContext.jsx';
import DatabaseContext from './DatabaseContext.jsx';
import UserContext from './UserContext.jsx';

export default function LoginLanding() {
  const { user, setUser, serverUrl, setServerUrl } = useContext(UserContext);
  const mastodonApi = useContext(MastodonAPIContext);

  useEffect(() => {
    (async () => {
      const searchParams = new URLSearchParams(window.location.search);

      if (searchParams.has('code')) {
        // If there's a 'code' parameter on this page, that probably means we
        // were redirected here in the middle of an oauth authorization.  So,
        // they gave us a code and we can use that to get an authorized token.
        // But we have to prove that we initiated the request for the code.  If
        // we did, we'll have the correct codeVerifier.
        const codeVerifiers = JSON.parse(localStorage.getItem('codeVerifiers')) ?? {};
        if (codeVerifiers[serverUrl]) {
          await mastodonApi.ready();
          const authToken = await mastodonApi.getAuthorizedToken();
          console.log("ATATAT", authToken);
          const response = await mastodonApi.apiGet('/api/v1/accounts/verify_credentials');

          console.log("Logged in as", response);
        } else {
          alert("We don't have a code verifier for "+serverUrl);
        }
      }
    })();
  }, [serverUrl]);

  return "Logging in...";
}
