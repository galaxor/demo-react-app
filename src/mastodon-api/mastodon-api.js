class MastodonAPI {
  constructor(db) {
    this.db = db;

    this.oauthTokens = JSON.parse(localStorage.getItem('oauthTokens')) ?? {};
  }

  async open(serverUrl) {
    // It should look up in the database to see if we have a client
    // registration, and get the client_id and client_secret.
    // If we don't have a stored registration, call register_app to get one,
    // and then this function stores those things in the database.

    this.serverUrl = new URL(serverUrl);
    
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
  }

  // https://docs.joinmastodon.org/methods/apps/
  async registerApp(serverUrl) {
    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = '/api/v1/apps';
    const response = await fetch(
      requestUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_name: 'ProSocial',
          redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
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

  // https://docs.joinmastodon.org/methods/oauth/#token
  async getAnonymousToken() {
    if (this.oauthTokens[this.serverUrl.toString()] && this.oauthTokens[this.serverUrl.toString()][null]) {
      return this.oauthTokens[this.serverUrl.toString()][null];
    }

    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = '/oauth/token';

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

      return this.oauthTokens[this.serverUrl.toString()][null];
    } else {
      throw new Error(`Attempting to get an anonymous token: ${response.status} ${response.statusText}`);
    }
  }

  async verifyCredentials() {
    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = '/api/v1/accounts/verify_credentials';
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

      console.log("verify", responseJson);
    } else {
      throw new Error(`Attempting to get an anonymous token: ${response.status} ${response.statusText}`);
    }
  }

  async apiGet(requestPath) {
    const requestUrl = new URL(this.serverUrl);
    requestUrl.pathname = requestPath;
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

      console.log("thingy", responseJson);
      return responseJson;
    } else {
      throw new Error(`Attempting to do request ${requestUrl.toString()}: ${response.status} ${response.statusText}`);
    }
  }
}

export default MastodonAPI;
