import * as OpenID from 'openid-client'

// XXX I need to take all this localStorage stuff and put it in the database instead.
// That way, it's available to the Worker that needs to use the Mastodon api.

class MastodonAPI {
  constructor(db) {
    this.db = db;

    this.readyState = new Promise(resolve => this.readyResolve = resolve);
  }

  async getOauthState(serverUrl) {
    await Promise.all([
      new Promise(async resolve => {
        this.codeVerifiers = await this.db.get('codeVerifiers', serverUrl.toString());
        resolve();
      }),
      new Promise(async resolve => {
        this.oauthTokens = (await this.db.get('oauthTokens', serverUrl.toString()))?.tokens ?? [];
        resolve();
      }),
    ]);

    // This is the token we have DECIDED to use.
    // It's just the string that is the authorization token.
    this.oauthToken = this.oauthTokens.find(token => token.chosen === true)?.token;
  }

  async open(serverUrlArg) {
    // It should look up in the database to see if we have a client
    // registration, and get the client_id and client_secret.
    // If we don't have a stored registration, call register_app to get one,
    // and then this function stores those things in the database.

    const serverUrl = typeof serverUrlArg === "undefined"? localStorage?.getItem('serverUrl') : serverUrlArg;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem('serverUrl', serverUrl);
    }

    this.serverUrl = serverUrl;

    this.getOauthState(this.serverUrl);

    const appRegistration = await this.db.get('mastodonApiAppRegistrations', this.serverUrl.toString());
    if (appRegistration) {
      this.clientId = appRegistration.clientId;
      this.clientSecret = appRegistration.clientSecret;
    } else {
      const registration = await this.registerApp();
      await this.db.set('mastodonApiAppRegistrations', {
        serverUrl: this.serverUrl.toString(),
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      });
    }

    this.readyResolve(true);
  }

  redirectUrl() {
    const redirectUrl = new URL(window.location);
    const prefix=import.meta.env.BASE_URL.replace(/\/+$/, '');
    redirectUrl.pathname = prefix+'/login-landing';
    redirectUrl.search = '';
    return redirectUrl.toString();
  }

  ready() {
    return this.readyState;
  }

  // https://docs.joinmastodon.org/methods/apps/
  async registerApp(serverUrl) {
    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = requestUrl.pathname.replace(/\/+$/, '')+'/api/v1/apps';

    const response = await fetch(
      requestUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: 'ProSocial',
          redirect_uris: ['urn:ietf:wg:oauth:2.0:oob', this.redirectUrl()],
          scopes: 'read write push',
          website: 'https://prosocial.app/',
        }),
      }
    );

    if (response.ok) {
      const length = response.headers.get('Content-Length');
      if (length > (1 << 10 << 10)) {
        // We don't want it if it's more than a megabyte.
        throw new Error(`Attempting to register the application: Response too long (${length})`);
      }

      const responseJson = await response.json();

      this.clientId = responseJson.client_id;
      this.clientSecret = responseJson.client_secret;

      return responseJson;
    } else {
      throw new Error(`Attempting to register the application: ${response.status} ${response.statusText}`);
    }
  }

  // Adapted from the https://www.npmjs.com/package/openid-client documentation.
  async loginUrl() {
    if (!this.serverConfig) {
      this.serverConfig = await OpenID.discovery(new URL(this.serverUrl), this.clientId, this.clientSecret, OpenID.ClientSecretPost, {algorithm: 'oauth2'});
    }

    /**
     * PKCE: The following MUST be generated for every redirect to the
     * authorization_endpoint. You must store the code_verifier and state in the
     * end-user session such that it can be recovered as the user gets redirected
     * from the authorization server back to your application.
     */
    var codeVerifier;
    var codeChallenge;

    if (this.codeVerifiers) {
      codeVerifier = this.codeVerifiers.codeVerifier;
      codeChallenge = this.codeVerifiers.codeChallenge;
    } else {
      codeVerifier = OpenID.randomPKCECodeVerifier();
      codeChallenge = await OpenID.calculatePKCECodeChallenge(codeVerifier);

      // XXX implement this properly one day.
      // if (!this.serverConfig.serverMetadata().supportsPKCE()) {
      //   /**
      //    * We cannot be sure the server supports PKCE so we're going to use state too.
      //    * Use of PKCE is backwards compatible even if the AS doesn't support it which
      //    * is why we're using it regardless. Like PKCE, random state must be generated
      //    * for every redirect to the authorization_endpoint.
      //    */
      //   const state = OpenID.randomState();
      //   parameters.state = state;
      // }

      this.codeVerifiers = {serverUrl: this.serverUrl.toString(), codeVerifier, codeChallenge, /*state: parameters.state*/};
      await this.db.set('codeVerifiers', this.codeVerifiers);
    }

    let parameters = {
      redirect_uri: this.redirectUrl(),
      scope: 'read write push',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    };
    const redirectTo = OpenID.buildAuthorizationUrl(this.serverConfig, parameters);

    // now redirect the user to redirectTo.href
    return redirectTo;
  }

  // https://docs.joinmastodon.org/methods/oauth/#token
  async getAnonymousToken() {
    const existingAnonymousToken = this.oauthTokens?.find(token => token.handle === null);
    if (existingAnonymousToken) {
      return existingAnonymousToken.token;
    }

    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = requestUrl.pathname.replace(/\/+$/, '')+'/oauth/token';

    const response = await fetch(
      requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        }),
      }
    );

    if (response.ok) {
      const length = response.headers.get('Content-Length');
      if (length > (1 << 10 << 10)) {
        // We don't want it if it's more than a megabyte.
        throw new Error(`Attempting to register the application: Response too long (${length})`);
      }

      const responseJson = await response.json();

      this.oauthTokens.push({handle: null, token: responseJson.access_token, createdAt: new Date(responseJson.created_at * 1000).toISOString(), chosen: true});
      await this.db.set('oauthTokens', {serverUrl: this.serverUrl.toString(), tokens: this.oauthTokens});

      return responseJson.access_token;
    } else {
      throw new Error(`Attempting to get an anonymous token: ${response.status} ${response.statusText}`);
    }
  }

  // We may have an anonymous token and also several users we can switch between.
  // This sets which one is active.
  async setToken(newOauthToken) {
    this.oauthTokens.filter(token => token.chosen === true).forEach(token => token.chosen = false);
    this.oauthTokens.find(token => token.token === newOauthToken).chosen = true;
    await this.db.set("oauthTokens", {serverUrl: this.serverUrl.toString(), tokens: this.oauthTokens});
    this.oauthToken = newOauthToken;
  }

  // https://docs.joinmastodon.org/methods/oauth/#token
  async getAuthorizedToken(options) {
    const newToken = options? options.newToken : undefined;

    if (this.oauthToken && !newToken) {
      return this.oauthToken;
    }

    const serverConfig = await OpenID.discovery(new URL(this.serverUrl), this.clientId, this.clientSecret, OpenID.ClientSecretPost(this.clientSecret), {algorithm: 'oauth2'});

    const token = await OpenID.authorizationCodeGrant(
      serverConfig,
      new URL(window.location.href),
      {
        pkceCodeVerifier: this.codeVerifiers.codeVerifier,
        scope: 'read write push',
      },
    )

    this.oauthTokens.filter(token => token.chosen === true).forEach(token => token.chosen = false);
    this.oauthTokens.push({handle: '', token: token.access_token, createdAt: new Date().toISOString(), details: token, chosen: true});
    await this.db.set("oauthTokens", {serverUrl: this.serverUrl.toString(), tokens: this.oauthTokens});


    this.oauthToken = token.access_token;

    this.codeVerifiers = {};
    this.db.del("codeVerifiers", this.serverUrl.toString());

    return token.access_token;
  }

  async verifyCredentials() {
    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = requestUrl.pathname.replace(/\/+$/, '')+'/api/v1/accounts/verify_credentials';
    const response = await fetch(
      requestUrl, {
        method: "GET",
        headers: {
          "Authorization": `bearer ${this.oauthToken}`,
        },
      }
    );

    if (response.ok) {
      const length = response.headers.get('Content-Length');
      if (length > (1 << 10 << 10)) {
        // We don't want it if it's more than a megabyte.
        throw new Error(`Attempting to verfiy credentials: Response too long (${length})`);
      }

      const responseJson = await response.json();
    } else {
      throw new Error(`Attempting to get an anonymous token: ${response.status} ${response.statusText}`);
    }
  }

  async apiGet(requestPath, params, options) {
    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = requestUrl.pathname.replace(/\/+$/, '')+requestPath;

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(requestUrl.searchParams.entries()),
      ...params
    });
    requestUrl.search = searchParams.toString();

    console.log("Making request", requestUrl.toString(), "with", this.oauthToken);

    const response = await fetch(
      requestUrl, {
        method: "GET",
        headers: {
          "Authorization": `bearer ${this.oauthToken}`,
        },
      }
    );

    if (response.ok) {
      const length = response.headers.get('Content-Length');
      if (length > (1 << 10 << 10)) {
        // We don't want it if it's more than a megabyte.
        throw new Error(`Attempting to fetch ${requestUrl.toString()}: Response too long (${length})`);
      }

      const responseJson = await response.json();

      if (options?.parsePaginationLinkHeader) {
        const paginationInfo = this.parsePaginationLinkHeader(response.headers.get('Link'));
        return {
          pagination: paginationInfo,
          body: responseJson,
        };
      } else {
        return responseJson;
      }
    } else {
      throw new Error(`Attempting to run ${requestPath}: ${response.status} ${response.statusText}`);
    }
  }

  getCodeVerifiers() {
    return this.codeVerifiers;
  }

  getOauthTokens() {
    return this.oauthTokens;
  }

  getOauthToken() {
    return this.oauthToken;
  }

  async setOauthTokens(oauthTokens) {
    this.oauthTokens = oauthTokens;
    this.oauthToken = this.oauthTokens.find(token => token.chosen === true)?.token;
    await this.db.set("oauthTokens", {serverUrl: this.serverUrl.toString(), tokens: oauthTokens});

    const nowits = await this.db.get("oauthTokens", this.serverUrl.toString());
  }

  personHandle(apiHandle) {
    return (apiHandle.indexOf('@') > 0)? apiHandle : `${apiHandle}@${new URL(this.serverUrl).host}`;
  }

  ingestPerson(apiPerson) {
    const handle = this.personHandle(apiPerson.acct);
    const newPerson = {
      ...this.db.nullPerson(),
      localUserId: (apiPerson.acct.indexOf('@') > 0)? null : apiPerson.acct,
      handle,
      serverId: apiPerson.id,
      url: apiPerson.url,
      displayName: apiPerson.display_name,
      bio: apiPerson.note,
    };

    const personPromise = this.db.set('people', newPerson).then(result => newPerson);
    const avatarPromise = new Promise(async resolve => {
      const hash = await this.db.uploadImage(apiPerson.avatar);
      newPerson.avatar = hash;
      this.db.set('people', newPerson);
      resolve(newPerson);
    });
    

    return {
      person: personPromise,
      avatar: avatarPromise,
      all: [personPromise, avatarPromise],
    };
  }

  ingestPost(apiPost) {
    const apiPerson = apiPost.account;

    const handle = this.personHandle(apiPerson.acct);

    const newPost = {
      ...this.db.nullPost(),
      author: handle,
      serverId: apiPost.id,
      uri: apiPost.uri,
      canonicalUrl: apiPost.url,
      createdAt: apiPost.created_at,
      updatedAt: apiPost.edited_at ?? apiPost.created_at,
      deletedAt: null,
    };

    const newPostVersion = {
      ...this.db.nullVersion(),
      uri: apiPost.uri,
      updatedAt: apiPost.edited_at ?? apiPost.created_at,
      language: apiPost.language,
      type: 'html',
      text: apiPost.content,
      sensitive: apiPost.sensitive,
      spoilerText: apiPost.spoiler_text,
    };

    // XXX get the inReplyTo stuff and the boosted posts.
    // There should be a mechanism to prevent the inReplyTo stuff from fetching
    // entire threads every time.

    // XXX Also boosts.  For now, if it's a boost, let's just ignore it.

    // XXX Also attached images.

    const authorPromises = this.ingestPerson(apiPerson);
    
    const promises = {
      author: authorPromises.person,
      authorAvatar: authorPromises.avatar,
    };

    if (apiPost.reblog === null) {
      promises.post = this.db.set('posts', newPost).then(result => newPost);
      promises.postVersion = this.db.set('postVersions', newPostVersion).then(result => newPostVersion);

      promises.resolvedPost = new Promise(async resolve => {
        const post = await promises.post;
        const postVersion = await promises.postVersion;
        const author = await promises.authorAvatar;

        resolve({...post, ...postVersion, authorPerson: author});
      });
    }

    promises.all = Object.values(promises);

    return promises;
  }

  parsePaginationLinkHeader(linkHeader) {
    if (!linkHeader) {
      return {};
    }

    const paginationInfo = {};

    if (linkHeader.match(/.*<([^>]*)>; rel="next".*/)) {
      const nextUrl = linkHeader.replace(/.*<([^>]*)>; rel="next".*/, '$1');
      const nextArgs = nextUrl? Object.fromEntries(new URL(nextUrl).searchParams.entries()) : {};
      paginationInfo.next = {url: nextUrl, args: nextArgs};
    }

    if (linkHeader.match(/.*<([^>]*)>; rel="next".*/)) {
      const prevUrl = linkHeader.replace(/.*<([^>]*)>; rel="prev".*/, '$1');
      const prevArgs = prevUrl? Object.fromEntries(new URL(prevUrl).searchParams.entries()) : {};
      paginationInfo.prev = {url: prevUrl, args: prevArgs};
    }

    return paginationInfo;
  }

  ingestFollowInfo(person, {followees, followers}) {
    const followeePromises = [];
    const followerPromises = [];
    const followsDBPromises = [];

    if (followees) {
      for (const followee of followees) {
        const follow = [person.handle, this.personHandle(followee.acct)];
        const followPromise = this.db.set('follows', follow).then(db => follow);
        followsDBPromises.push(followPromise);
        
        const personPromise = this.ingestPerson(followee).avatar;

        const followeePromise = Promise.all([followPromise, personPromise]).then(([follow, person]) => person);
        followeePromises.push(followeePromise);
        
      }
    }

    if (followers) {
      for (const follower of followers) {
        const follow = [person.handle, this.personHandle(follower.acct)];
        const followPromise = this.db.set('follows', follow).then(db => follow);
        followsDBPromises.push(followPromise);
        
        const personPromise = this.ingestPerson(follower).avatar;

        const followerPromise = Promise.all([followPromise, personPromise]).then(([follow, person]) => person);
        followerPromises.push(followerPromise);
      }
    }

    const returnPromises = {
      followsDBPromises: Promise.all(followsDBPromises),
      followerPromises: Promise.all(followerPromises),
      followeePromises: Promise.all(followeePromises),
      all: Promise.all([followsDBPromises, followerPromises, followeePromises]),
    };

    return returnPromises;
  }
}

export default MastodonAPI;
