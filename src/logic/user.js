import Database from './database.js'

const db = new Database();

function setProp(prop, val) {
  const account = db.get('accounts', 'testuser');
  const person = db.get('people', account.handle);
  var newPerson = {...person};
  newPerson[prop] = val;

  db.set('people', account.handle, newPerson);
  return newPerson;
};

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

  setName: (displayName) => {
    return setProp('displayName', displayName);
  },

  setAvatar: (avatar) => {
    return setProp('avatar', avatar);
  },

  setAvatarAltText: (avatarAltText) => {
    return setProp('avatarAltText', avatarAltText);
  },

};
