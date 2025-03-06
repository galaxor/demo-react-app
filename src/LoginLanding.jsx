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
        const codeVerifiers = JSON.parse(localStorage.getItem('codeVerifiers')) ?? {};
        if (codeVerifiers[serverUrl]) {
          await mastodonApi.ready();
          const authToken = await mastodonApi.getAuthorizedToken();
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
