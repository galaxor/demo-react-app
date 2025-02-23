export default class UserDB {
  constructor(db) {
    this.db = db;
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
    const sessionId = localStorage.getItem('sessionId');
    const session = await this.db.get('sessions', sessionId);
    if (session) {
      const account = await this.db.get('accounts', 'testuser');
      const person = await this.db.get('people', account.handle);

      person.session = session;

      return person;
    } else {
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

  setName(displayName) {
    return this.setProp('displayName', displayName);
  }

  setBio(bio) {
    return this.setProp('bio', bio);
  }

  setAvatar(avatar) {
    return this.setProp('avatar', avatar);
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
