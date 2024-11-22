class Database {
  constructor() {
    if (localStorage.getItem('accounts') == null) {
      // Initializing the database.
      this.accounts = {
        'testuser': {
          handle: 'testuser@local',
        },
      };

      this.sessions = {
      };

      this.people = {
        'testuser@local': {
          localUserId: 'testuser',
          handle: 'testuser@local',

          displayName: 'Cool User',
          bio: "I am you! I love poking around demonstration websites.",

          avatar: null,
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        'alice@coolserver': {
          localUserId: null,
          handle: 'alice@coolserver',

          displayName: 'Alice (from cryptography)',
          bio: "I love being a party to private conversations!",

          avatar: null,
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        'mittens@kittens': {
          localUserId: null,
          handle: 'mittens@kittens',

          displayName: 'Mittens Chalk',
          bio: "Artisan, engineer, geologist, woodcutter.",

          avatar: null,
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        'jasper.shadow@solarpunk': {
          localUserId: null,
          handle: 'jasper.shadow@solarpunk',

          displayName: 'Jasper Shadow',
          bio: "I want to be a Geoengineer when I grow up. That's not a thing, but hopefully one day it will be.",

          avatar: null,
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        'cfur@corporate': {
          localUserId: null,
          handle: 'cfur@corporate',

          displayName: 'Charlie Fur',
          bio: "VP of marketing at Globo, Inc. Avid hunter.",

          avatar: null,
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        }
      };

      this.posts = {
        "alice@coolserver/a-cool-article": {
          uri: "alice@coolserver/a-cool-article",
          author: "alice@coolserver",
          createdAt: "2024-11-21T14:46:26-05:00",
          updatedAt: "2024-11-21T14:46:26-05:00",
          sensitive: false,
          text: "This is my post about stuff.",

          spoilerText: null,

          deletedAt: null,

          inReplyTo: null, // URI of post that this is replying to
          reblogOf: null,  // URI of post that this is a reblog of

          canonicalUrl: null,

          language: "en-US",
          conversationId: "alice@coolserver/a-cool-article",

          local: false,
        },
      };

      this.popularPosts = {
        "alice@coolserver/a-cool-article": "2024-11-21T14:46:26-05:00",
      };

      localStorage.setItem('accounts', JSON.stringify(this.accounts));
      localStorage.setItem('sessions', JSON.stringify(this.sessions));
      localStorage.setItem('people', JSON.stringify(this.people));
      localStorage.setItem('posts', JSON.stringify(this.posts));
      localStorage.setItem('popularPosts', JSON.stringify(this.posts));
    } else {
      this.accounts = JSON.parse(localStorage.getItem('accounts'));
      this.sessions = JSON.parse(localStorage.getItem('sessions'));
      this.people = JSON.parse(localStorage.getItem('people'));
      this.posts = JSON.parse(localStorage.getItem('posts'));
      this.popularPosts = JSON.parse(localStorage.getItem('popularPosts'));
    }
  }

  get(table, key) {
    if (typeof key === "undefined") {
      return JSON.parse(JSON.stringify(this[table]));
    } else {
      const result = this[table][key];
      if (typeof result === "undefined") {
        return undefined;
      } else {
        return JSON.parse(JSON.stringify(result));
      }
    }
  }

  set(table, key, value) {
    this[table][key] = value;
    localStorage.setItem(table, JSON.stringify(this[table]));
    return {...value};
  }

  del(table, key) {
    delete this[table][key];
    localStorage.setItem(table, JSON.stringify(this[table]));
  }

  clearAll() {
    localStorage.removeItem('accounts');
    localStorage.removeItem('sessions');
    localStorage.removeItem('people');
    localStorage.removeItem('profiles');
  }
}

export default Database;
