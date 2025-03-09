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
      const serviceWorkerScript = import.meta.env.BASE_URL.replace(/\/+$/, '')+"/src/workers/service-worker.js";
      console.log(serviceWorkerScript);
      const registration = await navigator.serviceWorker.register(serviceWorkerScript);
      console.log(registration);

      
      const worker = new Worker(workerUrl, {type: 'module'});
      console.log(worker);

      worker.postMessage("Boop");
    })();
  }, []);

  return "Cool beans";
}
