export class PeopleDB {
  db = null;

  constructor(db) {
    this.db = db;
  }

  async get(handle) {
    if (!handle) { throw new TypeError("Get which person?"); }
    return await this.db.get('people', handle);
  }

  async getFromObjectStore(peopleStore, handle) {
    return await this.db.getFromObjectStore(peopleStore, handle);
  }

  async whoFollowsThem(handle) {
    if (!handle) { throw new TypeError("We're asking who follows someone, but we don't know who someone is."); }

    const transaction = this.db.db.transaction(["follows", "people"]);
    const followsStore = transaction.objectStore("follows");
    const peopleStore = transaction.objectStore("people");

    return new Promise(resolve => {
      const followers = [];
      followsStore.index("followed").openCursor(handle).onsuccess = async event => {
        const followsCursor = event.target.result;
        if (followsCursor === null) {
          followers.sort((a, b) => a.displayName === b.displayName? 0 : a.displayName < b.displayName? -1 : 1);
          resolve(followers);
        } else {
          const followRow = followsCursor.value;
          const person = await this.getFromObjectStore(peopleStore, followRow.follower);
          followers.push(person);
          followsCursor.continue();
        }
      };
    });
  }

  whoDoTheyFollow(handle) {
    if (!handle) { throw new TypeError("We're asking who someone follows, but we don't know who someone is."); }

    const transaction = this.db.db.transaction(["follows", "people"]);
    const followsStore = transaction.objectStore("follows");
    const peopleStore = transaction.objectStore("people");

    return new Promise(resolve => {
      const follows = [];
      followsStore.index("follower").openCursor(handle).onsuccess = async event => {
        const followsCursor = event.target.result;
        if (followsCursor === null) {
          follows.sort((a, b) => a.displayName === b.displayName? 0 : a.displayName < b.displayName? -1 : 1);
          resolve(follows);
        } else {
          const followRow = followsCursor.value;
          const person = await this.getFromObjectStore(peopleStore, followRow.followed);
          follows.push(person);
          followsCursor.continue();
        }
      };
    });
  }

  async doesXFollowY(xHandle, yHandle) {
    const transaction = this.db.db.transaction("follows");
    const followsStore = transaction.objectStore("follows");
    return await new Promise(resolve => {
      try {
        followsStore.index("follower,followed").get([xHandle, yHandle]).onsuccess = event => {
          if (event.target.result) { resolve(true); }
          else { resolve(false); }
        };
      } catch(e) {
        throw new Error(`Dnt meet rq ${xHandle}, ${yHandle}`);
      }
    });
  }

  async follow(personWhoFollows, personWhoIsFollowed) {
    if (await this.doesXFollowY(personWhoFollows, personWhoIsFollowed)) {
      // It's a no-op. It has already been done.
      return;
    } else {
      const transaction = this.db.db.transaction("follows", "readwrite");
      const followsStore = transaction.objectStore("follows");
      return new Promise(resolve => {
        followsStore.add({follower: personWhoFollows, followed: personWhoIsFollowed}).onsuccess = event => {
          resolve();
        };
      });
    }
  }

  unfollow(personWhoOnceFollowed, personWhoWasOnceFollowed) {
    const transaction = this.db.db.transaction("follows", "readwrite");
    const followsStore = transaction.objectStore("follows");
    return new Promise(resolve => {
      followsStore.index("follower,followed").openCursor([personWhoOnceFollowed, personWhoWasOnceFollowed]).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor === null) {
          resolve();
        } else {
          cursor.delete().onsuccess = event => {
            cursor.continue();
          };
        }
      };
    });
  }
}

export function getPersonLoader(db) {
  return async ({params}) => {
    await db.open();
    const peopleDB = new PeopleDB(db);

    const person = await peopleDB.get(params.handle);

    return { person };
  };
}
