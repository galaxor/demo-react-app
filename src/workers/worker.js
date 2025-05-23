import Database from '../logic/database.js'
import sha256 from '../include/sha256.js'
import MastodonAPI from '../mastodon-api/mastodon-api.js'
import PostOffice from './PostOffice.js'


class MyWorker {
  constructor() {
    this.db = new Database();
    this.mastodonApi = new MastodonAPI(this.db);
    onmessage = async event => this.dispatcher(event);

    this.subscriptions = {};

    this.serviceWorker = new Promise(resolve => {
      navigator.serviceWorker.ready.then(
        registration => {
          const serviceWorkerPostOffice = new PostOffice(registration.active, navigator.serviceWorker);
          resolve(serviceWorkerPostOffice);
        }
      );
    }); 

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

    case 'broadcast':
      response = await this.broadcast(event);
      break;

    case 'subscribe':
      response = this.subscribe(eventName, envelope);
      break;

    case 'unsubscribe':
      response = this.unsubscribe(eventName, id);
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
      followersParams.since_id = person.lastKnownFollower;
    }

    const followsParams = {limit: 80};
    if (person.lastKnownFollow) {
      followsParams.since_id = person.lastKnownFollow;
    }

    const promises = [
      this.mastodonApi.apiGet(`/api/v1/accounts/${person.serverId}/followers`, followersParams, {parsePaginationLinkHeader: true}).then(followersInfo => {
        const lastKnownFollower = followersInfo.pagination?.prev?.args?.since_id ?? person.lastKnownFollower;
        const earliestKnownFollower = followersInfo.pagination?.next?.args?.max_id ?? person.earliestKnownFollower;
        return this.mastodonApi.ingestFollowInfo(person, {followers: followersInfo.body}).followerPromises.then(async followers => {
          const dbPerson = await this.db.get('people', person.handle);
          person.lastKnownFollower = lastKnownFollower;
          dbPerson.lastKnownFollower = lastKnownFollower;
          await this.db.set('people', dbPerson);
          return followers;
        });
        
      }),

      this.mastodonApi.apiGet(`/api/v1/accounts/${person.serverId}/following`, followsParams, {parsePaginationLinkHeader: true}).then(followeesInfo => {
        const lastKnownFollow = followeesInfo.pagination?.prev?.args?.since_id ?? person.lastKnownFollow;
        const earliestKnownFollow = followeesInfo.pagination?.next?.args?.max_id;
        return this.mastodonApi.ingestFollowInfo(person, {followees: followeesInfo.body}).followeePromises.then(async followees => {
          const dbPerson = await this.db.get('people', person.handle);
          person.lastKnownFollow = lastKnownFollow;
          dbPerson.lastKnownFollow = lastKnownFollow;
          dbPerson.earliestKnownFollow = earliestKnownFollow;
          await this.db.set('people', dbPerson);
          return followees;
        });
      }),
    ];

    const [newFollowers, newFollows] = await Promise.all(promises);

    // While we're at it, let's backfill!
      // Backfill follows

      // Backfill followers

    return {person, newFollows, newFollowers};
  }

  subscribe(eventName) {
    if (typeof this.subscriptions[eventName] === "undefined") {
      this.subscriptions[eventName] = {};
    }

    const uuid = crypto.randomUUID();
    // this.subscriptions[eventName][uuid] = 
  }

  unsubscribe(eventName) {
  }
}

// Actually set up the handler.
const w = new MyWorker();
