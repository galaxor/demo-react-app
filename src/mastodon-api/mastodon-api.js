import * as OpenID from 'openid-client'

// XXX I need to take all this localStorage stuff and put it in the database instead.
// That way, it's available to the Worker that needs to use the Mastodon api.

class MastodonAPI {
  constructor(db) {
    this.db = db;

    this.readyState = new Promise(resolve => this.readyResolve = resolve);
  }

  async getOauthState(serverUrl) {
    const transaction = this.db.db.transaction(['codeVerifiers', 'oauthTokens']);
    await Promise.all([
      new Promise(async resolve => {
        this.codeVerifiers = await this.db.getFromObjectStore(transaction.objectStore('codeVerifiers'), serverUrl.toString());
        resolve();
      }),
      new Promise(async resolve => {
        this.oauthTokens = await this.db.getFromObjectStore(transaction.objectStore('oauthTokens'), serverUrl.toString())?.tokens ?? [];
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
      console.log("setting code verifier", this.serverUrl, this.codeVerifiers);
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

    console.log("Getting new anonymous token");

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

      console.log("Anon token info", responseJson);

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

    console.log("Getting new authorized token");

    const serverConfig = await OpenID.discovery(new URL(this.serverUrl), this.clientId, this.clientSecret, OpenID.ClientSecretPost(this.clientSecret), {algorithm: 'oauth2'});

    console.log("idsc", this.clientId, this.clientSecret);
    console.log("cv", this.serverUrl, this.codeVerifiers);

    const token = await OpenID.authorizationCodeGrant(
      serverConfig,
      new URL(window.location.href),
      {
        pkceCodeVerifier: this.codeVerifiers.codeVerifier,
        scope: 'read write push',
      },
    )

    console.log("I gotted", token);

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

  async apiGet(requestPath, params) {
    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = requestUrl.pathname.replace(/\/+$/, '')+requestPath;

    console.log(requestUrl);

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(requestUrl.searchParams.entries()),
      ...params
    });
    requestUrl.search = searchParams.toString();

    console.log("I'm going with", this.oauthToken);

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
      return responseJson;
    } else {
      throw new Error(`Attempting to run ${requestPath}: ${response.status} ${response.statusText}`);
    }
  }

  getCodeVerifiers() {
    return this.codeVerifiers;
  }
}

export default MastodonAPI;
