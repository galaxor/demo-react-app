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

          avatar: "/astra_underscore.png",
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

          avatar: '/darkphoenix.png',
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        '@testuser@local': {
          localUserId: 'testuser',
          handle: '@testuser@local',

          url: null,

          displayName: 'Test User',
          bio: "I love testing websites!",

          avatar: '/puppy-avatar.png',
          avatarOrig: '/puppy.jpg',
          avatarPosition: { x: 0.5360000000000001, y: 0.42666666666666675 },
          avatarRotate: 0,
          avatarScale: 1.5,
        },

        '@alice@local': {
          localUserId: 'alice',
          handle: '@alice@local',

          url: 'https://coolserver.example.org/alice',

          displayName: 'Alice (from cryptography)',
          bio: "I love being a party to private conversations!",

          avatar: null,
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        '@mittens@kittens': {
          localUserId: null,
          handle: '@mittens@kittens',

          url: 'https://kittens.example.org/@mittens',

          displayName: 'Mittens Chalk',
          bio: "Artisan, engineer, geologist, woodcutter.",

          avatar: null,
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        '@jasper.shadow@solarpunk': {
          localUserId: null,
          handle: '@jasper.shadow@solarpunk',

          url: 'https://solarpunk.example.org/@jasper.shadow',

          displayName: 'Jasper Shadow',
          bio: "I want to be a Geoengineer when I grow up. That's not a thing, but hopefully one day it will be.",

          avatar: null,
          avatarOrig: null,
          avatarPosition: {x: 0, y: 0},
          avatarRotate: 0,
          avatarScale: 1,
        },

        '@cfur@corporate': {
          localUserId: null,
          handle: '@cfur@corporate',

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

      this.follows = [
        ["@testuser@local", '@astra_underscore@wetdry.world'],
        ["@testuser@local", '@alice@local'],
        ["@astra_underscore@wetdry.world", '@darkphoenix@not.an.evilcyberhacker.net'],
        ['@astra_underscore@wetdry.world', "@testuser@local"],
        ["@testuser@local", '@darkphoenix@not.an.evilcyberhacker.net'],
        ['@cfur@corporate', '@alice@local'],
        ['@cfur@corporate', '@testuser@local'],
        ['@alice@local', '@cfur@corporate'],
        ['@alice@local', '@jasper.shadow@solarpunk'],
        ['@mittens@kittens', '@alice@local'],
        ['@jasper.shadow@solarpunk', '@alice@local'],
      ];

      this.posts = {
        "@alice@local/a-cool-article": {
          uri: "@alice@local/a-cool-article",
          author: "@alice@local",
          createdAt: "2024-11-21T14:46:26-05:00",
          updatedAt: "2024-11-21T14:46:26-05:00",
          sensitive: false,
          text: "This is my post about stuff.",

          spoilerText: null,

          deletedAt: null,

          inReplyTo: null, // URI of post that this is replying to

          canonicalUrl: null,

          language: "en-US",
          conversationId: null,

          local: true,
        },

        "@alice@local/has-anyone-seen-bob": {
          uri: "@alice@local/has-anyone-seen-bob",
          author: "@alice@local",
          createdAt: "2024-11-24T13:41:26-05:00",
          updatedAt: "2024-11-24T13:41:26-05:00",
          sensitive: false,
          text: "I've been trying to reach Bob.  I have a message to send him.  Has anyone seen him?  Feel free to boost for reach.",

          spoilerText: null,

          deletedAt: null,

          inReplyTo: null, // URI of post that this is replying to

          canonicalUrl: null,

          language: "en-US",
          conversationId: null,

          local: true,
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

          canonicalUrl: "https://wetdry.world/@astra_underscore/113522617022220742",

          language: "en-US",
          conversationId: null,

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

          canonicalUrl: "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl",

          language: "en-US",
          conversationId: "https://wetdry.world/@astra_underscore/113522617022220742",

          local: false,
        },

        "testuser@local/same": {
          uri: "testuser@local/same",
          author: "@testuser@local",
          createdAt: "2024-11-23T00:50:00-05:00",
          updatedAt: "2024-11-23T00:50:00-05:00",
          sensitive: false,
          text: "@darkphoenix@not.an.evilcyberhacker.net same",

          spoilerText: null,

          deletedAt: null,

          inReplyTo: "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl",

          canonicalUrl: "testuser@local/same",

          language: "en-US",
          conversationId: "https://wetdry.world/@astra_underscore/113522617022220742",

          local: true,
        },

        "@cfur@corporate/boost-a-cool-article": {
          uri: "@cfur@corporate/boost-a-cool-article",
          author: "@cfur@corporate",
          createdAt: "2024-11-24T12:16:31-05:00",
          updatedAt: "2024-11-24T12:16:31-05:00",
          sensitive: false,
          text: null,

          spoilerText: null,

          deletedAt: null,

          inReplyTo: null,

          canonicalUrl: "@cfur@corporate/boost-a-cool-article",

          language: "en-US",
          conversationId: "@alice@local/a-cool-article",

          local: false,
        },

        "@cfur@corporate/help-alice-find-bob": {
          uri: "@cfur@corporate/help-alice-find-bob",
          author: "@cfur@corporate",
          createdAt: "2024-11-24T13:44:31-05:00",
          updatedAt: "2024-11-24T13:44:31-05:00",
          sensitive: false,
          text: "If anyone knows where Bob is, please let @alice@local know!  I am addicted to their antics!",

          spoilerText: null,

          deletedAt: null,

          inReplyTo: null,

          canonicalUrl: "@cfur@corporate/help-alice-find-bob",

          language: "en-US",
          conversationId: null,

          local: false,
        },
      };

      // "Booster's post" has the authoritative information about the created/updated times of the boost.
      // It also may contain text.  If it does, this is a quote boost.
      // Also, a post may boost several posts simultaneously.
      // If a post has boost-attachments and no text, display as a boost, and don't include in "posts (no boosts)".
      // If a post has boost-attachments and text, display it as a quote boosts, and DO include it in "posts (no boosts)".
      this.boosts = [
        { booster: '@cfur@corporate', boostersPost: "@cfur@corporate/boost-a-cool-article", boostedPost: "@alice@local/a-cool-article" },
        { booster: '@cfur@corporate', boostersPost: "@cfur@corporate/help-alice-find-bob", boostedPost: "@alice@local/has-anyone-seen-bob" },
      ];

      this.popularPosts = [
        { uri: "@alice@local/a-cool-article", updatedAt: "2024-11-21T14:46:26-05:00" },
        { uri: "https://wetdry.world/@astra_underscore/113522617022220742", updatedAt: "2024-11-21T02:34:00-04:00" },
      ];

      this.reactions = [
        {
          reactorHandle: '@testuser@local',
          reactingTo: "https://wetdry.world/@astra_underscore/113522617022220742",
          // The type field can be one of: "like", "dislike", "unicode", "react"
          // If it's "dislike", that's a Lemmy downvote.
          // If it's "unicode", then the unicode field should have one unicode emoji in it.
          // If it's "react", then reactname will be something like "neofox"
          //   and the server will be whatever server neofox comes from.
          //   I don't really know how that works, that's just what I gleaned
          //   from looking at misskey, which I want to interact with.
          type: "unicode",
          unicode: "😂",
          reactName: null,
          reactServer: null,
          reactURL: null,
          altText: null,
          createdAt: "2024-11-24T17:11:11-0500",
        },

        {
          reactorHandle: '@darkphoenix@not.an.evilcyberhacker.net',
          reactingTo: "https://wetdry.world/@astra_underscore/113522617022220742",
          type: "like",
          unicode: null,
          reactName: null,
          reactServer: null,
          reactURL: null,
          altText: null,
          createdAt: "2024-11-21T07:35:00+01:00",
        },

        {
          reactorHandle: '@cfur@corporate',
          reactingTo: '@alice@local/a-cool-article',
          type: "like",
          unicode: null,
          reactName: null,
          reactServer: null,
          reactURL: null,
          altText: null,
          createdAt: "2024-11-24T12:16:30-05:00",
        },

        {
          reactorHandle: '@cfur@corporate',
          reactingTo: '@alice@local/has-anyone-seen-bob',
          type: "like",
          unicode: null,
          reactName: null,
          reactServer: null,
          reactURL: null,
          altText: null,
          createdAt: "2024-11-24T13:44:30-05:00",
        },
      ];

      localStorage.setItem('accounts', JSON.stringify(this.accounts));
      localStorage.setItem('boosts', JSON.stringify(this.boosts));
      localStorage.setItem('follows', JSON.stringify(this.follows));
      localStorage.setItem('sessions', JSON.stringify(this.sessions));
      localStorage.setItem('people', JSON.stringify(this.people));
      localStorage.setItem('posts', JSON.stringify(this.posts));
      localStorage.setItem('popularPosts', JSON.stringify(this.popularPosts));
      localStorage.setItem('reactions', JSON.stringify(this.reactions));
    } else {
      this.accounts = JSON.parse(localStorage.getItem('accounts'));
      this.boosts = JSON.parse(localStorage.getItem('boosts'));
      this.follows = JSON.parse(localStorage.getItem('follows'));
      this.sessions = JSON.parse(localStorage.getItem('sessions'));
      this.people = JSON.parse(localStorage.getItem('people'));
      this.posts = JSON.parse(localStorage.getItem('posts'));
      this.popularPosts = JSON.parse(localStorage.getItem('popularPosts'));
      this.reactions = JSON.parse(localStorage.getItem('reactions'));
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

  addRow(table, row) {
    this[table].push(row);
    localStorage.setItem(table, JSON.stringify(this[table]));
  }

  // You pass a filter function that returns true for rows you want to delete.
  // We delete them.
  delRow(table, filterFn) {
    const newTable = this[table].filter((a) => {
      return !filterFn(a);
    });
    this[table] = newTable;
    localStorage.setItem(table, JSON.stringify(this[table]));
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
