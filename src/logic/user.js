export default class UserDB {
  constructor(db, serverUrl, mastodonApi) {
    this.db = db;
    this.serverUrl = serverUrl;
    this.mastodonApi = mastodonApi;
  }

  async setProp(prop, val) {
    const account = await this.db.get('accounts', 'testuser');
    const person = await this.db.get('people', account.handle);
    const newPerson = {...person};
    newPerson[prop] = val;

    await this.db.set('people', newPerson);
    return newPerson;
  }

  async loggedInUser() {
    // The tokens we have available.
    await this.mastodonApi.ready();
    const oauthTokens = this.mastodonApi.getOauthTokens();

    // The token we've chosen to use.
    const oauthToken = oauthTokens.find(token => token.chosen === true);

    if (oauthToken && oauthTokens.find(token => token.user !== null)) {
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
          const person = await this.updatePersonFromApi(apiPerson);

          // Set their handle for later use.
          const oauthData = oauthTokens.find(item => item.token === oauthToken);
          oauthData.handle = person.handle;
          await this.db.set("oauthTokens", {serverUrl: this.serverUrl, tokens: oauthTokens});

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
      handle: `@${apiPerson.acct}@${new URL(serverUrl).host}`,
      avatar: apiPerson.avatar,
      bio: apiPerson.source? apiPerson.source.note : apiPerson.note,
      url: apiPerson.url,
      serverId: apiPerson.id,
    };

    const result = await this.db.set('people', newPerson);
    console.log(result);

    const ppl = await this.db.get('people', newPerson.handle);
    console.log(ppl);

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
    return this.setProp('darkMode', darkMode);
  }
};
