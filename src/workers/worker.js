import Database from '../logic/database.js'
import sha256 from '../include/sha256.js'
import MastodonAPI from '../mastodon-api/mastodon-api.js'


class MyWorker {
  constructor() {
    this.db = new Database();
    this.mastodonApi = new MastodonAPI(this.db);
    onmessage = async event => this.dispatcher(event);

    this.readyState = new Promise(resolve => this.readyResolve = resolve);
  }

  async init(serverUrl, oauthTokens, oauthToken) {
    this.oauthTokens = oauthTokens;
    this.oauthToken = oauthToken;

    await this.db.open(serverUrl);
    await this.mastodonApi.open(serverUrl, this.oauthTokens, this.oauthToken);

    this.readyResolve(true);

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
      response = await this.getPostsBy(message.handle, message.minId);
      break;
    }

    this.respond(envelope, response);
  }

  respond(envelope, response) {
    postMessage({returnAddress: envelope.returnAddress, response});
  }

  async fetchImage(url) {
    await this.readyState;

    const hash = await this.db.uploadImage(url);
    return hash;
  }

  async getPostsBy(handle, minId) {
    await this.readyState;

    const person = await this.db.get('people', handle);
    const params = {limit: 40};
    if (typeof minId !== "undefined") {
      params.min_id = minId;
    }

    const apiPosts = await this.mastodonApi.apiGet(`/api/v1/accounts/${person.serverId}/statuses`, params);
    const promises = [];
    for (const apiPost of apiPosts) {
      const postPromises = this.mastodonApi.ingestPost(apiPost);
      promises.push(postPromises.resolvedPost);
    } 

    const posts = await Promise.all(promises);
    return posts;
  }
}

// Actually set up the handler.
const w = new MyWorker();
