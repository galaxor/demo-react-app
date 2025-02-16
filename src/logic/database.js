import fillTestData from './testData.js'

class Database {
  constructor() {
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
    this.db = await this.openPromise;

    // See if the test data is filled.  If not, await fillTestData, which will set the "test data is filled" flag when it's done.
    const transaction = this.db.transaction("testDataFilled");
    const testDataFilledStore = transaction.objectStore("testDataFilled");

    const isDataFull = new Promise(async resolve => {
      testDataFilledStore.count().onsuccess = event => {
        resolve(event.target.result > 0);
      };
    });

    if (!(await isDataFull)) {
      await fillTestData(this.db);
    }
    return this;
  }

  async onUpgradeNeeded(event) {
    const db = event.target.result;
    const transaction = event.target.transaction;

    if (event.oldVersion < 1 && event.newVersion >= 1) {
      // Brand new database.  Initialize it.
      const accounts = db.createObjectStore("accounts", { keyPath: "userName" });
      accounts.createIndex("handle", "handle");

      const boosts = db.createObjectStore("boosts", { autoIncrement: true });
      boosts.createIndex("booster", "booster");
      boosts.createIndex("boostersPost", "boostersPost");
      boosts.createIndex("boostedPost", "boostedPost");
      boosts.createIndex("booster,boostedPost", ["booster", "boostedPost"]);
      
      const follows = db.createObjectStore("follows", { autoIncrement: true });
      follows.createIndex("follower", "follower");
      follows.createIndex("followed", "followed");
      follows.createIndex("follower,followed", ["follower", "followed"]);

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
      reactions.createIndex("reactorHandle,reactingTo", ["reactorHandle", "reactingTo"]);

      const testDataFilled = db.createObjectStore("testDataFilled", { keyPath: "ok" });
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

  async get(tableName, key) {
    const transaction = this.db.transaction(tableName);
    const table = transaction.objectStore(tableName);
    try {
      const getRequest = table.get(key);
      return await new Promise(resolve => {
        getRequest.onsuccess = event => {
          transaction.commit();
          resolve(event.target.result);
        };
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataError") {
        // The data didn't exist. No big deal.
        return undefined;
      } else {
        throw error;
      }
    }
  }

  // Get an object from an already-open object store.
  async getFromObjectStore(objectStore, key) {
    try {
      const getRequest = objectStore.get(key);
      return await new Promise(resolve => {
        getRequest.onsuccess = event => {
          resolve(event.target.result);
        };
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataError") {
        // The data didn't exist. No big deal.
        return undefined;
      } else {
        throw error;
      }
    }
  }

  async getImageDataUrl(imageHash) {
    const transaction = this.db.transaction("images");
    const imagesStore = transaction.objectStore("images");
    try {
      return await new Promise(resolve => {
        imagesStore.get(imageHash).onsuccess = event => {
          const imageRow = event.target.result;

          const fileReader = new FileReader()
          fileReader.onload = event => {
            resolve(event.target.result);
          };
          fileReader.readAsDataURL(imageRow.imageBlob);
        };
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "DataError") {
        // The data didn't exist. No big deal.
        return undefined;
      } else {
        throw error;
      }
    }
  }


  async set(tableName, key, value) {
    const transaction = this.db.transaction(tableName, "readwrite", {durability: "strict"});
    const table = transaction.objectStore(tableName);

    console.log("Trying to insert", key, value);
    const putRequest = table.put(value, key);
    return await new Promise(resolve => {
      putRequest.onsuccess = event => {
        transaction.commit();
        resolve(event.result);
      };
    });
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
