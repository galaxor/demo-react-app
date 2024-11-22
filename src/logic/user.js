import { v4 as uuidv4 } from 'uuid'
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
      const person = db.get('people', account.handle);

      // XXX we can't adorn things from the database until we fix the mutability problem.
      // person.session = session;
      return person;
    } else {
      return null;
    }
  },

  login: () => {
    const account = db.get('accounts', 'testuser');
    const sessionId = uuidv4();
    db.set('sessions', 'testuser', sessionId);
    // XXX we can't adorn things from the database until we fix the mutability problem.
    // user.session = sessionId;
    return sessionId;
  },

  logout: () => {
    db.del('sessions', 'testuser');
    return null;
  },

  setName: (displayName) => {
    return setProp('displayName', displayName);
  },

  setBio: (bio) => {
    return setProp('bio', bio);
  },

  setAvatar: (avatar) => {
    return setProp('avatar', avatar);
  },

  setAvatarOrig: (avatarOrig) => {
    return setProp('avatarOrig', avatarOrig);
  },

  setAvatarAltText: (avatarAltText) => {
    return setProp('avatarAltText', avatarAltText);
  },

  setAvatarPosition: (avatarPosition) => {
    return setProp('avatarPosition', avatarPosition);
  },

  setAvatarRotate: (avatarRotate) => {
    return setProp('avatarRotate', avatarRotate);
  },

  setAvatarScale: (avatarScale) => {
    return setProp('avatarScale', avatarScale);
  },

};
