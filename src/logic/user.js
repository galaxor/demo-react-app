import Database from './database.js'

const db = new Database();

export default {
  loggedInUser: () => {
    const account = db.get('sessions', 'testuser');
    if (account) {
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
    person.displayName = name;
    db.set('people', account.handle, person);
    return person;
  },
};
