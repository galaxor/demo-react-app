export default class UserDB {
  constructor(db, serverUrl, mastodonApi) {
    this.db = db;
    this.serverUrl = serverUrl;
    this.mastodonApi = mastodonApi;
  }

  async setProp(prop, val) {
    const user = await this.loggedInUser();
    const person = await this.db.get('people', user.handle);
    const newPerson = {...person};
    newPerson[prop] = val;

    await this.db.set('people', newPerson);

    // XXX We should also send this change upstream.

    return newPerson;
  }

  async setAccountProp(prop, val) {
    const account = await this.loggedInAccount();
    const newAccount = {...account};
    newAccount[prop] = val;

    console.log("About to set", newAccount);

    await this.db.set('accounts', newAccount);

    // No need to push these changes upstream because this is just local
    // settings for this app.

    return newAccount;
  }

  async loggedInAccount() {
    const user = await this.loggedInUser();
    if (user) {
      const account = (await this.db.get('accounts', user.handle)) ?? {handle: user.handle};
      return account;
    } else {
      return null;
    }
  }

  async loggedInUser() {
    // The tokens we have available.
    await this.mastodonApi.ready();
    const oauthTokens = this.mastodonApi.getOauthTokens();

    // The token we've chosen to use.
    const oauthToken = oauthTokens.find(token => token.chosen === true)?.token;

    if (oauthToken && oauthTokens.find(token => token.token === oauthToken && token.handle !== null)) {
      const oauthData = oauthTokens.find(item => item.token === oauthToken);

      if (oauthData && oauthData.handle) {
        const person = await this.db.get('people', oauthData.handle);
        return person;
      } else {
        // The server knows about this person, but we don't.  Let's get their
        // info and shove it in our database!
        if (typeof person === "undefined") {
          const apiPerson = await this.mastodonApi.apiGet('/api/v1/accounts/verify_credentials');

          // Put them in the database.
          // Return the person.
          const person = await (this.mastodonApi.ingestPerson(apiPerson).personPromise);

          // Set their handle for later use.
          const oauthData = oauthTokens.find(item => item.token === oauthToken);
          oauthData.handle = person.handle;
          await this.mastodonApi.setOauthTokens(oauthTokens);

          this.handle = person.handle;
          return person;
        }
      }
    } else {
      const anonToken = await this.mastodonApi.getAnonymousToken();
      this.mastodonApi.setToken(anonToken);
      return null;
    }
  }

  async login() {
    const sessionId = crypto.randomUUID();
    await this.db.set('sessions', {sessionId, userName: 'testuser', startedAt: "1234"});

    localStorage.setItem('sessionId', sessionId);

    return sessionId;
  }

  async logout() {
    const sessionId = localStorage.getItem('sessionId');
    await this.db.del('sessions', sessionId);
    localStorage.removeItem('sessionId');
    return null;
  }

  async updatePersonFromApi(apiPerson) {
    const serverUrl = localStorage.getItem('serverUrl');
    const newPerson = {
      ... this.db.nullPerson(),
      localUserId: apiPerson.acct ?? null,
      displayName: apiPerson.display_name,
      handle: `${apiPerson.acct}@${new URL(serverUrl).host}`,
      avatar: apiPerson.avatar,
      bio: apiPerson.source? apiPerson.source.note : apiPerson.note,
      url: apiPerson.url,
      serverId: apiPerson.id,
    };

    const result = await this.db.set('people', newPerson);
    const ppl = await this.db.get('people', newPerson.handle);

    // XXX Get the avatar and stash it locally, too.
    // This is something we could ask a Worker to do, so we can navigate away.

    return newPerson;
  }

  setName(displayName) {
    return this.setProp('displayName', displayName);
  }

  setBio(bio) {
    return this.setProp('bio', bio);
  }

  async setAvatar(imageDataUrl) {
    const hash = await this.db.uploadImage(imageDataUrl);

    return this.setProp('avatar', hash);
  }

  setAvatarOrig(avatarOrig) {
    return this.setProp('avatarOrig', avatarOrig);
  }

  setAvatarAltText(avatarAltText) {
    return this.setProp('avatarAltText', avatarAltText);
  }

  setAvatarPosition(avatarPosition) {
    return this.setProp('avatarPosition', avatarPosition);
  }

  setAvatarRotate(avatarRotate) {
    return this.setProp('avatarRotate', avatarRotate);
  }

  setAvatarScale(avatarScale) {
    return this.setProp('avatarScale', avatarScale);
  }

  setSkinTone(newTone) {
    return this.setProp('skinTonePref', newTone);
  }

  setDarkMode(darkMode) {
    return this.setAccountProp('darkMode', darkMode);
  }
};
