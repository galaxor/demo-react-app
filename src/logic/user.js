import Database from './database.js'

const db = new Database();

export default {
  loggedInUser: () => {
    const session = db.get('sessions', 'testuser');
    if (session) {
      const account = db.get('accounts', 'testuser');
      return db.get('people', account.handle);
    } else {
      return null;
    }
  },

  login: () => {
    const account = db.get('accounts', 'testuser');
    db.set('sessions', 'testuser', true);
    return db.get('people', account.handle);
  },

  logout: () => {
    db.del('sessions', 'testuser');
    return null;
  },

  setName: (name) => {
    const account = db.get('accounts', 'testuser');
    const person = db.get('people', account.handle);
    const newPerson = {...person, displayName: name};
    db.set('people', account.handle, newPerson);
    return newPerson;
  },

  setAvatar: (avatar) => {
    const account = db.get('accounts', 'testuser');
    const person = db.get('people', account.handle);
    const newPerson = {...person, avatar: avatar};
    console.log("Saving", newPerson);
    db.set('people', account.handle, newPerson);
    return newPerson;
  },

  setAvatarAltText: (altText) => {
    const account = db.get('accounts', 'testuser');
    const person = db.get('people', account.handle);
    const newPerson = {...person, avatarAltText: altText};
    db.set('people', account.handle, newPerson);
    return newPerson;
  },
};
