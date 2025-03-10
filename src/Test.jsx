import * as OpenID from 'openid-client'

import { useContext, useEffect, useState } from 'react';
import Database from './logic/database.js'
import DatabaseContext from './DatabaseContext.jsx';
import MastodonAPI from './mastodon-api/mastodon-api.js'
import UserDB from './logic/user.js'

import workerUrl from './workers/worker.js?worker&url'

class PostOffice {
  constructor(worker) {
    this.worker = worker;
    this.messageId = 0;
    this.correspondents = {};

    this.worker.addEventListener('message', event => this.responder(event.data));
  }

  async send(message, callback) {
    const returnAddress = this.messageId++;
    this.correspondents[returnAddress] = callback;
    this.worker.postMessage({returnAddress, message});
  }

  responder(responseEnvelope) {
    const recipient = this.correspondents[responseEnvelope.returnAddress];
    const response = responseEnvelope.response;
    if (typeof recipient === 'function') {
      recipient(response);
    }
    delete this.correspondents[responseEnvelope.returnAddress];
  }
}

export default function Test({dbConnection}) {
  useEffect(() => {
    (async () => {
      const serviceWorkerScript = import.meta.env.BASE_URL.replace(/\/+$/, '')+"/src/workers/service-worker.js";
      console.log(serviceWorkerScript);
      const registration = await navigator.serviceWorker.register(serviceWorkerScript);
      console.log(registration);

      
      const worker = new Worker(workerUrl, {type: 'module'});
      console.log(worker);
      const postOffice = new PostOffice(worker);
      postOffice.send({command: 'ding', message: 'ding dung'}, response => console.log("RSP", response));
    })();
  }, []);

  return "Cool beans";
}
