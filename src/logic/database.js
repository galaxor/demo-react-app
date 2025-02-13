import testData from './testData.js'

class Database {
  constructor() {
    console.log("Opening database like you asked.");
    const dbRequest = indexedDB.open("database2", 1);
    dbRequest.onupgradeneeded = this.onUpgradeNeeded.bind(this);

    this.openPromise = new Promise((resolve, reject) => {
      dbRequest.onsuccess = event => {
        resolve(event.target.result);
      };

      dbRequest.onerror = event => {
        console.error("Couldn't open database", event);
        reject(event);
      };
    });
  }

  async open() {
    return this.openPromise;
  }

  // Filling the database with initial test data.
  fillTestData(db, transaction) {
    const accountsStore = transaction.objectStore("accounts");
    for (const [userName, account] of Object.entries(testData.accounts)) {
      accountsStore.add({userName, handle: account.handle});
    }

    const peopleStore = transaction.objectStore("people");
    for (const person of Object.values(testData.people)) {
      peopleStore.add(person);
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

    return new Promise(resolve => {
      transaction.oncomplete = event => resolve();
    });
  }

  onUpgradeNeeded(event) {
    const db = event.target.result;
    const transaction = event.target.transaction;

    console.log("Upgrading");
    console.log(event);

    if (event.oldVersion < 1 && event.newVersion >= 1) {
      console.log("Initializing");

      // Brand new database.  Initialize it.
      db.onerror = e => console.error("Error initializing database", e);
      const accounts = db.createObjectStore("accounts", { keyPath: "userName" });
      accounts.createIndex("handle", "handle");

      const boosts = db.createObjectStore("boosts", { autoIncrement: true });
      boosts.createIndex("booster", "booster");
      boosts.createIndex("boostersPost", "boostersPost");
      boosts.createIndex("boostedPost", "boostedPost");
      
      const follows = db.createObjectStore("follows", { autoIncrement: true });
      follows.createIndex("follower", "follower");
      follows.createIndex("followed", "followed");

      const images = db.createObjectStore("images", { keyPath: "hash" });

      const imageVersions = db.createObjectStore("imageVersions", { keyPath: ["postUri", "updatedAt"] });
      imageVersions.createIndex("postUri", "postUri");
      imageVersions.createIndex("updatedAt", "updatedAt");
      imageVersions.createIndex("fileName", "fileName");
      imageVersions.createIndex("imageHash", "imageHash");

      const sessions = db.createObjectStore("sessions", { keyPath: "sessionId" });
      sessions.createIndex("userName", "userName");
      sessions.createIndex("startedAt", "startedAt");

      const people = db.createObjectStore("people", { keyPath: "handle" });
      people.createIndex("localUserId", "localUserId");
      people.createIndex("url", "url");
      people.createIndex("displayName", "displayName");

      const posts = db.createObjectStore("posts", { keyPath: "uri" });
      posts.createIndex("uri", "uri");
      posts.createIndex("author", "author");
      posts.createIndex("createdAt", "createdAt");
      posts.createIndex("updatedAt", "updatedAt");
      posts.createIndex("deletedAt", "deletedAt");
      posts.createIndex("inReplyTo", "inReplyTo");
      posts.createIndex("canonicalUrl", "canonicalUrl");
      posts.createIndex("conversationId", "conversationId");
      posts.createIndex("local", "local");

      const postVersions = db.createObjectStore("postVersions", { keyPath: ["uri", "updatedAt"] });
      postVersions.createIndex("uri", "uri");
      postVersions.createIndex("updatedAt", "updatedAt");

      const reactions = db.createObjectStore("reactions", { autoIncrement: true });
      reactions.createIndex("reactorHandle", "reactorHandle");
      reactions.createIndex("reactingTo", "reactingTo");
      reactions.createIndex("createdAt", "createdAt");

      this.fillTestData(db, transaction);
    }
  }

  nullPerson() {
    return {
      localUserId: null,
      handle: null,
      url: null,
      displayName: null,
      bio: null,
      avatar: null,
      avatarOrig: null,
      avatarPosition: {x: 0, y: 0},
      avatarRotate: 0,
      avatarScale: 1,
      skinTonePref: "neutral",
    };
  }

  nullVersion() {
    return {
      uri: null,
      updatedAt: "1970-01-01T00:00:00Z",
      sensitive: false,
      spoilerText: null,
      language: null,
      type: "text",
      text: null,
    };
  }

  nullPost() {
    return {
      uri: null,
      author: null,
      createdAt: "1970-01-01T00:00:00Z",
      updatedAt: null,
      deletedAt: "1970-01-01T00:00:00Z",
      inReplyTo: null, // URI of post that this is replying to
      canonicalUrl: null,
      conversationId: null,
      local: false,
      authorPerson: this.nullPerson(),
      boostedPosts: [],

      ...this.nullVersion(),
    };
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
