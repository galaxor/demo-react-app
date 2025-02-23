export class PeopleDB {
  db = null;

  constructor(db) {
    this.db = db;
  }

  get(handle) {
    if (!handle) { throw new TypeError("Get which person?"); }
    return this.db.get('people', handle);
  }

  async whoFollowsThem(handle) {
    if (!handle) { throw new TypeError("We're asking who follows someone, but we don't know who someone is."); }

    const transaction = this.db.db.transaction(["follows", "people"]);
    const followsStore = transaction.objectStore("follows");
    const peopleStore = transaction.objectStore("people");

    return new Promise(resolve => {
      const followers = [];
      followsStore.index("followed").openCursor(handle).onsuccess = event => {
        const followsCursor = event.target.result;
        if (followsCursor === null) {
          resolve(followers);
        } else {
          followers.push(followsCursor.value);
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
      followsStore.index("follower").openCursor(handle).onsuccess = event => {
        const followsCursor = event.target.result;
        if (followsCursor === null) {
          resolve(follows);
        } else {
          follows.push(followsCursor.value);
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

  follow(personWhoFollows, personWhoIsFollowed) {
    if (this.doesXFollowY(personWhoFollows, personWhoIsFollowed)) {
      // It's a no-op. It has already been done.
      return;
    } else {
      this.db.addRow('follows', [personWhoFollows, personWhoIsFollowed]);
    }
  }

  unfollow(personWhoOnceFollowed, personWhoWasOnceFollowed) {
    this.db.delRow('follows', (([a, b]) => {
      const result = (personWhoOnceFollowed === a && personWhoWasOnceFollowed === b);
      return result;
    }));
  }
}

export function getPersonLoader(db) {
  return ({params}) => {
    const peopleDB = new PeopleDB(db);

    const person = peopleDB.get(params.handle);

    return { person };
  };
}
