class Database {
  constructor() {
    if (localStorage.getItem('accounts') == null) {
      // Initializing the database.
      this.accounts = {
        'testuser': {
          handle: '@testuser@local',
        },
      };

      this.sessions = {
      };

      this.people = {
        '@astra_underscore@wetdry.world': {
          localUserId: null,
          handle: '@astra_underscore@wetdry.world',

          url: 'https://wetdry.world/@astra_underscore',
          
          displayName: 'Astra Underscore',
          bio: "Hello, my name is Astra! I am a trans girl from Chile born in '01 who loves computing, drawing, writing, and research!\n\n#ACAB #BlackLivesMatter\n\nI love chatting, so just DM me if you want to talk c:",

          avatar: "https://media.wetdry.world/accounts/avatars/111/705/918/702/387/227/original/8b89b6d8c18bf716.png",
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        '@darkphoenix@not.an.evilcyberhacker.net': {
          localUserId: null,
          handle: '@darkphoenix@not.an.evilcyberhacker.net',

          url: 'https://not.an.evilcyberhacker.net/@darkphoenix',

          displayName: 'Ash',
          bio: " darkphoenix@disaster.queer:/mnt/gay/agenda# :idle:\n everyone's favourite chaotic bi poly disaster queer (accept no substitutes) :neofox_flag_bi: :neofox_flag_polyam: :neofox_flag_nb: :neofox_flag_genderfluid: :neofox_flag_trans:\n chaotic neutral\n queer as in fuck you\n too hot to be gender solid\n \"a boy for meme purposes roughly 50% of the time\"\n \"train slut\"\n AuDHD haver (confirmed)\n just another train and computer geek really\n probably passing through your area by train at this very moment\n most certainly the best worst thing that hasn't happened to you yet\n flirting okay unless i tell you otherwise; please tell me I'm cute\n has bitten a bunch of cute entities and now some of them are mine maybe\n I supposedly run this place, mostly for myself and a few close friends like half the extended polycule\n occasionally horny but always CWed\n \n 🐣 11.01.24\n :neocat_floof_estrogen: 22.09.24\n",

          avatar: 'https://not.an.evilcyberhacker.net/proxy/avatar.webp?url=https%3A%2F%2Fnot.an.evilcyberhacker.net%2Ffiles%2Fwebpublic-a5823ad4-2284-4eea-b8ee-0db646241918&avatar=1',
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        '@testuser@local': {
          localUserId: 'testuser',
          handle: '@testuser@local',

          url: null,

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

          url: 'https://coolserver.example.org/alice',

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

          url: 'https://kittens.example.org/@mittens',

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

          url: 'https://solarpunk.example.org/@jasper.shadow',

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

          url: 'https://corporate.example.org/@cfur',

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

        "https://wetdry.world/@astra_underscore/113522617022220742": {
          uri: "https://wetdry.world/@astra_underscore/113522617022220742",
          author: "@astra_underscore@wetdry.world",
          createdAt: "2024-11-21T02:30:00-04:00",
          updatedAt: "2024-11-21T02:34:00-04:00",
          sensitive: false,
          text: "robot girl that goes \"woop woop! woop woop! terrain! terrain! pull up! pull up!\" while tumbling down a flight of stairs",

          spoilerText: null,

          deletedAt: null,

          inReplyTo: null, // URI of post that this is replying to
          reblogOf: null,  // URI of post that this is a reblog of

          canonicalUrl: "https://wetdry.world/@astra_underscore/113522617022220742",

          language: "en-US",
          conversationId: "alice@coolserver/a-cool-article",

          local: false,
        },

        "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl": {
          uri: "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl",
          author: "@darkphoenix@not.an.evilcyberhacker.net",
          createdAt: "2024-11-21T07:37:00+01:00",
          updatedAt: "2024-11-21T07:37:00+01:00",
          sensitive: false,
          text: "@astra_underscore@wetdry.world i can hear this in my brain",

          spoilerText: null,

          deletedAt: null,

          inReplyTo: "https://wetdry.world/@astra_underscore/113522617022220742",
          reblogOf: null,  // URI of post that this is a reblog of

          canonicalUrl: "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl",

          language: "en-US",
          conversationId: "alice@coolserver/a-cool-article",

          local: false,
        },
      };

      this.popularPosts = [
        { uri: "alice@coolserver/a-cool-article", updatedAt: "2024-11-21T14:46:26-05:00" },
        { uri: "https://wetdry.world/@astra_underscore/113522617022220742", updatedAt: "2024-11-21T02:34:00-04:00" },
      ];

      localStorage.setItem('accounts', JSON.stringify(this.accounts));
      localStorage.setItem('sessions', JSON.stringify(this.sessions));
      localStorage.setItem('people', JSON.stringify(this.people));
      localStorage.setItem('posts', JSON.stringify(this.posts));
      localStorage.setItem('popularPosts', JSON.stringify(this.popularPosts));
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
  }
}

export default Database;
