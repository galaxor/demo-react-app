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

    case 'getYourFeed':
      response = await this.getYourFeed(message.minId);
      break;

    case 'getFollowInfo':
      response = await this.getFollowInfo(message.person);
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

  async ingestPosts(apiPosts) {
    const promises = [];
    for (const apiPost of apiPosts) {
      const postPromises = this.mastodonApi.ingestPost(apiPost);

      // XXX Right now, we're not ingesting the post if it's a boost, because I
      // don't have code for ingesting the boosted post.
      // So, if it's a boost, there won't be a resolvedPost promise.
      if (postPromises.resolvedPost) {
        promises.push(postPromises.resolvedPost);
      }
    } 

    const posts = await Promise.all(promises);
    return posts;
  }

  async getPostsBy(handle, minId) {
    await this.readyState;

    const person = await this.db.get('people', handle);

    const params = {limit: 40};
    if (typeof minId !== "undefined") {
      params.min_id = minId;
    }

    const apiPosts = await this.mastodonApi.apiGet(`/api/v1/accounts/${person.serverId}/statuses`, params);

    return await this.ingestPosts(apiPosts);
  }

  async getYourFeed(handle, minId) {
    await this.readyState;

    const params = {limit: 40};
    if (typeof minId !== "undefined") {
      params.min_id = minId;
    }

    const apiPosts = await this.mastodonApi.apiGet(`/api/v1/timelines/home`, params);

    return await this.ingestPosts(apiPosts);
  }

  async getFollowInfo(person) {
    await this.readyState;

    const followersParams = {limit: 80};
    if (person.lastKnownFollower) {
      followersParams.minId = person.lastKnownFollower;
    }

    const followsParams = {limit: 80};
    if (person.lastKnownFollow) {
      followsParams.minId = person.lastKnownFollow;
    }

    const promises = [
      this.mastodonApi.apiGet(`/api/v1/accounts/${person.serverId}/followers`, followersParams, {parsePaginationLinkHeader: true}),
        // XXX I should use then() to actually ingest these followers, and just return the list of follows and followers in our format.
        // We've got a mastodon-api ingestFollowInfo function, but it should be
        // rewritten to work on these individually, instead of having to wait
        // for both.

      this.mastodonApi.apiGet(`/api/v1/accounts/${person.serverId}/following`, followsParams, {parsePaginationLinkHeader: true}),
    ];

    const [newFollowers, newFollows] = await Promise.all(promises);

    return {person, newFollows, newFollowers};
  }
}

// Actually set up the handler.
const w = new MyWorker();
