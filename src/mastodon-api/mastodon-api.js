import * as OpenID from 'openid-client'

class MastodonAPI {
  constructor(db) {
    this.db = db;

    this.codeVerifiers = JSON.parse(localStorage.getItem('codeVerifiers')) ?? {};

    // this.serverConfig = Object.assign(new OpenID.Configuration(), JSON.parse(localStorage.getItem('serverConfig')));
    // console.log("Stored sc", this.serverConfig);

    this.oauthTokens = JSON.parse(localStorage.getItem('oauthTokens')) ?? {};

    this.readyState = new Promise(resolve => this.readyResolve = resolve);
  }

  async open(serverUrlArg) {
    // It should look up in the database to see if we have a client
    // registration, and get the client_id and client_secret.
    // If we don't have a stored registration, call register_app to get one,
    // and then this function stores those things in the database.

    const serverUrl = typeof serverUrlArg === "undefined"? localStorage.getItem('serverUrl') : serverUrlArg;
    localStorage.setItem('serverUrl', serverUrl);

    this.serverUrl = serverUrl;

    const redirectUrl = new URL(window.location);
    const prefix=import.meta.env.BASE_URL.replace(/\/+$/, '');
    redirectUrl.pathname = prefix+'/login-landing';
    this.redirectUrl = redirectUrl.toString();

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
          redirect_uris: ['urn:ietf:wg:oauth:2.0:oob', this.redirectUrl.toString()],
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
    const codeVerifier = OpenID.randomPKCECodeVerifier();
    const codeChallenge = await OpenID.calculatePKCECodeChallenge(codeVerifier)

    let parameters = {
      redirect_uri: this.redirectUrl.toString(),
      scope: 'read write push',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    };

    if (!this.serverConfig.serverMetadata().supportsPKCE()) {
      /**
       * We cannot be sure the server supports PKCE so we're going to use state too.
       * Use of PKCE is backwards compatible even if the AS doesn't support it which
       * is why we're using it regardless. Like PKCE, random state must be generated
       * for every redirect to the authorization_endpoint.
       */
      const state = OpenID.randomState();
      parameters.state = state;
    }

    this.codeVerifiers[this.serverUrl] = {codeVerifier, state: parameters.state};
    localStorage.setItem('codeVerifiers', JSON.stringify(this.codeVerifiers));

    const redirectTo = OpenID.buildAuthorizationUrl(this.serverConfig, parameters);

    // now redirect the user to redirectTo.href
    return redirectTo;
  }

  // https://docs.joinmastodon.org/methods/oauth/#token
  async getAnonymousToken() {
    if (this.oauthTokens[this.serverUrl.toString()] && this.oauthTokens[this.serverUrl.toString()][null]) {
      return this.oauthTokens[this.serverUrl.toString()][null];
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

      if (typeof this.oauthTokens[this.serverUrl.toString()] === "undefined") {
        this.oauthTokens[this.serverUrl.toString()] = {};
      }
      this.oauthTokens[this.serverUrl.toString()][null] = {serverUrl: this.serverUrl.toString(), user: null, token: responseJson.access_token, createdAt: new Date(responseJson.created_at * 1000).toISOString()};
      localStorage.setItem('oauthTokens', JSON.stringify(this.oauthTokens));

      this.oauthToken = this.oauthTokens[this.serverUrl.toString()][null].token;

      localStorage.setItem('oauthTokens', JSON.stringify(this.oauthTokens));

      return this.oauthTokens[this.serverUrl.toString()][null];
    } else {
      throw new Error(`Attempting to get an anonymous token: ${response.status} ${response.statusText}`);
    }
  }

  // https://docs.joinmastodon.org/methods/oauth/#token
  async getAuthorizedToken() {
    if (this.oauthTokens[this.serverUrl.toString()] && this.oauthTokens[this.serverUrl.toString()].authorized) {
      return this.oauthTokens[this.serverUrl.toString()].authorized;
    }

    if (!this.serverConfig) {
      this.serverConfig = await OpenID.discovery(new URL(this.serverUrl), this.clientId, this.clientSecret, OpenID.ClientSecretPost, {algorithm: 'oauth2'});
    }

    const token = await OpenID.authorizationCodeGrant(
      this.serverConfig,
      new URL(window.location.href),
      {
        pkceCodeVerifier: this.codeVerifiers[this.serverUrl].codeVerifier,
      },
    )

    this.oauthTokens[this.serverUrl].authorized = token.access_token;
    localStorage.setItem('oauthTokens', JSON.stringify(this.oauthTokens));

    return this.oauthTokens[this.serverUrl].authorized;
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

  async apiGet(requestPath) {
    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = requestUrl.pathname.replace(/\/+$/, '')+requestPath;

    // XXX Doing this with OpenID's fetchProtectedResource requires having a
    // correct serverConfig.  But Mastodon does not require this - we only need
    // the authToken.  So let's maybe ditch the OpenID library here and just
    // write our own fetch with the Authorization header.
    // Otherwise, we might end up having to make a round trip to do the
    // discovery of the server config, which would be unnecessary.
    const response = await OpenID.fetchProtectedResource(
      this.serverConfig,
      this.authToken,
      requestUrl,
      'GET',
    );

    console.log("Response", response);

    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`Error trying to GET ${requestUrl.toString}: ${response.status}, ${response.statusText}`);
    }
  }
}

export default MastodonAPI;
