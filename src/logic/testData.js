import sha256 from '../include/sha256.js'

// In case we're deployed in a subdirectory.
// Set VITE_PATH_PREFIX in .env, .env.development, or .env.production.
// The BASE_URL here will be set by vite.config.js, either when running the dev
// server or building for deployment.
// We use the prefix to find the test image files.
const prefix=import.meta.env.BASE_URL.replace(/\/+$/, '');

const testData = {
  accounts: {
    'testuser': {
      handle: '@testuser@local',
    },
  },

  people: {
    '@astra_underscore@wetdry.world': {
      localUserId: null,
      handle: '@astra_underscore@wetdry.world',

      url: 'https://wetdry.world/@astra_underscore',
      
      displayName: 'Astra Underscore',
      bio: "Hello, my name is Astra! I am a trans girl from Chile born in '01 who loves computing, drawing, writing, and research!\n\n#ACAB #BlackLivesMatter\n\nI love chatting, so just DM me if you want to talk c:",

      avatar: prefix+"/astra_underscore.png",
      avatarOrig: null,
      avatarPosition: {x: 0, y: 0},
      avatarRotate: 0,
      avatarScale: 1,

      skinTonePref: "neutral",
    },

    '@darkphoenix@not.an.evilcyberhacker.net': {
      localUserId: null,
      handle: '@darkphoenix@not.an.evilcyberhacker.net',

      url: 'https://not.an.evilcyberhacker.net/@darkphoenix',

      displayName: 'Ash',
      bio: " darkphoenix@disaster.queer:/mnt/gay/agenda# :idle:\n everyone's favourite chaotic bi poly disaster queer (accept no substitutes) :neofox_flag_bi: :neofox_flag_polyam: :neofox_flag_nb: :neofox_flag_genderfluid: :neofox_flag_trans:\n chaotic neutral\n queer as in fuck you\n too hot to be gender solid\n \"a boy for meme purposes roughly 50% of the time\"\n \"train slut\"\n AuDHD haver (confirmed)\n just another train and computer geek really\n probably passing through your area by train at this very moment\n most certainly the best worst thing that hasn't happened to you yet\n flirting okay unless i tell you otherwise; please tell me I'm cute\n has bitten a bunch of cute entities and now some of them are mine maybe\n I supposedly run this place, mostly for myself and a few close friends like half the extended polycule\n occasionally horny but always CWed\n \n 🐣 11.01.24\n :neocat_floof_estrogen: 22.09.24\n",

      avatar: prefix+'/darkphoenix.png',
      avatarOrig: null,
      avatarPosition: {x: 0, y: 0},
      avatarRotate: 0,
      avatarScale: 1,

      skinTonePref: "neutral",
    },

    '@testuser@local': {
      localUserId: 'testuser',
      handle: '@testuser@local',

      url: null,

      displayName: 'Test User',
      bio: "I love testing websites!",

      avatar: prefix+'/puppy-avatar.png',
      avatarOrig: prefix+'/puppy.jpg',
      avatarAltText: "A cute puppy",
      avatarPosition: { x: 0.5360000000000001, y: 0.42666666666666675 },
      avatarRotate: 0,
      avatarScale: 1.5,

      skinTonePref: "neutral",
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

      skinTonePref: "neutral",
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

      skinTonePref: "neutral",
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

      skinTonePref: "neutral",
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

      skinTonePref: "neutral",
    }
  },

  follows: [
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
  ],

  postVersions: {
    "@alice@local/a-cool-article": {
      "2024-11-21T14:46:26-05:00": {
        uri: "@alice@local/a-cool-article",
        updatedAt: "2024-11-21T14:46:26-05:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        type: "text",
        text: "This is my post about stuff.",
      },
    },

    "@alice@local/has-anyone-seen-bob": {
      "2024-11-24T13:41:26-05:00": {
        uri: "@alice@local/has-anyone-seen-bob",
        updatedAt: "2024-11-24T13:41:26-05:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        type: "text",
        text: "I've been trying to reach Bob.  I have a message to send him.  Has anyone seen him?  Feel free to boost for reach.",
      }
    },

    "https://wetdry.world/@astra_underscore/113522617022220742": {
      "2024-11-21T02:32:00-04:00": {
        uri: "https://wetdry.world/@astra_underscore/113522617022220742",
        updatedAt: "2024-11-21T02:32:00-04:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        type: "text",
        text: "robot girl that goes woop woop! woop woop! terrain! terrain! pull up! pull up! while tumbling down a flight of stairs",
      },
      "2024-11-21T02:34:00-04:00": {
        uri: "https://wetdry.world/@astra_underscore/113522617022220742",
        updatedAt: "2024-11-21T02:34:00-04:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        type: "text",
        text: "robot girl that goes \"woop woop! woop woop! terrain! terrain! pull up! pull up!\" while tumbling down a flight of stairs",
      },
    },

    "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl": {
      "2024-11-21T07:37:00+01:00": {
        uri: "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl",
        updatedAt: "2024-11-21T07:37:00+01:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        type: "text",
        text: "@astra_underscore@wetdry.world i can hear this in my brain",
      }
    },

    "testuser@local/same": {
      "2024-11-23T00:50:00-05:00": {
        uri: "testuser@local/same",
        updatedAt: "2024-11-23T00:50:00-05:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        type: "text",
        text: "@darkphoenix@not.an.evilcyberhacker.net same",
      }
    },

    "@cfur@corporate/boost-a-cool-article": {
      "2024-11-24T12:16:31-05:00": {
        uri: "@cfur@corporate/boost-a-cool-article",
        updatedAt: "2024-11-24T12:16:31-05:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        text: null,
      }
    },

    "@cfur@corporate/help-alice-find-bob": {
      "2024-11-24T13:44:31-05:00": {
        uri: "@cfur@corporate/help-alice-find-bob",
        updatedAt: "2024-11-24T13:44:31-05:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        type: "text",
        text: "If anyone knows where Bob is, please let @alice@local know!\n\nI don't want their drama to stop, I am addicted to the antics of those two!",
      },
    },

    "@mittens@kittens/sayori-dating-zoning": {
      "2024-01-30T22:16:00-05:00": {
        uri: "@mittens@kittens/sayori-dating-zoning",
        updatedAt: "2024-01-30T22:16:00-05:00",
        sensitive: false,
        spoilerText: null,
        language: "en-US",
        text: "Hee hee.",
      },
    },
  },

  posts: {
    "@alice@local/a-cool-article": {
      uri: "@alice@local/a-cool-article",
      author: "@alice@local",
      createdAt: "2024-11-21T14:46:26-05:00",
      updatedAt: "2024-11-21T14:46:26-05:00",
      deletedAt: null,
      inReplyTo: null, // URI of post that this is replying to
      canonicalUrl: null,
      conversationId: null,
      local: true,
    },

    "@alice@local/has-anyone-seen-bob": {
      uri: "@alice@local/has-anyone-seen-bob",
      author: "@alice@local",
      createdAt: "2024-11-24T13:41:26-05:00",
      updatedAt: "2024-11-24T13:41:26-05:00",
      deletedAt: null,
      inReplyTo: null, // URI of post that this is replying to
      canonicalUrl: null,
      conversationId: null,
      local: true,
    },

    "https://wetdry.world/@astra_underscore/113522617022220742": {
      uri: "https://wetdry.world/@astra_underscore/113522617022220742",
      author: "@astra_underscore@wetdry.world",
      createdAt: "2024-11-21T02:30:00-04:00",
      updatedAt: "2024-11-21T02:34:00-04:00",
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
      deletedAt: null,
      inReplyTo: "https://wetdry.world/@astra_underscore/113522617022220742",
      canonicalUrl: "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl",
      conversationId: "https://wetdry.world/@astra_underscore/113522617022220742",
      local: false,
    },

    "testuser@local/same": {
      uri: "testuser@local/same",
      author: "@testuser@local",
      createdAt: "2024-11-23T00:50:00-05:00",
      updatedAt: "2024-11-23T00:50:00-05:00",
      sensitive: false,
      deletedAt: null,
      inReplyTo: "https://not.an.evilcyberhacker.net/notes/a0va3qltels602bl",
      canonicalUrl: "testuser@local/same",
      conversationId: "https://wetdry.world/@astra_underscore/113522617022220742",
      local: true,
    },

    "@cfur@corporate/boost-a-cool-article": {
      uri: "@cfur@corporate/boost-a-cool-article",
      author: "@cfur@corporate",
      createdAt: "2024-11-24T12:16:31-05:00",
      updatedAt: "2024-11-24T12:16:31-05:00",
      deletedAt: null,
      inReplyTo: null,
      canonicalUrl: "@cfur@corporate/boost-a-cool-article",
      conversationId: "@alice@local/a-cool-article",
      local: false,
    },

    "@cfur@corporate/help-alice-find-bob": {
      uri: "@cfur@corporate/help-alice-find-bob",
      author: "@cfur@corporate",
      createdAt: "2024-11-24T13:44:31-05:00",
      updatedAt: "2024-11-24T13:44:31-05:00",
      deletedAt: null,
      inReplyTo: null,
      canonicalUrl: "@cfur@corporate/help-alice-find-bob",
      conversationId: null,
      local: false,
    },

    "@mittens@kittens/sayori-dating-zoning": {
      uri: "@mittens@kittens/sayori-dating-zoning",
      author: "@mittens@kittens",
      createdAt: "2024-01-30T22:16:00-05:00",
      updatedAt: "2024-01-30T22:16:00-05:00",
      deletedAt: null,
      inReplyTo: null,
      canonicalUrl: "https://kittens.example.org/@mittens/sayori-dating-zoning",
      conversationId: null,
      local: false,
    },
  },

  images: {
    "5717c8b809d31df4dc8296ba2f3a9abde3b05b8742697be50cf834c5b37323b4": {
      data: "/sayori-dating-zoning.png",
    },
  },

  imageVersions: {
    "@mittens@kittens/sayori-dating-zoning": {
      "2024-01-30T22:16:00-05:00": {
        "sayori-dating-zoning.png": {
          image: "5717c8b809d31df4dc8296ba2f3a9abde3b05b8742697be50cf834c5b37323b4",
          altText: "Drake meme format, but with Sayori.\n\"Dating\": Sayori says no way.\n\"Rezoning your bed for higher occupancy\": Sayori says yes way, with fingerguns.",
          altTextLang: "en-US",
        },
      },
    },
  },

  // "Booster's post" has the authoritative information about the created/updated times of the boost.
  // It also may contain text.  If it does, this is a quote boost.
  // Also, a post may boost several posts simultaneously.
  // If a post has boost-attachments and no text, display as a boost, and don't include in "posts (no boosts)".
  // If a post has boost-attachments and text, display it as a quote boosts, and DO include it in "posts (no boosts)".
  boosts: [
    { booster: '@cfur@corporate', boostersPost: "@cfur@corporate/boost-a-cool-article", boostedPost: "@alice@local/a-cool-article" },
    { booster: '@cfur@corporate', boostersPost: "@cfur@corporate/help-alice-find-bob", boostedPost: "@alice@local/has-anyone-seen-bob" },
  ],

  reactions: [
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
  ],
};

// Filling the database with initial test data.
export default async function fillTestData(db) {
  const transaction = db.transaction(["accounts", "follows", "postVersions", "posts", "imageVersions", "boosts", "reactions"], "readwrite");

  return new Promise(async resolve => {
    const accountsStore = transaction.objectStore("accounts");
    for (const [userName, account] of Object.entries(testData.accounts)) {
      accountsStore.add({userName, handle: account.handle});
    }

    const followsStore = transaction.objectStore("follows");
    for (const [follower, followed] of testData.follows) {
      followsStore.add({follower, followed});
    }

    const postVersionsStore = transaction.objectStore("postVersions");
    for (const versionsOfPost of Object.values(testData.postVersions)) {
      for (const postVersion of Object.values(versionsOfPost)) {
        postVersionsStore.add(postVersion);
      }
    }

    const postsStore = transaction.objectStore("posts");
    for (const post of Object.values(testData.posts)) {
      postsStore.add(post);
    }

    // XXX do something special for images.

    const imageVersionsStore = transaction.objectStore("imageVersions");
    for (const [postUri, imageVersions] of Object.entries(testData.imageVersions)) {
      for (const [updatedAt, imageVersion] of Object.entries(imageVersions)) {
        for (const [fileName, imageVersionData] of Object.entries(imageVersion)) {
          const fullImageVersion = {...imageVersionData, fileName, updatedAt, postUri, imageHash: imageVersionData.image};
          delete fullImageVersion.image;
          imageVersionsStore.add(fullImageVersion);
        }
      }
    }

    const boostsStore = transaction.objectStore("boosts");
    for (const boost of testData.boosts) {
      boostsStore.add(boost);
    }

    const reactionsStore = transaction.objectStore("reactions");
    for (const reaction of testData.reactions) {
      reactionsStore.add(reaction);
    }

    // Every time we await, the transaction will be closed when we come back, so
    // we need a new transaction.
    for (const person of Object.values(testData.people)) {
      if (person.avatar !== null) {
        const response = await fetch(person.avatar);
        if (response.ok) {
          const blob = await response.blob();
          const imageBuffer = await blob.arrayBuffer();
          const hash = await sha256(imageBuffer);

          person.avatar = hash;

          const imgTransaction = db.transaction("images", "readwrite");
          const imagesStore = imgTransaction.objectStore("images");

          await imagesStore.put({hash, imageBlob: blob});

          const peopleTransaction = db.transaction("people", "readwrite");
          const peopleStore = peopleTransaction.objectStore("people");
          await peopleStore.add(person);
        }
      } else {
        const peopleTransaction = db.transaction("people", "readwrite");
        const peopleStore = peopleTransaction.objectStore("people");
        peopleStore.add(person);
      }
    }

    const testDataFilledTransaction = db.transaction("testDataFilled", "readwrite");
    const testDataFilledStore = testDataFilledTransaction.objectStore("testDataFilled");

    testDataFilledStore.add({ok:1}).onsuccess = event => {
      resolve();
    };
  });
}
