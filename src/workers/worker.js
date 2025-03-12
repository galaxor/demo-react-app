import Database from '../logic/database.js'
import sha256 from '../include/sha256.js'
import MastodonAPI from '../mastodon-api/mastodon-api.js'


class MyWorker {
  constructor() {
    this.db = new Database();
    this.mastodonApi = new MastodonAPI(this.db);
    onmessage = async event => this.dispatcher(event);
  }

  async init(serverUrl, oauthTokens, oauthToken) {
    this.oauthTokens = oauthTokens;
    this.oauthToken = oauthToken;

    await this.db.open(serverUrl);
    await this.mastodonApi.open(serverUrl, this.oauthTokens, this.oauthToken);
    return "ready";
  }

  async dispatcher(event) {
    const envelope = event.data;
    const message = envelope.message;

    var response;

    switch (message.command) {
    case 'init':
      response = await this.init(message.serverUrl, message.oauthTokens, message.oauthToken);
      break;

    case 'ding':
      response = await this.ding(message.message);
      break;

    case 'fetchImage':
      response = await this.fetchImage(message.url);
      break;

    case 'getPostsBy':
      response = await this.fetchImage(message.handle, message.minId);
      break;
    }

    console.log("Doot", event.data, response);
    this.respond(envelope, response);
  }

  ding(message) {
    console.log("Ding", message);
    return {ding: message};
  }

  respond(envelope, response) {
    postMessage({returnAddress: envelope.returnAddress, response});
  }

  async fetchImage(url) {
    const hash = await this.db.uploadImage(url);
    return hash;
  }

  async getPostsBy(handle, minId) {
    const person = await this.db.get('people', handle);
    const params = {limit: 40};
    if (typeof minId !== "undefined") {
      params.min_id = minId;
    }
    return await this.mastodonApi.apiGet(`/api/v1/accounts/${person.serverId}/statuses`, params);
  }
}

// Actually set up the handler.
const w = new MyWorker();
